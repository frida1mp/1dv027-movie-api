const fs = require('fs')
const csv = require('csv-parser')

/**
 * Loads movies from a CSV file, linking each movie with its actors and ratings.
 *
 * @async
 * @function loadMovies
 * @param {Map<string, Array>} movieActorsMap - A Map where keys are movie IDs and values are arrays of actor objects.
 * @param {Map<string, Array>} ratingsMap - A Map where keys are movie IDs and values are arrays of rating objects.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of movie objects.
 */
async function loadMovies (movieActorsMap, ratingsMap) {
  const movies = []

  return new Promise((resolve, reject) => {
    fs.createReadStream('./data/movies_metadata.csv')
      .pipe(csv())
      .on('data', (row) => {
        try {
          const id = row.id
          if (!id || isNaN(id)) return

          const movie = {
            id,
            title: row.title,
            release_year: parseInt(row.release_date?.split('-')[0]) || null,
            genre: row.genres,
            description: row.overview,
            actors: movieActorsMap.get(id) || [],
            ratings: ratingsMap.get(id) || []
          }

          movies.push(movie)
        } catch (err) {
          console.error(`Error processing row for movie id ${row.id}:`, err)
        }
      })
      .on('end', () => {
        console.log(`Loaded ${movies.length} movies with actors`)
        resolve(movies)
      })
      .on('error', reject)
  })
}

module.exports = loadMovies
