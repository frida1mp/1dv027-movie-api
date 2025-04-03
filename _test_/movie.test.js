const Movie = require('../src/models/movie')
const { resolvers } = require('../src/resolvers')

describe('Movie Model Test', () => {
  it('creates and saves a movie successfully', async () => {
    const validMovie = new Movie({
      title: 'Test Movie',
      release_year: 2022,
      genre: 'Drama',
      description: 'A movie for testing'
    })

    const savedMovie = await validMovie.save()
    expect(savedMovie._id).toBeDefined()
    expect(savedMovie.title).toBe('Test Movie')
  })
})

describe('Movie Model Test', () => {
  beforeEach(async () => {
    await Movie.deleteMany()
  })

  it('gets all movies', async () => {
    const movieData = {
      title: 'Test Movie',
      release_year: 2022,
      genre: 'Drama',
      description: 'A test movie'
    }
    const movie = new Movie(movieData)
    const savedMovie = await movie.save()

    const movies = await Movie.find()

    expect(savedMovie._id).toBeDefined()
    expect(savedMovie.title).toBe('Test Movie')
    expect(movies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Test Movie' })
      ])
    )
  })
})

describe('Movie CRUD Operations as Logged-In User', () => {
  // Clear the movies collection before each test
  beforeEach(async () => {
    await Movie.deleteMany()
  })
  const context = { user: { username: 'admin' } }

  it('creates a movie (addMovie mutation)', async () => {
    const movieInput = {
      title: 'New Test Movie',
      release_year: 2023,
      genre: 'Action'
    }

    // Call the addMovie mutation resolver
    const newMovie = await resolvers.Mutation.addMovie(null, movieInput, context)

    expect(newMovie).toBeDefined()
    expect(newMovie.title).toBe('New Test Movie')
    expect(newMovie.release_year).toBe(2023)
    expect(newMovie.genre).toBe('Action')
  })

  it('updates a movie (updateMovie mutation)', async () => {
    const movie = new Movie({
      title: 'Original Title',
      release_year: 2020,
      genre: 'Comedy',
      description: 'Original description'
    })
    await movie.save()

    const updateInput = {
      id: movie._id.toString(),
      title: 'Updated Title',
      release_year: 2021,
      genre: 'Drama'
    }

    const updatedMovie = await resolvers.Mutation.updateMovie(null, updateInput, context)

    expect(updatedMovie).toBeDefined()
    expect(updatedMovie.title).toBe('Updated Title')
    expect(updatedMovie.release_year).toBe(2021)
    expect(updatedMovie.genre).toBe('Drama')
  })

  it('deletes a movie (deleteMovie mutation)', async () => {
    const movie = new Movie({
      title: 'Movie to Delete',
      release_year: 2019,
      genre: 'Horror',
      description: 'To be deleted'
    })
    await movie.save()

    const deletionResult = await resolvers.Mutation.deleteMovie(null, { id: movie._id.toString() }, context)

    expect(deletionResult).toBe(true)

    const foundMovie = await Movie.findById(movie._id)
    expect(foundMovie).toBeNull()
  })
})
