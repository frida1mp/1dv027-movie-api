const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema({
  text: String,
  score: Number,
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }
})

module.exports = mongoose.model('Rating', ratingSchema)
