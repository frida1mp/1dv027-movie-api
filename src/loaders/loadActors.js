const fs = require('fs')
const csv = require('csv-parser')

/**
 * Loads actors from the credits CSV file and links them to movie IDs.
 *
 * @async
 * @function loadActors
 * @returns {Promise<{movieActorsMap: Map<string, object[]>, allActors: object[]}>}
 * A promise that resolves with an object containing:
 * movieActorsMap: A Map where each key is a movie ID and the value is an array of actor objects.
 * allActors: An array of all unique actor objects.
 */
function loadActors () {
  return new Promise((resolve, reject) => {
    const movieActorsMap = new Map()
    const allActors = new Map() // key: actorId, value: actorObject

    fs.createReadStream('./data/credits_clean.csv')
      .pipe(csv())
      .on('data', (row) => {
        const movieId = row.id
        console.log('movie id', movieId)

        if (!movieId || !row.cast) {
          console.warn('Skipping row because id or cast is missing:', row)
          return // Skip this row
        }

        try {
          const castStr = row.cast.trim()
          console.log(`Movie ${movieId} cast string:`, castStr)

          const castArray = JSON.parse(castStr)
          if (!Array.isArray(castArray)) {
            console.warn(`Movie ${movieId} cast is not an array.`)
          }
          const actors = castArray.map(actor => {
            const actorId = `${actor.name}-${actor.cast_id || actor.credit_id}`
            console.log(`Processing actor ${actor.name} for movie ${movieId}`)
            const actorObj = { id: actorId, name: actor.name }
            if (!allActors.has(actorId)) {
              allActors.set(actorId, actorObj)
            }
            return actorObj
          })
          movieActorsMap.set(movieId, actors)
        } catch (err) {
          console.error(`Error parsing cast for movieId ${movieId}:`, err)
        }
      })
      .on('end', () => {
        console.log(`Loaded actors for ${movieActorsMap.size} movies`)
        resolve({ movieActorsMap, allActors: Array.from(allActors.values()) })
      })
      .on('error', (err) => reject(err))
  })
}

module.exports = loadActors
