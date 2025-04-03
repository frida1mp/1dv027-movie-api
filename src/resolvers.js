require('dotenv').config()
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const Movie = require('./models/movie.js')
const Actor = require('./models/actor.js')
const Rating = require('./models/rating.js')
const User = require('./models/user.js')

const resolvers = {
  Query: {
    /**
     * Retrieves a list of movies with populated actors and ratings.
     *
     * @returns {Promise<Array>} An array of movie objects.
     */
    movies: async () => {
      try {
        return await Movie.find().limit(50).populate('actors').populate('ratings')
      } catch (error) {
        console.error('Error fetching movies:', error)
        throw new Error('Error fetching movies')
      }
    },

    /**
     * Retrieves details of a specific movie by its ID.
     *
     * @param {any} _ - Parent resolver (unused).
     * @param {object} args - The resolver arguments.
     * @param {string} args.id - The ID of the movie.
     * @returns {Promise<object | null>} The movie object or null if not found.
     */
    movie: async (_, { id }) => {
      try {
        return await Movie.findById(id).populate('actors').populate('ratings')
      } catch (error) {
        console.error(`Error fetching movie with id ${id}:`, error)
        throw new Error('Error fetching movie')
      }
    },

    /**
     * Retrieves ratings for a specific movie.
     *
     * @param {any} _ - Parent resolver (unused).
     * @param {object} args - The resolver arguments.
     * @param {string} args.movie_id - The ID of the movie.
     * @returns {Promise<Array>} An array of rating objects.
     */
    ratings: async (_, { movie_id }) => {
      try {
        console.log('movie', movie_id)
        const ratings = await Rating.find({ movie: movie_id }).populate('movie')
        return ratings.map(rating => {
          const obj = rating.toObject()
          obj.id = obj._id.toString()
          delete obj._id
          delete obj.__v
          // Process the nested movie field if it exists
          if (obj.movie) {
            if (obj.movie._id) {
              obj.movie.id = obj.movie._id.toString()
              delete obj.movie._id
            }
            if (obj.movie.__v !== undefined) {
              delete obj.movie.__v
            }
          } return obj
        })
      } catch (error) {
        console.error(`Error fetching ratings for movie_id ${movie_id}:`, error)
        throw new Error('Error fetching ratings')
      }
    },

    /**
     * Retrieves all actors with their associated movies.
     *
     * @returns {Promise<Array>} An array of actor objects.
     */
    actors: async () => {
      try {
        return await Actor.find().populate('movies_played')
      } catch (error) {
        console.error('Error fetching actors:', error)
        throw new Error('Error fetching actors')
      }
    }
  },

  Mutation: {
    /**
     * Authenticates a user and returns a JWT token if credentials are valid.
     *
     * @param {any} _ - Parent resolver (unused).
     * @param {object} args - The resolver arguments.
     * @param {string} args.username - The username.
     * @param {string} args.password - The password.
     * @returns {Promise<string>} A JWT token if login is successful.
     */
    login: async (_, { username, password }) => {
      try {
      // Find the user by username
        const user = await User.findOne({ username })
        if (!user) {
          throw new Error('Invalid credentials')
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
          throw new Error('Invalid credentials')
        }

        // Generate a JWT token for the authenticated user
        const token = jwt.sign(
          { id: user._id, username: user.username },
          JWT_SECRET,
          { expiresIn: '1h' }
        )
        return token
      } catch (error) {
        console.error('Login error:', error)
        throw new Error('Login failed')
      }
    },

    /**
     * Registers a new user and returns a JWT token upon successful registration.
     *
     * @param {any} _ - Parent resolver (unused).
     * @param {object} args - The resolver arguments.
     * @param {string} args.username - The desired username.
     * @param {string} args.password - The desired password.
     * @returns {Promise<string>} A JWT token for the newly registered user.
     */
    register: async (_, { username, password }) => {
      try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username })
        if (existingUser) {
          throw new Error('User already exists')
        }
        // Create a new user. In production, you should hash the password!
        const newUser = new User({ username, password })
        await newUser.save()

        // Generate a JWT token for the new user
        const token = jwt.sign(
          { id: newUser._id, username: newUser.username },
          JWT_SECRET,
          { expiresIn: '1h' }
        )
        return token
      } catch (error) {
        console.error('Register error:', error)
        throw new Error('Register failed')
      }
    },

    /**
     * Adds a new movie to the database.
     *
     * @param {any} _ - Parent resolver (unused).
     * @param {object} args - The movie details.
     * @param {object} context - The resolver context containing user info.
     * @returns {Promise<object>} The created movie object.
     */
    addMovie: async (_, args, context) => {
      if (!context.user) throw new Error('Unauthorized')
      try {
        const movie = new Movie({
          ...args,
          description: '',
          ratings: [],
          actors: []
        })
        await movie.save()
        return movie
      } catch (error) {
        console.error('Error adding movie:', error)
        throw new Error('Failed to add movie')
      }
    },

    /**
     * Updates an existing movie's details.
     *
     * @param {any} _ - Parent resolver (unused).
     * @param {object} args - The movie details to update.
     * @param {string} args.id - The ID of the movie to update.
     * @param {string} [args.title] - The new title (optional).
     * @param {number} [args.release_year] - The new release year (optional).
     * @param {string} [args.genre] - The new genre (optional).
     * @param {object} context - The resolver context containing user info.
     * @returns {Promise<object>} The updated movie object.
     */
    updateMovie: async (_, { id, title, release_year, genre }, context) => {
      if (!context.user) throw new Error('Unauthorized')
      try {
        const movie = await Movie.findById(id)
        if (!movie) throw new Error('Movie not found')

        if (title) movie.title = title
        if (release_year) movie.release_year = release_year
        if (genre) movie.genre = genre

        await movie.save()
        return movie
      } catch (error) {
        console.error(`Error updating movie with id ${id}:`, error)
        throw new Error('Failed to update movie')
      }
    },

    /**
     * Deletes a movie from the database.
     *
     * @param {any} _ - Parent resolver (unused).
     * @param {object} args - The resolver arguments.
     * @param {string} args.id - The ID of the movie to delete.
     * @param {object} context - The resolver context containing user info.
     * @returns {Promise<boolean>} True if the movie was deleted, false otherwise.
     */
    deleteMovie: async (_, { id }, context) => {
      if (!context.user) throw new Error('Unauthorized')
      try {
        const result = await Movie.deleteOne({ _id: id })
        return result.deletedCount > 0
      } catch (error) {
        console.error(`Error deleting movie with id ${id}:`, error)
        throw new Error('Failed to delete movie')
      }
    }
  },

  Movie: {
    /**
     * Populates the ratings for a movie.
     *
     * @param {object} movie - The movie object.
     * @returns {Promise<Array>} An array of rating objects for the movie.
     */
    ratings: async (movie) => {
      try {
        return await Rating.find({ movie: movie_id })
      } catch (error) {
        console.error(`Error fetching ratings for movie with id ${movie_id}:`, error)
        throw new Error('Error fetching movie ratings')
      }
    },
    /**
     * Populates the actors for a movie.
     *
     * @param {object} movie - The movie object.
     * @returns {Promise<Array>} An array of actor objects for the movie.
     */
    actors: async (movie) => {
      try {
        return await Actor.find({ _id: { $in: movie.actors } })
      } catch (error) {
        console.error(`Error fetching actors for movie with id ${movie._id}:`, error)
        throw new Error('Error fetching movie actors')
      }
    }
  }
}

module.exports = { resolvers }
