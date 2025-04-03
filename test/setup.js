// test/setup.js
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

/**
 * Connect to the in-memory database before running tests.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

/**
 * Disconnect and stop the in-memory database after all tests.
 */
afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

/**
 * Optional: Clear all collections between tests to ensure isolation.
 */
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany()
  }
})
