const fs = require('fs')
const { Readable } = require('stream')
const loadActors = require('../src/loaders/loadActors')

describe('loadActors', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should load actors and group them by movie ID', async () => {
    const sampleCSV = `id,cast
101,"[{""name"":""Actor A"",""cast_id"":1},{""name"":""Actor B"",""cast_id"":2}]"
102,"[{""name"":""Actor C"",""cast_id"":3}]"
`

    // Create a readable stream from the sample CSV string.
    const stream = Readable.from(sampleCSV)

    // Spy on fs.createReadStream to return our controlled stream.
    jest.spyOn(fs, 'createReadStream').mockReturnValue(stream)

    const { movieActorsMap, allActors } = await loadActors()

    expect(movieActorsMap).toBeInstanceOf(Map)
    expect(movieActorsMap.size).toBe(2)

    const actors101 = movieActorsMap.get('101')
    expect(actors101).toHaveLength(2)
    expect(actors101[0]).toMatchObject({ id: 'Actor A-1', name: 'Actor A' })
    expect(actors101[1]).toMatchObject({ id: 'Actor B-2', name: 'Actor B' })

    const actors102 = movieActorsMap.get('102')
    expect(actors102).toHaveLength(1)
    expect(actors102[0]).toMatchObject({ id: 'Actor C-3', name: 'Actor C' })

    expect(allActors).toHaveLength(3)
    expect(allActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'Actor A-1', name: 'Actor A' }),
        expect.objectContaining({ id: 'Actor B-2', name: 'Actor B' }),
        expect.objectContaining({ id: 'Actor C-3', name: 'Actor C' })
      ])
    )
  })
})
