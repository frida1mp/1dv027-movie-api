const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  title: String,
  release_year: Number,
  genre: String,
  description: String,
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }],
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }]
})

// Automatically convert _id to id and remove __v when converting to JSON
movieSchema.set('toJSON', {
  /**
   *
   * @param doc
   * @param ret
   */
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

module.exports = mongoose.model('Movie', movieSchema)
