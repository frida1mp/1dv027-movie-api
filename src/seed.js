require('dotenv').config()
const fs = require('fs')
const csv = require('csv-parser')
const mongoose = require('mongoose')

const Movie = require('./models/movie.js')
const Actor = require('./models/actor.js')
const Rating = require('./models/rating.js')

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/movie-api')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

/**
 * Seeds the database with movies, actors, and ratings data from CSV files.
 *
 * @returns {Promise<void>} A promise that resolves when seeding is complete.
 */
async function seed () {
  try {
    // Clear existing data
    await Movie.deleteMany()
    await Actor.deleteMany()
    await Rating.deleteMany()
    console.log('🧹 Cleared old data')

    // Load ratings into a map
    const ratingsMap = new Map()
    await new Promise((resolve, reject) => {
      fs.createReadStream('./data/ratings_small.csv')
        .pipe(csv())
        .on('data', (row) => {
          try {
            const rating = {
              userId: row.userId,
              score: parseFloat(row.rating),
              text: `User ${row.userId} rated this ${row.rating}`,
              movieId: row.movieId
            }
            if (!ratingsMap.has(row.movieId)) {
              ratingsMap.set(row.movieId, [])
            }
            ratingsMap.get(row.movieId).push(rating)
          } catch (error) {
            console.error('Error processing rating row:', error)
          }
        })
        .on('end', resolve)
        .on('error', (err) => {
          console.error('Error reading ratings CSV:', err)
          reject(err)
        })
    })
    console.log('Loaded ratings from CSV')

    // Load actors into a map
    const movieActorsMap = new Map()
    await new Promise((resolve, reject) => {
      fs.createReadStream('./data/credits_clean.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (!row.id || !row.cast) {
            console.warn('Skipping row because id or cast is missing:', row)
            return
          }
          try {
            const cast = JSON.parse(row.cast)
            // Limit to first 3 actors for each movie
            const actors = cast.slice(0, 3).map(actor => actor.name)
            movieActorsMap.set(row.id, actors)
          } catch (err) {
            console.error(`Error parsing actors for movie id ${row.id}:`, err)
          }
        })
        .on('end', resolve)
        .on('error', (err) => {
          console.error('Error reading credits CSV:', err)
          reject(err)
        })
    })
    console.log('✅ Loaded actors from CSV')

    // Load movie rows from CSV
    const movieRows = []
    await new Promise((resolve, reject) => {
      fs.createReadStream('./data/movies_metadata.csv')
        .pipe(csv())
        .on('data', (row) => {
          try {
            const id = parseInt(row.id)
            const title = row.title?.trim()
            const releaseYear = parseInt(row.release_date?.split('-')[0])
            if (!id || isNaN(id) || !title || !releaseYear) return

            movieRows.push({
              id: row.id,
              title,
              releaseYear,
              genre: row.genres,
              description: row.overview
            })
          } catch (error) {
            console.error(`Error processing movie row with id ${row.id}:`, error)
          }
        })
        .on('end', resolve)
        .on('error', (err) => {
          console.error('Error reading movies CSV:', err)
          reject(err)
        })
    })
    console.log(`📦 Collected ${movieRows.length} movie rows`)

    // Process movie rows and insert into DB
    let movieCount = 0
    for (const row of movieRows) {
      try {
        const movie = new Movie({
          title: row.title,
          release_year: row.releaseYear,
          genre: row.genre,
          description: row.description
        })

        // Link ratings to movie
        const movieRatings = ratingsMap.get(row.id) || []
        let ratingDocs = []
        if (movieRatings.length > 0) {
          ratingDocs = await Rating.insertMany(
            movieRatings.map(r => ({ ...r, movie: movie._id }))
          )
        }
        movie.ratings = ratingDocs.map(r => r._id)

        // Link actors to movie
        const actorNames = movieActorsMap.get(row.id) || []
        const actorDocs = await Promise.all(actorNames.map(async name => {
          try {
            let actor = await Actor.findOne({ name })
            if (!actor) {
              actor = new Actor({ name, movies_played: [] })
              await actor.save()
            }
            actor.movies_played.push(movie._id)
            await actor.save()
            return actor
          } catch (err) {
            console.error(`Error processing actor ${name} for movie id ${row.id}:`, err)
            return null
          }
        }))
        // Filter out any actors that failed to process
        movie.actors = actorDocs.filter(a => a !== null).map(a => a._id)

        await movie.save()
        movieCount++
      } catch (error) {
        console.error(`Error inserting movie with id ${row.id}:`, error)
      }
    }
    console.log(`✅ Inserted ${movieCount} movies with actors and ratings`)
  } catch (error) {
    console.error('Error during seeding:', error)
  } finally {
    mongoose.disconnect()
  }
}

seed().catch(console.error)
