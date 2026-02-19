const fs = require("fs");
const path = require("path");

const PACKAGES_FILE = path.join(__dirname, "..", "data", "packages.json");
const STATS_FILE = path.join(__dirname, "..", "data", "stats.json");
const ARCHIVED_FILE = path.join(__dirname, "..", "data", "archived.json");

// Minimum stars to include (filter out empty repos)
const MIN_STARS = 0;
// Maximum stars (we want undiscovered gems, not already-popular ones)
const MAX_STARS = 500;
// Stale package archiving
const STALE_THRESHOLD_DAYS = 365;
const MAX_ARCHIVE_PER_RUN = 10;

// Multiple search queries for broader coverage
const SEARCH_QUERIES = [
  // Original broad query
  { q: "laravel+package+language:PHP", pages: 10 },
  // Topic-based discovery (catches well-tagged repos the keyword search misses)
  { q: "topic:laravel-package+language:PHP", pages: 5 },
  // Filament ecosystem
  { q: "topic:filament-plugin+language:PHP", pages: 2 },
  // Livewire ecosystem
  { q: "topic:livewire+language:PHP", pages: 3 },
];

async function fetchPage(query, page) {
  const url = `https://api.github.com/search/repositories?q=${query}&sort=updated&order=desc&per_page=100&page=${page}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "laravel-package-discovery",
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      }),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  return data.items || [];
}

async function fetchPagesInParallel(query, totalPages, concurrency = 3) {
  let allRepos = [];
  for (let i = 0; i < totalPages; i += concurrency) {
    const chunk = [];
    for (let j = i; j < Math.min(i + concurrency, totalPages); j++) {
      chunk.push(fetchPage(query, j + 1));
    }
    const results = await Promise.all(chunk);
    allRepos = allRepos.concat(results.flat());
    if (i + concurrency < totalPages) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return allRepos;
}

function transformRepo(repo) {
  return {
    name: repo.full_name,
    url: repo.html_url,
    description: repo.description || "",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics || [],
    language: repo.language,
    license: repo.license?.spdx_id || null,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    discovered_at: new Date().toISOString(),
  };
}

function loadExisting() {
  try {
    if (fs.existsSync(PACKAGES_FILE)) {
      return JSON.parse(fs.readFileSync(PACKAGES_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error loading existing packages:", e.message);
  }
  return {};
}

function loadArchived() {
  try {
    if (fs.existsSync(ARCHIVED_FILE)) {
      return JSON.parse(fs.readFileSync(ARCHIVED_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error loading archived packages:", e.message);
  }
  return {};
}

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error loading stats:", e.message);
  }
  return { runs: [], total_discovered: 0 };
}

async function main() {
  console.log("🔍 Fetching Laravel packages from GitHub...\n");

  // Load existing data
  const existing = loadExisting();
  const existingCount = Object.keys(existing).length;
  console.log(`📦 Existing packages: ${existingCount}`);

  // Fetch from all search queries
  let allRepos = [];
  const queryResults = {};

  for (const { q, pages } of SEARCH_QUERIES) {
    console.log(`\n🔎 Query: ${q} (${pages} pages)`);
    try {
      const repos = await fetchPagesInParallel(q, pages);
      queryResults[q] = repos.length;
      allRepos = allRepos.concat(repos);
      console.log(`   ✅ Got ${repos.length} results`);
      // Delay between queries to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    } catch (e) {
      console.error(`   ❌ Error: ${e.message}`);
      queryResults[q] = 0;
    }
  }

  // Deduplicate by full_name (case-insensitive)
  const seen = new Set();
  const dedupedRepos = [];
  for (const repo of allRepos) {
    const key = repo.full_name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      dedupedRepos.push(repo);
    }
  }

  console.log(`\n📥 Fetched ${allRepos.length} total results (${dedupedRepos.length} unique)`);

  // Filter and transform
  const filtered = dedupedRepos.filter(
    (repo) =>
      repo.stargazers_count >= MIN_STARS &&
      repo.stargazers_count <= MAX_STARS &&
      !repo.fork &&
      !repo.archived,
  );

  console.log(
    `✅ After filtering (${MIN_STARS}-${MAX_STARS} stars, no forks/archived): ${filtered.length}`,
  );

  // Track which packages were seen in this fetch
  const fetchedKeys = new Set(filtered.map((repo) => repo.full_name.toLowerCase()));

  // Merge with existing (existing data preserved, new data added)
  let newCount = 0;
  let updatedCount = 0;

  for (const repo of filtered) {
    const key = repo.full_name.toLowerCase();
    const transformed = transformRepo(repo);

    if (!existing[key]) {
      existing[key] = transformed;
      newCount++;
    } else {
      // Update metadata but keep original discovered_at
      const discoveredAt = existing[key].discovered_at;
      existing[key] = { ...transformed, discovered_at: discoveredAt };
      updatedCount++;
    }
  }

  // Archive stale packages
  const now = new Date();
  const archived = loadArchived();
  let archivedCount = 0;
  const keysToArchive = [];

  for (const [key, pkg] of Object.entries(existing)) {
    if (fetchedKeys.has(key)) continue;
    if (!pkg.pushed_at) continue;

    const pushedAt = new Date(pkg.pushed_at);
    const daysSincePush = (now - pushedAt) / (1000 * 60 * 60 * 24);

    if (daysSincePush > STALE_THRESHOLD_DAYS) {
      keysToArchive.push(key);
      if (keysToArchive.length >= MAX_ARCHIVE_PER_RUN) break;
    }
  }

  for (const key of keysToArchive) {
    archived[key] = {
      ...existing[key],
      archived_at: now.toISOString(),
      archive_reason: `Stale: not seen in search results and last pushed ${Math.floor((now - new Date(existing[key].pushed_at)) / (1000 * 60 * 60 * 24))} days ago`,
    };
    delete existing[key];
    archivedCount++;
  }

  console.log(`\n🆕 New packages: ${newCount}`);
  console.log(`🔄 Updated packages: ${updatedCount}`);
  if (archivedCount > 0) {
    console.log(`🗃️  Archived packages: ${archivedCount}`);
  }
  console.log(`📊 Total packages: ${Object.keys(existing).length}`);

  // Ensure data directory exists
  const dataDir = path.dirname(PACKAGES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save packages
  fs.writeFileSync(PACKAGES_FILE, JSON.stringify(existing, null, 2));
  console.log(`\n💾 Saved to ${PACKAGES_FILE}`);

  // Save archived
  if (archivedCount > 0) {
    fs.writeFileSync(ARCHIVED_FILE, JSON.stringify(archived, null, 2));
    console.log(`🗃️  Archived saved to ${ARCHIVED_FILE}`);
  }

  // Update stats
  const stats = loadStats();
  stats.runs.push({
    timestamp: new Date().toISOString(),
    fetched: allRepos.length,
    unique: dedupedRepos.length,
    new: newCount,
    updated: updatedCount,
    archived: archivedCount,
    total: Object.keys(existing).length,
    queries: queryResults,
  });
  // Keep only last 100 runs
  stats.runs = stats.runs.slice(-100);
  stats.total_discovered = Object.keys(existing).length;
  stats.last_run = new Date().toISOString();

  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  console.log(`📈 Stats updated`);

  // Generate markdown summary of recently discovered
  generateReadme(existing, stats);
}

function generateReadme(packages, stats) {
  const pkgList = Object.values(packages);

  // Sort by discovered_at desc for "new" section
  const recentlyDiscovered = [...pkgList]
    .sort((a, b) => new Date(b.discovered_at) - new Date(a.discovered_at))
    .slice(0, 50);

  // Sort by stars for "popular undiscovered" section
  const byStars = [...pkgList].sort((a, b) => b.stars - a.stars).slice(0, 30);

  // Sort by updated_at for "recently active"
  const recentlyActive = [...pkgList]
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 30);

  const md = `# Laravel Package Discovery

Auto-discovered Laravel packages from GitHub, updated every 6 hours.

**Total packages tracked:** ${pkgList.length}  
**Last updated:** ${stats.last_run}

## 📦 Recently Discovered

| Package | ⭐ | Description |
|---------|-----|-------------|
${recentlyDiscovered
  .slice(0, 20)
  .map(
    (p) =>
      `| [${p.name}](${p.url}) | ${p.stars} | ${(p.description || "").slice(0, 80)}${p.description?.length > 80 ? "..." : ""} |`,
  )
  .join("\n")}

## 🌟 Top Starred (Under ${MAX_STARS})

| Package | ⭐ | Description |
|---------|-----|-------------|
${byStars
  .slice(0, 20)
  .map(
    (p) =>
      `| [${p.name}](${p.url}) | ${p.stars} | ${(p.description || "").slice(0, 80)}${p.description?.length > 80 ? "..." : ""} |`,
  )
  .join("\n")}

## 🔥 Recently Active

| Package | ⭐ | Last Push | Description |
|---------|-----|-----------|-------------|
${recentlyActive
  .slice(0, 20)
  .map(
    (p) =>
      `| [${p.name}](${p.url}) | ${p.stars} | ${p.pushed_at?.slice(0, 10)} | ${(p.description || "").slice(0, 60)}${p.description?.length > 60 ? "..." : ""} |`,
  )
  .join("\n")}

---

## Stats

| Run | New | Updated | Total |
|-----|-----|---------|-------|
${stats.runs
  .slice(-10)
  .reverse()
  .map(
    (r) =>
      `| ${r.timestamp.slice(0, 16)} | ${r.new} | ${r.updated} | ${r.total} |`,
  )
  .join("\n")}

---

*Data stored in \`data/packages.json\`. Run \`node scripts/fetch-packages.js\` locally to update.*
`;

  fs.writeFileSync(path.join(__dirname, "..", "README.md"), md);
  console.log("📝 README.md generated");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
