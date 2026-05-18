<script lang="ts">
    import MiniSearch from 'minisearch';

    interface Package {
        name: string;
        url: string;
        description: string;
        stars: number;
        topics: string[];
        pushed_at: string;
        discovered_at: string;
        language?: string | null;
        license?: string | null;
        forks?: number;
    }

    interface Props {
        packages: Package[];
    }

    let {packages}: Props = $props();

    let sort = $state('relevance');
    let search = $state('');
    let debouncedSearch = $state('');
    let minStars = $state(0);
    let maxStars = $state(500);

    let activeSlug: string | null = $state(null);
    let readmeHtml: string | null = $state(null);
    let readmeLoading = $state(false);
    let readmeError: string | null = $state(null);

    const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
    const readmeCache = new Map<string, string | null>();

    let activePackage: Package | null = $derived(
        activeSlug ? byName.get(activeSlug) ?? null : null,
    );

    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const nowMs = Date.now();

    const miniSearch = $derived.by(() => {
        const ms = new MiniSearch<Package>({
            idField: 'name',
            fields: ['name', 'description', 'topics'],
            storeFields: ['stars', 'pushed_at'],
            extractField: (doc, field) => {
                if (field === 'topics') return ((doc as any).topics || []).join(' ');
                return (doc as any)[field] ?? '';
            },
            searchOptions: {
                prefix: true,
                fuzzy: 0.2,
                boost: {name: 3, topics: 2},
                combineWith: 'AND',
                boostDocument: (_id, _term, stored) => {
                    const stars = (stored?.stars as number) ?? 0;
                    const pushedAt = stored?.pushed_at as string | undefined;
                    const starBoost = Math.log10(1 + stars) * 0.5;
                    const ageMs = pushedAt
                        ? nowMs - new Date(pushedAt).getTime()
                        : ONE_YEAR_MS;
                    const recencyBoost = Math.max(0, 1 - ageMs / ONE_YEAR_MS) * 0.3;
                    return 1 + starBoost + recencyBoost;
                },
            },
        });
        ms.addAll(packages);
        return ms;
    });

    const byName = $derived(new Map(packages.map((p) => [p.name, p])));

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    $effect(() => {
        const value = search;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            debouncedSearch = value;
        }, 90);
        return () => clearTimeout(debounceTimer);
    });

    function packageHref(name: string): string {
        return `${BASE}/package/${name}/`;
    }

    async function loadReadme(slug: string): Promise<string | null> {
        if (readmeCache.has(slug)) return readmeCache.get(slug) ?? null;
        const res = await fetch(packageHref(slug));
        if (!res.ok) {
            readmeCache.set(slug, null);
            return null;
        }
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const article = doc.querySelector('.readme-prose');
        const inner = article ? article.innerHTML : null;
        readmeCache.set(slug, inner);
        return inner;
    }

    async function openSlideout(slug: string, pushState = true) {
        activeSlug = slug;
        readmeError = null;
        const cached = readmeCache.get(slug);
        readmeHtml = cached ?? null;
        readmeLoading = cached === undefined;

        if (pushState) {
            history.pushState({slug}, '', packageHref(slug));
        }

        if (typeof document !== 'undefined') {
            const body = document.querySelector('.slideout-body');
            if (body) body.scrollTop = 0;
        }

        if (cached === undefined) {
            try {
                const html = await loadReadme(slug);
                if (activeSlug !== slug) return;
                readmeHtml = html;
            } catch (e) {
                if (activeSlug !== slug) return;
                readmeError = (e as Error).message;
            } finally {
                if (activeSlug === slug) readmeLoading = false;
            }
        }
    }

    function closeSlideout(pushState = true) {
        activeSlug = null;
        readmeHtml = null;
        readmeLoading = false;
        readmeError = null;
        if (pushState) {
            history.pushState(null, '', BASE || '/');
        }
    }

    function handleCardClick(e: MouseEvent, name: string) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        openSlideout(name);
    }

    $effect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && activeSlug) closeSlideout();
        }
        function onPop(e: PopStateEvent) {
            const state = e.state as {slug?: string} | null;
            if (state?.slug) {
                openSlideout(state.slug, false);
            } else {
                closeSlideout(false);
            }
        }
        window.addEventListener('keydown', onKey);
        window.addEventListener('popstate', onPop);

        // Open from initial URL if /package/<slug>
        const prefix = `${BASE}/package/`;
        if (location.pathname.startsWith(prefix)) {
            const slug = location.pathname
                .slice(prefix.length)
                .replace(/\/$/, '');
            if (slug) {
                history.replaceState({slug}, '', location.pathname);
                openSlideout(slug, false);
            }
        }

        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('popstate', onPop);
        };
    });

    $effect(() => {
        if (typeof document === 'undefined') return;
        document.body.classList.toggle('no-scroll', !!activeSlug);
        return () => document.body.classList.remove('no-scroll');
    });


    function timeAgo(dateString: string): string {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
        return date.toLocaleDateString();
    }

    let filtered = $derived.by(() => {
        const query = debouncedSearch.trim();
        let result: Package[];
        let hasRelevance = false;

        if (query) {
            const hits = miniSearch.search(query, {
                filter: (r) => {
                    const stars = (r.stars as number) ?? 0;
                    return stars >= minStars && stars <= maxStars;
                },
            });
            result = hits
                .map((h) => byName.get(h.id as string))
                .filter((p): p is Package => !!p);
            hasRelevance = true;
        } else {
            result = packages.filter(
                (pkg) => pkg.stars >= minStars && pkg.stars <= maxStars,
            );
        }

        const effectiveSort =
            sort === 'relevance' ? (hasRelevance ? 'relevance' : 'discovered') : sort;

        if (effectiveSort !== 'relevance') {
            result.sort((a, b) => {
                switch (effectiveSort) {
                    case 'stars':
                        return b.stars - a.stars;
                    case 'updated':
                        return (
                            new Date(b.pushed_at).getTime() -
                            new Date(a.pushed_at).getTime()
                        );
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'discovered':
                    default:
                        return (
                            new Date(b.discovered_at).getTime() -
                            new Date(a.discovered_at).getTime()
                        );
                }
            });
        }

        return result;
    });
</script>

<nav class="z-10 -mt-12 mb-6">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div
                class="bg-zinc-900 rounded-xl shadow-2xl overflow-hidden font-mono text-sm ring-1 ring-white/10"
        >
            <div
                    class="flex items-center gap-2 px-5 py-3 bg-zinc-800/80 border-b border-zinc-700/50"
            >
                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="ml-2 text-zinc-400 text-xs">package-finder</span>
                <a
                        aria-label="GitHub Repository"
                        href="https://github.com/HelgeSverre/gh-packages-laravel"
                        target="_blank"
                        class="ml-auto text-zinc-500 hover:text-zinc-300 transition"
                >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path
                                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                    </svg>
                </a>
            </div>
            <div
                    class="px-5 py-6 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-zinc-300 leading-tight"
            >
                <span class="text-green-400">$</span>
                <span class="text-yellow-300">find</span>
                <span class="text-zinc-400">packages</span>
                <span class="text-pink-400">--sort</span><span class="text-zinc-400"
            >=</span
            ><select bind:value={sort} class="cmd-select" aria-label="Sort order">
                <option value="relevance">relevance</option>
                <option value="discovered">discovered</option>
                <option value="stars">stars</option>
                <option value="updated">updated</option>
                <option value="name">name</option>
            </select>
                <span class="text-pink-400">--min-stars</span><span class="text-zinc-400"
            >=</span
            ><input
                    type="number"
                    bind:value={minStars}
                    class="cmd-input w-12"
                    aria-label="Minimum stars"
            />
                <span class="text-pink-400">--max-stars</span><span class="text-zinc-400"
            >=</span
            ><input
                    type="number"
                    bind:value={maxStars}
                    class="cmd-input w-12"
                    aria-label="Maximum stars"
            />
                <span class="text-pink-400">--search</span><span class="text-zinc-400"
            >=</span
            ><span class="text-cyan-300">"</span><input
                    type="text"
                    bind:value={search}
                    placeholder="search..."
                    class="cmd-input w-32"
                    aria-label="Search packages"
            /><span class="text-cyan-300">"</span>
            </div>
        </div>
    </div>
</nav>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8">
    <div class="mb-4 text-sm text-zinc-500 font-mono">
        # Found {filtered.length} packages
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each filtered as pkg (pkg.name)}
            <a
                    href={packageHref(pkg.name)}
                    onclick={(e) => handleCardClick(e, pkg.name)}
                    class="group flex flex-col p-5 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-yellow-300 transition-all duration-200 border border-zinc-200 overflow-hidden focus-visible:outline-2 focus-visible:outline-yellow-500 focus-visible:outline-offset-2"
            >
                <div class="flex items-start justify-between gap-2">
                    <h2
                            class="font-semibold text-zinc-900 group-hover:text-yellow-600 transition truncate text-base"
                    >
                        {pkg.name}
                    </h2>
                    <span
                            class="flex items-center gap-1 text-sm text-zinc-500 whitespace-nowrap"
                    >
            <svg
                    class="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
            >
              <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
                        {pkg.stars}
          </span>
                </div>
                <p class="mt-2 text-sm text-zinc-600 line-clamp-2 flex-1">
                    {#if pkg.description}
                        {pkg.description}
                    {:else}
                        <span class="italic text-zinc-500">No description</span>
                    {/if}
                </p>
                <div class="mt-3 flex flex-wrap gap-1">
                    {#each (pkg.topics || []).slice(0, 3) as topic}
            <span
                    class="px-2 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded-full"
            >{topic}</span
            >
                    {/each}
                </div>
                <div class="mt-3 text-xs text-zinc-500">
                    Updated {timeAgo(pkg.pushed_at)}
                </div>
            </a>
        {/each}
    </div>
</main>

<div
        class="slideout-backdrop"
        class:open={!!activeSlug}
        onclick={() => closeSlideout()}
        aria-hidden="true"
></div>

<div
        class="slideout"
        class:open={!!activeSlug}
        role="dialog"
        aria-modal="true"
        aria-label="Package details"
>
    <header class="slideout-header">
        <div class="min-w-0 flex-1">
            {#if activePackage}
                <div class="font-mono text-xs text-yellow-900/70 truncate">
                    {activePackage.name}
                </div>
                <h2 class="font-bold text-zinc-900 truncate text-base sm:text-lg">
                    {activePackage.name.split('/')[1]}
                </h2>
            {/if}
        </div>
        <div class="flex items-center gap-2 shrink-0">
            {#if activePackage}
                <a
                        href={activePackage.url}
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition"
                >
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                </a>
            {/if}
            <button
                    type="button"
                    class="slideout-close"
                    aria-label="Close"
                    onclick={() => closeSlideout()}
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                </svg>
            </button>
        </div>
    </header>

    <div class="slideout-body" role="document">
        {#if activePackage}
            {#if activePackage.description}
                <p class="text-zinc-700 text-pretty mb-4">{activePackage.description}</p>
            {/if}
            <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-zinc-600 mb-4">
                <span class="inline-flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {activePackage.stars.toLocaleString()}
                </span>
                {#if activePackage.language}
                    <span>{activePackage.language}</span>
                {/if}
                {#if activePackage.license}
                    <span>{activePackage.license}</span>
                {/if}
                <span>Updated {timeAgo(activePackage.pushed_at)}</span>
            </div>
            {#if activePackage.topics && activePackage.topics.length > 0}
                <div class="flex flex-wrap gap-1.5 mb-6">
                    {#each activePackage.topics as topic}
                        <span class="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-900 rounded-full font-medium">
                            {topic}
                        </span>
                    {/each}
                </div>
            {/if}
            {#if readmeLoading}
                <div class="slideout-skeleton" aria-label="Loading README">
                    <div class="slideout-skeleton-line long"></div>
                    <div class="slideout-skeleton-line medium"></div>
                    <div class="slideout-skeleton-line block"></div>
                    <div class="slideout-skeleton-line long"></div>
                    <div class="slideout-skeleton-line long"></div>
                    <div class="slideout-skeleton-line medium"></div>
                </div>
            {:else if readmeError}
                <div class="text-red-600 text-sm py-8 text-center">
                    {readmeError}
                </div>
            {:else if readmeHtml}
                <article class="prose readme-prose max-w-none">
                    {@html readmeHtml}
                </article>
            {:else}
                <div class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
                    No README available for this package.
                </div>
            {/if}
        {/if}
    </div>
</div>
