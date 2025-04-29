const gql = require('graphql-tag')

const typeDefs = gql`
  type Movie {
    id: ID!
    title: String!
    release_year: Int!
    genre: String
    description: String
    actors: [Actor]
    ratings: [Rating]
  }

  type Actor {
    id: ID!
    name: String!
    movies_played: [Movie]
  }

  type Rating {
    id: ID!
    text: String
    score: Float
    movie: Movie
  }

type Query {
  movies(limit: Int!, offset: Int!, genre: String): [Movie!]!
  totalMovies(genre: String): Int!  movie(id: ID!): Movie
  ratings(movie_id: ID!): [Rating]
  actors: [Actor]
}

  type Mutation {
    login(username: String!, password: String!): String
    register(username: String!, password: String!): String
    addMovie(title: String!, release_year: Int!, genre: String): Movie
    updateMovie(id: ID!, title: String, release_year: Int, genre: String): Movie
    deleteMovie(id: ID!): Boolean
    addRating(movie_id: ID!, score: Float!): Rating
  }
`

module.exports = { typeDefs }
