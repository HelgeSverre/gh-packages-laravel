const fs = require('fs');
const path = require('path');

const PACKAGES_FILE = path.join(__dirname, '..', 'data', 'packages.json');
const STATS_FILE = path.join(__dirname, '..', 'data', 'stats.json');
const DOCS_DIR = path.join(__dirname, '..', 'docs');

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return {};
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function generateHTML(packages, stats) {
  const pkgList = Object.values(packages);
  
  const recentlyDiscovered = [...pkgList]
    .sort((a, b) => new Date(b.discovered_at) - new Date(a.discovered_at))
    .slice(0, 100);

  const topStarred = [...pkgList]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 100);

  const recentlyActive = [...pkgList]
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 100);

  const renderPackageCard = (pkg) => `
    <a href="${escapeHtml(pkg.url)}" target="_blank" class="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-medium text-gray-900 truncate">${escapeHtml(pkg.name)}</h3>
        <span class="flex items-center gap-1 text-sm text-yellow-600 whitespace-nowrap">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          ${pkg.stars}
        </span>
      </div>
      <p class="mt-1 text-sm text-gray-600 line-clamp-2">${escapeHtml(pkg.description) || '<span class="italic text-gray-400">No description</span>'}</p>
      <div class="mt-2 flex flex-wrap gap-1">
        ${(pkg.topics || []).slice(0, 4).map(t => 
          `<span class="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-full">${escapeHtml(t)}</span>`
        ).join('')}
      </div>
      <div class="mt-2 text-xs text-gray-400">
        Updated ${timeAgo(pkg.pushed_at)}
      </div>
    </a>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laravel Package Discovery</title>
  <meta name="description" content="Discover interesting Laravel packages updated recently but not yet super popular">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
    <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold">Laravel Package Discovery</h1>
      <p class="mt-2 text-indigo-100">Finding hidden gems in the Laravel ecosystem</p>
      <div class="mt-4 flex flex-wrap gap-4 text-sm">
        <div class="bg-white/10 rounded-lg px-3 py-1">
          <span class="font-semibold">${pkgList.length.toLocaleString()}</span> packages tracked
        </div>
        <div class="bg-white/10 rounded-lg px-3 py-1">
          Updated <span class="font-semibold">${timeAgo(stats.last_run)}</span>
        </div>
        <div class="bg-white/10 rounded-lg px-3 py-1">
          Auto-updates every <span class="font-semibold">6 hours</span>
        </div>
      </div>
    </div>
  </header>

  <nav class="sticky top-0 bg-white border-b shadow-sm z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex gap-6 overflow-x-auto py-3 text-sm font-medium">
        <a href="#recently-discovered" class="text-indigo-600 hover:text-indigo-800 whitespace-nowrap">Recently Discovered</a>
        <a href="#top-starred" class="text-gray-600 hover:text-gray-900 whitespace-nowrap">Top Starred</a>
        <a href="#recently-active" class="text-gray-600 hover:text-gray-900 whitespace-nowrap">Recently Active</a>
        <a href="https://github.com/HelgeSverre/gh-packages-laravel" class="ml-auto text-gray-600 hover:text-gray-900 whitespace-nowrap flex items-center gap-1" target="_blank">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
    
    <section id="recently-discovered">
      <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-2xl">📦</span> Recently Discovered
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${recentlyDiscovered.map(renderPackageCard).join('')}
      </div>
    </section>

    <section id="top-starred">
      <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-2xl">⭐</span> Top Starred (Under 500)
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${topStarred.map(renderPackageCard).join('')}
      </div>
    </section>

    <section id="recently-active">
      <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-2xl">🔥</span> Recently Active
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${recentlyActive.map(renderPackageCard).join('')}
      </div>
    </section>

  </main>

  <footer class="bg-gray-100 border-t mt-12">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
      <p>Data sourced from GitHub API. Updated every 6 hours via GitHub Actions.</p>
      <p class="mt-1">
        <a href="https://github.com/HelgeSverre/gh-packages-laravel" class="text-indigo-600 hover:underline">View source & raw data</a>
      </p>
    </div>
  </footer>

</body>
</html>`;
}

function main() {
  console.log('🏗️  Building static site...');
  
  const packages = loadJSON(PACKAGES_FILE);
  const stats = loadJSON(STATS_FILE);
  
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  const html = generateHTML(packages, stats);
  fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), html);
  
  console.log(`✅ Built docs/index.html (${Object.keys(packages).length} packages)`);
}

main();
