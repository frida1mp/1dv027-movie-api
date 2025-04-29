require('dotenv').config()
const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { typeDefs } = require('./schema.js')
const { resolvers } = require('./resolvers.js')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const cors = require('cors')

const JWT_SECRET = process.env.JWT_SECRET
const app = express()

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie-api'
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
    serverSelectionTimeoutMS: 300000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

app.use(cors({
  origin: ['https://w2-steel.vercel.app/', 'http://localhost:5173'],
  credentials: true,
}));

// Serve the favicon (or you could serve all static assets)
app.use('/favicon.ico', express.static('public/favicon.ico'))

// Create the Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  /**
   *
   * @param err
   */
  formatError: (err) => ({
    message: err.message,
    code: err.extensions.code
  })
})

// Start Apollo Server
/**
 *
 */
async function startApolloServer () {
  await server.start()
  // Apply the Apollo middleware to the /graphql route
  app.use('/graphql', express.json(), expressMiddleware(server, {
    /**
     *
     * @param root0
     * @param root0.req
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
  }))

  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`)
  })
}

startApolloServer()
