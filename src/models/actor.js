const mongoose = require('mongoose')

const actorSchema = new mongoose.Schema({
  name: String,
  movies_played: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
})

module.exports = mongoose.model('Actor', actorSchema)
