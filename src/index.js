require('dotenv').config()
const mongoose = require('mongoose')
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const jwt = require('jsonwebtoken')

const { typeDefs } = require('./schema.js')
const { resolvers } = require('./resolvers.js')
const JWT_SECRET = process.env.JWT_SECRET

/**
 * Starts the Apollo GraphQL server and connects to MongoDB.
 *
 * This function connects to the MongoDB database, initializes the ApolloServer
 * with the provided type definitions and resolvers, and sets up the context to handle
 * JWT authentication. It then starts a standalone server on port 4000.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>} Resolves when the server is running.
 */
async function startServer () {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/movie-api')
    console.log('Connected to MongoDB')

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      /**
       * Formats errors before sending them to the client.
       *
       * @param {Error} err - The error object thrown during resolver execution.
       * @returns {object} An object containing the error message and code.
       */
      formatError: (err) => {
        return {
          message: err.message,
          code: err.extensions.code
        }
      }
    })
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      /**
       * Sets the context for each GraphQL request.
       *
       * Extracts the JWT token from the Authorization header (if provided),
       * verifies the token, and adds the user information to the context.
       *
       * @param {object} param0 - The request object.
       * @param {object} param0.req - The HTTP request object.
       * @returns {Promise<object>} A context object containing the user property.
       */
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || ''
        const token = authHeader.replace('Bearer ', '')
        try {
          const user = jwt.verify(token, JWT_SECRET)
          return { user }
        } catch {
          return { user: null }
        }
      }
    })

    console.log(`Server ready at ${url}`)
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

startServer()
