const fs = require('fs')
const csv = require('csv-parser')

/**
 * Loads ratings from the ratings CSV file and organizes them by movie ID.
 *
 * @async
 * @function loadRatings
 * @returns {Promise<Map<string, Array<object>>>} A promise that resolves to a Map where each key is a movie ID and the value is an array of rating objects.
 */
async function loadRatings () {
  const ratingsMap = new Map()

  return new Promise((resolve, reject) => {
    fs.createReadStream('./data/ratings_small.csv')
      .pipe(csv())
      .on('data', (row) => {
        try {
          const rating = {
            id: `${row.userId}-${row.movieId}`,
            score: parseFloat(row.rating),
            text: `User ${row.userId} rated this ${row.rating} stars`,
            movie_id: row.movieId
          }

          // Group ratings by movie_id
          if (!ratingsMap.has(row.movieId)) {
            ratingsMap.set(row.movieId, [])
          }
          ratingsMap.get(row.movieId).push(rating)
        } catch (err) {
          console.error('Error processing row for ratings:', err)
        }
      })
      .on('end', () => {
        console.log(`Loaded ratings for ${ratingsMap.size} movies`)
        resolve(ratingsMap)
      })
      .on('error', reject)
  })
}

module.exports = loadRatings
