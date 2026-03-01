const STREAM_ID = '3d70848e9c'
const GRAPHQL_ENDPOINT = '/graphql'

/**
 * Fetches all models (branches) and their versions (commits) from the Speckle project.
 * Uses the existing /graphql proxy which injects the Speckle auth token.
 */
export async function fetchAllModelsAndVersions() {
  const query = `
    query {
      stream(id: "${STREAM_ID}") {
        name
        branches(limit: 100) {
          items {
            id
            name
            commits(limit: 100) {
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
    }
  `

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    throw new Error(`GraphQL errors: ${json.errors.map(e => e.message).join(', ')}`)
  }

  return json.data.stream
}

/**
 * Transforms raw GraphQL stream data into a structured format.
 * Filters out the 'globals' branch and sorts versions newest-first.
 */
export function transformModelsData(stream) {
  const models = (stream.branches?.items || [])
    .filter(branch => branch.name !== 'globals')
    .map(branch => ({
      id: branch.id,
      name: branch.name,
      versions: (branch.commits?.items || [])
        .map(commit => ({
          id: commit.id,
          referencedObject: commit.referencedObject,
          message: commit.message || '',
          createdAt: new Date(commit.createdAt),
          objectUrl: `/streams/${STREAM_ID}/objects/${commit.referencedObject}`,
        }))
        .sort((a, b) => b.createdAt - a.createdAt), // newest first
    }))
    .filter(model => model.versions.length > 0)

  const allDates = models
    .flatMap(m => m.versions.map(v => v.createdAt))
    .sort((a, b) => a - b)

  const dateRange =
    allDates.length > 0
      ? { min: allDates[0], max: allDates[allDates.length - 1] }
      : { min: new Date(), max: new Date() }

  return { streamName: stream.name || '', models, dateRange, timeline: allDates }
}

/**
 * Returns the latest version of every model (for the "Current" view).
 */
export function getLatestModels(models) {
  return models
    .map(model => ({ model, version: model.versions[0] }))
    .filter(entry => entry.version)
}

/**
 * For each model, finds the most recent version on or before targetDate.
 * Models with no version before targetDate are excluded.
 */
export function getModelsAtDate(models, targetDate) {
  return models
    .map(model => {
      const version = model.versions.find(v => v.createdAt <= targetDate)
      return version ? { model, version } : null
    })
    .filter(Boolean)
}
