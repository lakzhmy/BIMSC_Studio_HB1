/**
 * debug-gradient.mjs
 *
 * Diagnostic script for the gradient visualization pipeline.
 * Checks whether the Speckle GraphQL children query returns all objects
 * and inspects the data structure of each child (gradient_value, @element, etc.).
 *
 * Usage:
 *   Set SPECKLE_TOKEN in your .env file (or export it), then run:
 *     node debug-gradient.mjs
 */

import { config } from 'dotenv'
config() // loads .env into process.env

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SPECKLE_TOKEN = process.env.SPECKLE_TOKEN
if (!SPECKLE_TOKEN) {
  console.error('ERROR: SPECKLE_TOKEN is not set. Add it to .env or export it.')
  process.exit(1)
}

const GRAPHQL_URL = 'https://app.speckle.systems/graphql'
const PROJECT_ID = 'f91adc2f08'
const MANIFEST_MODEL_ID = '31f0fc18e2'
const VIZ_MODEL_ID = '470a5c84fa'

// ---------------------------------------------------------------------------
// Helper: run a GraphQL query against Speckle with Bearer auth
// ---------------------------------------------------------------------------
async function gql(query) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SPECKLE_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = await res.json()

  if (json.errors) {
    throw new Error(`GraphQL errors:\n${JSON.stringify(json.errors, null, 2)}`)
  }

  return json.data
}

// ---------------------------------------------------------------------------
// Helpers: pretty-print section headers
// ---------------------------------------------------------------------------
function header(title) {
  console.log('\n' + '='.repeat(70))
  console.log(` ${title}`)
  console.log('='.repeat(70))
}

function subheader(title) {
  console.log(`\n--- ${title} ---`)
}

// ---------------------------------------------------------------------------
// Step 1 & 2: Fetch latest manifest version + its root object
// ---------------------------------------------------------------------------
async function fetchManifestInfo() {
  header('STEP 1-2: Latest Manifest Version & Root Object')

  // 1. Get latest manifest version
  const versionData = await gql(`
    query {
      project(id: "${PROJECT_ID}") {
        model(id: "${MANIFEST_MODEL_ID}") {
          versions(limit: 1) {
            items {
              id
              referencedObject
              message
              createdAt
            }
          }
        }
      }
    }
  `)

  const manifestVersion = versionData.project.model.versions.items[0]
  console.log('Manifest version ID:', manifestVersion.id)
  console.log('Referenced object:  ', manifestVersion.referencedObject)
  console.log('Message:            ', manifestVersion.message)
  console.log('Created at:         ', manifestVersion.createdAt)

  // 2. Fetch root object data
  const rootData = await gql(`
    query {
      stream(id: "${PROJECT_ID}") {
        object(id: "${manifestVersion.referencedObject}") {
          data
        }
      }
    }
  `)

  const data = rootData.stream.object.data
  subheader('Root object data keys')
  console.log(Object.keys(data))

  subheader('source_version_id')
  console.log(data.source_version_id ?? '(not found)')

  subheader('property_name')
  console.log(data.property_name ?? '(not found)')

  return { manifestVersion, rootData: data }
}

// ---------------------------------------------------------------------------
// Step 3 & 4: Fetch latest viz version + its root object
// ---------------------------------------------------------------------------
async function fetchVizInfo() {
  header('STEP 3-4: Latest Visualization Version & Root Object')

  // 3. Get latest viz version
  const versionData = await gql(`
    query {
      project(id: "${PROJECT_ID}") {
        model(id: "${VIZ_MODEL_ID}") {
          versions(limit: 1) {
            items {
              id
              referencedObject
              message
              createdAt
            }
          }
        }
      }
    }
  `)

  const vizVersion = versionData.project.model.versions.items[0]
  console.log('Viz version ID:     ', vizVersion.id)
  console.log('Referenced object:  ', vizVersion.referencedObject)
  console.log('Message:            ', vizVersion.message)
  console.log('Created at:         ', vizVersion.createdAt)

  // 4. Fetch root object data
  const rootData = await gql(`
    query {
      stream(id: "${PROJECT_ID}") {
        object(id: "${vizVersion.referencedObject}") {
          data
        }
      }
    }
  `)

  const data = rootData.stream.object.data
  subheader('Root object data keys')
  console.log(Object.keys(data))

  subheader('global_min / global_max')
  console.log('global_min:', data.global_min ?? '(not found)')
  console.log('global_max:', data.global_max ?? '(not found)')

  subheader('Full root data (summary)')
  // Print a condensed view: skip any large nested arrays
  const summary = {}
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      summary[key] = `[Array of ${val.length} items]`
    } else if (typeof val === 'object' && val !== null) {
      summary[key] = `{Object with keys: ${Object.keys(val).join(', ')}}`
    } else {
      summary[key] = val
    }
  }
  console.log(JSON.stringify(summary, null, 2))

  return { vizVersion, rootData: data }
}

// ---------------------------------------------------------------------------
// Step 5-10: Fetch children and analyze structure
// ---------------------------------------------------------------------------
async function analyzeChildren(vizRootObjectId) {
  header('STEP 5-10: Children Analysis')

  // 5. Fetch children with totalCount (the app code does NOT query totalCount!)
  const QUERY_LIMIT = 2000
  const childrenData = await gql(`
    query {
      stream(id: "${PROJECT_ID}") {
        object(id: "${vizRootObjectId}") {
          children(depth: 2, limit: ${QUERY_LIMIT}) {
            totalCount
            objects {
              id
              data
            }
          }
        }
      }
    }
  `)

  const { totalCount, objects: children } = childrenData.stream.object.children

  // --- Step 7: totalCount vs returned count ---
  subheader('Step 7: totalCount vs returned count')
  console.log('totalCount (server): ', totalCount)
  console.log('Returned count:      ', children.length)
  if (children.length < totalCount) {
    console.log(
      '*** WARNING: Only received %d of %d children! The limit=%d is NOT enough. ***',
      children.length,
      totalCount,
      QUERY_LIMIT,
    )
    console.log(
      '*** The app uses limit=1000, so it would miss even more objects. ***',
    )
  } else {
    console.log('All children returned (limit is sufficient).')
  }

  // --- Step 8: Print first 3 children's full data ---
  subheader('Step 8: First 3 children - full data structure')
  for (let i = 0; i < Math.min(3, children.length); i++) {
    console.log(`\n  Child #${i} (id: ${children[i].id}):`)
    console.log(JSON.stringify(children[i].data, null, 4))
  }

  // --- Step 9: Count children with and without gradient_value ---
  subheader('Step 9: gradient_value presence')
  let withGradient = 0
  let withoutGradient = 0
  const withoutGradientExamples = []

  for (const child of children) {
    const d = child.data
    if (d && d.gradient_value !== undefined) {
      withGradient++
    } else {
      withoutGradient++
      if (withoutGradientExamples.length < 5) {
        withoutGradientExamples.push({
          id: child.id,
          dataKeys: d ? Object.keys(d) : '(null data)',
          speckle_type: d?.speckle_type ?? '(none)',
          totalChildrenCount: d?.totalChildrenCount,
        })
      }
    }
  }

  console.log('Children WITH gradient_value:   ', withGradient)
  console.log('Children WITHOUT gradient_value: ', withoutGradient)
  console.log(
    'Percentage with gradient_value:  ',
    ((withGradient / children.length) * 100).toFixed(1) + '%',
  )

  if (withoutGradientExamples.length > 0) {
    subheader('Examples of children WITHOUT gradient_value (up to 5)')
    for (const ex of withoutGradientExamples) {
      console.log(JSON.stringify(ex, null, 2))
    }
  }

  // --- Step 10: For children WITH gradient_value, inspect @element ---
  subheader('Step 10: @element structure for children WITH gradient_value (first 3)')
  let shown = 0
  for (const child of children) {
    if (shown >= 3) break
    const d = child.data
    if (d && d.gradient_value !== undefined) {
      const elementRef = d['@element']
      console.log(`\n  Child id: ${child.id}`)
      console.log('  gradient_value:', d.gradient_value)
      console.log('  property_value:', d.property_value)
      console.log('  bucket_label:  ', d.bucket_label)
      console.log('  @element type: ', typeof elementRef)
      console.log('  @element value:', JSON.stringify(elementRef, null, 4))

      // Show what the composable would extract
      const geometryId =
        elementRef?.referencedId ||
        (Array.isArray(elementRef) ? elementRef[0]?.referencedId : null) ||
        null
      console.log('  => extracted geometryId:', geometryId)
      shown++
    }
  }

  // --- Bonus: check for duplicate geometryIds ---
  subheader('Bonus: Duplicate geometryId check')
  const geometryIdCounts = new Map()
  for (const child of children) {
    const d = child.data
    if (d && d.gradient_value !== undefined) {
      const elementRef = d['@element']
      const geometryId =
        elementRef?.referencedId ||
        (Array.isArray(elementRef) ? elementRef[0]?.referencedId : null) ||
        null
      if (geometryId) {
        geometryIdCounts.set(geometryId, (geometryIdCounts.get(geometryId) || 0) + 1)
      }
    }
  }

  const duplicates = [...geometryIdCounts.entries()].filter(([, count]) => count > 1)
  console.log('Unique geometryIds:   ', geometryIdCounts.size)
  console.log('Duplicate geometryIds:', duplicates.length)
  if (duplicates.length > 0) {
    console.log('First 5 duplicates:')
    for (const [geoId, count] of duplicates.slice(0, 5)) {
      console.log(`  ${geoId} appears ${count} times`)
    }
  }

  // --- Bonus: children with gradient_value but NO extractable geometryId ---
  subheader('Bonus: Children with gradient_value but no extractable geometryId')
  let noGeoId = 0
  const noGeoIdExamples = []
  for (const child of children) {
    const d = child.data
    if (d && d.gradient_value !== undefined) {
      const elementRef = d['@element']
      const geometryId =
        elementRef?.referencedId ||
        (Array.isArray(elementRef) ? elementRef[0]?.referencedId : null) ||
        null
      if (!geometryId) {
        noGeoId++
        if (noGeoIdExamples.length < 3) {
          noGeoIdExamples.push({
            id: child.id,
            gradient_value: d.gradient_value,
            '@element': elementRef,
            allKeys: Object.keys(d),
          })
        }
      }
    }
  }
  console.log('Count:', noGeoId)
  if (noGeoIdExamples.length > 0) {
    console.log('Examples:')
    for (const ex of noGeoIdExamples) {
      console.log(JSON.stringify(ex, null, 2))
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Gradient Visualization Debugger')
  console.log('Project ID:  ', PROJECT_ID)
  console.log('Manifest ID: ', MANIFEST_MODEL_ID)
  console.log('Viz Model ID:', VIZ_MODEL_ID)

  try {
    const { rootData: manifestRoot } = await fetchManifestInfo()
    const { vizVersion, rootData: vizRoot } = await fetchVizInfo()

    await analyzeChildren(vizVersion.referencedObject)

    header('DONE')
    console.log('Script completed successfully.')
  } catch (err) {
    console.error('\nFATAL ERROR:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

main()
