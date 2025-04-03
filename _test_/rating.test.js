const fs = require('fs')
const { Readable } = require('stream')
const loadRatings = require('../src/loaders/loadRatings')

describe('loadRatings', () => {
  beforeEach(() => {
    // Restore fs.createReadStream before each test in case of multiple tests
    jest.restoreAllMocks()
  })

  it('should load ratings and group them by movie ID', async () => {
    // Sample CSV content matching the expected header and fields
    const sampleCSV = `userId,movieId,rating
1,101,4.5
2,101,3.5
3,102,5.0
`
    // Create a readable stream from the sample CSV string
    const stream = Readable.from(sampleCSV)

    // Spy on fs.createReadStream to return our controlled stream instead of reading from a file
    jest.spyOn(fs, 'createReadStream').mockReturnValue(stream)

    const ratingsMap = await loadRatings()

    expect(ratingsMap).toBeInstanceOf(Map)

    expect(ratingsMap.size).toBe(2)

    expect(ratingsMap.get('101')).toHaveLength(2)
    expect(ratingsMap.get('102')).toHaveLength(1)

    const rating101 = ratingsMap.get('101')[0]
    expect(rating101).toHaveProperty('id', '1-101')
    expect(rating101).toHaveProperty('score', 4.5)
    expect(rating101).toHaveProperty('text', 'User 1 rated this 4.5 stars')
    expect(rating101).toHaveProperty('movie_id', '101')
  })
})
