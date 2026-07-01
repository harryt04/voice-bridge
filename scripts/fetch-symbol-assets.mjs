/**
 * One-off script to resolve real icon assets for lib/aac/mulberry-symbols.json.
 *
 * For each symbol, tries to find a matching file in the real Mulberry Symbols
 * GitHub repo (CC BY-SA 4.0) and downloads it locally. Falls back to the
 * ARASAAC API (CC BY-NC-SA) for words Mulberry doesn't cover (mostly social
 * phrases like "thank you", "please", "yes", "no").
 *
 * Usage: node scripts/fetch-symbol-assets.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const REPO_TREE_URL =
  'https://api.github.com/repos/mulberrysymbols/mulberry-symbols/git/trees/master?recursive=1'
const MULBERRY_RAW_BASE =
  'https://raw.githubusercontent.com/mulberrysymbols/mulberry-symbols/master/EN'
const ARASAAC_SEARCH_URL = 'https://api.arasaac.org/api/pictograms/en/bestsearch'
const ARASAAC_IMAGE_BASE = 'https://static.arasaac.org/pictograms'

const JSON_PATH = path.join(process.cwd(), 'lib/aac/mulberry-symbols.json')
const OUTPUT_DIR = path.join(process.cwd(), 'public/symbols/mulberry')

// Words where Mulberry's British-English / suffix-heavy naming diverges from
// our labels enough that a normalization pass won't find them automatically.
const MANUAL_ALIASES = {
  mom: 'mum_parent',
  dad: 'dad_parent',
  bathroom: 'toilet',
}

function candidateFilenames(label) {
  const alias = MANUAL_ALIASES[label.toLowerCase()]
  const base = alias ?? label
  const underscored = base.replace(/[\s-]+/g, '_')
  const titleCased = underscored.charAt(0).toUpperCase() + underscored.slice(1)
  return [
    underscored,
    titleCased,
    `${underscored}_,_to`, // verb convention, e.g. want_,_to
    `${titleCased}_,_to`,
  ]
}

function normalizeKey(name) {
  return name.toLowerCase().replace(/_/g, ' ').trim()
}

async function fetchMulberryFilenames() {
  const res = await fetch(REPO_TREE_URL)
  if (!res.ok) throw new Error(`GitHub tree fetch failed: ${res.status}`)
  const data = await res.json()
  const files = data.tree
    .filter((entry) => entry.path.startsWith('EN/') && entry.path.endsWith('.svg'))
    .map((entry) => entry.path.slice('EN/'.length, -'.svg'.length))
  return new Set(files)
}

async function resolveMulberryMatch(label, filenameSet) {
  for (const candidate of candidateFilenames(label)) {
    if (filenameSet.has(candidate)) return candidate
  }
  // Loose fallback: normalize underscores to spaces and compare case-insensitively.
  const target = normalizeKey(label)
  for (const filename of filenameSet) {
    if (normalizeKey(filename) === target) return filename
  }
  return null
}

async function resolveArasaacMatch(label) {
  const res = await fetch(`${ARASAAC_SEARCH_URL}/${encodeURIComponent(label)}`)
  if (!res.ok) return null
  const results = await res.json()
  if (!Array.isArray(results) || results.length === 0) return null
  return results[0]._id
}

async function downloadFile(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(destPath, buffer)
}

async function main() {
  const symbols = JSON.parse(await fs.readFile(JSON_PATH, 'utf8'))
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  console.log('Fetching Mulberry repo file list...')
  const mulberryFilenames = await fetchMulberryFilenames()
  console.log(`Found ${mulberryFilenames.size} Mulberry SVG files.`)

  const unmatched = []
  const updated = []

  for (const symbol of symbols) {
    const mulberryMatch = await resolveMulberryMatch(symbol.label, mulberryFilenames)

    if (mulberryMatch) {
      const destPath = path.join(OUTPUT_DIR, `${symbol.id}.svg`)
      try {
        await downloadFile(`${MULBERRY_RAW_BASE}/${encodeURIComponent(mulberryMatch)}.svg`, destPath)
        updated.push({
          ...symbol,
          imageUrl: `/symbols/mulberry/${symbol.id}.svg`,
          source: 'mulberry',
        })
        console.log(`[mulberry] ${symbol.label} -> ${mulberryMatch}`)
        continue
      } catch (err) {
        console.warn(`[mulberry] download failed for ${symbol.label} (${mulberryMatch}): ${err.message}`)
      }
    }

    const arasaacId = await resolveArasaacMatch(symbol.label)
    if (arasaacId) {
      updated.push({
        ...symbol,
        imageUrl: `${ARASAAC_IMAGE_BASE}/${arasaacId}/${arasaacId}_500.png`,
        source: 'arasaac',
      })
      console.log(`[arasaac] ${symbol.label} -> pictogram ${arasaacId}`)
      continue
    }

    unmatched.push(symbol.label)
    updated.push(symbol) // leave as-is; onError fallback in UI will catch it
    console.warn(`[unmatched] ${symbol.label} - no source found, leaving original imageUrl`)
  }

  await fs.writeFile(JSON_PATH, JSON.stringify(updated, null, 2) + '\n')

  console.log(`\nDone. ${updated.length - unmatched.length}/${updated.length} symbols resolved.`)
  if (unmatched.length > 0) {
    console.log('Unmatched (still pointing at original/broken imageUrl):')
    unmatched.forEach((label) => console.log(`  - ${label}`))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
