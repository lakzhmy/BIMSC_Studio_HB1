const STREAM_ID = '08c875bbe4'
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

/**
 * Fetches versions of a specific model within a project.
 * Uses newer Speckle GraphQL terminology (project/model/versions).
 */
export async function fetchModelVersions(projectId, modelId, limit = 5) {
  const query = `
    query {
      project(id: "${projectId}") {
        model(id: "${modelId}") {
          versions(limit: ${limit}) {
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

  return json.data.project.model.versions.items
}

/**
 * Fetches a root object's data blob from Speckle.
 * Used to read metadata like global_min, global_max, source_version_id, etc.
 */
export async function fetchRootObject(projectId, objectId) {
  const query = `
    query {
      stream(id: "${projectId}") {
        object(id: "${objectId}") {
          data
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

  return json.data.stream.object.data
}

/**
 * Fetches children of an object (e.g., the @elements wrapper objects
 * containing gradient_value, property_value, bucket_label, and @element references).
 */
export async function fetchObjectChildren(projectId, objectId, depth = 2, limit = 1000) {
  const query = `
    query {
      stream(id: "${projectId}") {
        object(id: "${objectId}") {
          children(depth: ${depth}, limit: ${limit}) {
            objects {
              id
              data
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

  return json.data.stream.object.children.objects
}
