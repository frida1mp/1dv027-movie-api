# API Design Assignment

In this assignment, students will be divided into two groups: one tasked with implementing a RESTful API and the other with creating a GraphQL API. 

The objective is to design and develop robust, well-documented APIs that allow users to retrieve and manage information effectively. 

While an example **Movie Database API** is provided you are encouraged to select your own dataset if it better aligns with your interests or can be used in other assignments. If a different dataset is chosen, ensure that your API endpoints adhere to requirements. Your API **MUST** include at least one fully CRUD (Create, Read, Update, Delete) endpoint for a primary resource and a minimum of two additional fetch endpoints to retrieve specific subsets or related data. 

Upon completion of your API implementation, you will peer review the other group's API, providing constructive feedback and analysing strengths and trade-offs between REST and GraphQL approaches.

## Example Dataset
A simplified **Movie Database API**, where users can retrieve information about movies, cast, and rating.

[Download Movie dataset as csv files](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset)

This dataset consists of many files, but the minimum you would need is:

- **movies_metadata.csv**: The main Movies Metadata file. Contains information on 45,000 movies featured in the Full MovieLens dataset. Features include posters, backdrops, budget, revenue, release dates, languages, production countries, and companies.

- **credits.csv**: Consists of cast and crew information for all our movies, available in the form of a stringified JSON object.

- **ratings_small.csv**: A subset of 100,000 ratings from 700 users on 9,000 movies.

#### **Movie dataset Entities:**

- **Movie** (id, title, release_year, genre, description)
- **Actor** (id, name, movies_played)
- **Rating** (id, text, movie)

---

## **General Requirements**

### **Mandatory API Features (Both REST and GraphQL)**

- The API **MUST** support `application/json`.
- Authentication **MUST** be implemented using JWT tokens for modifying resources.
- The API **MUST** allow users to **create, read, update, and delete movies**, while **actors and ratings are read-only**.
- The API **MUST** include **error handling** for incorrect input, authentication failures, and missing resources.
- A **Postman collection** (exported as JSON) **MUST** be provided for testing and included in the CI/CD pipeline. [Testing requirements](TESTING.md) **MUST** be followed.
- A **seed script** **MUST** be included to populate the database with sample data.
- The API **MUST** be documented using **Swagger/OpenAPI OR Postman documentation**.
- A **GraphQL Playground** **MUST** be available for GraphQL testing.
- A **link to the API documentation** **MUST** be provided.

---

## **Group 1: REST API Implementation**

### **REST-Specific Requirements**

- The API **SHOULD** follow RESTful principles, including resource-based URLs and proper HTTP methods.
- The API **MUST** implement HATEOAS (Hypermedia as the Engine of Application State).
- The API **MUST** include the following endpoints:
  - `GET /movies` - Retrieve all movies.
  - `GET /movies/{id}` - Get details of a specific movie.
  - `POST /movies` - Add a new movie (**Requires authentication**).
  - `PUT /movies/{id}` - Update a movie (**Requires authentication**).
  - `DELETE /movies/{id}` - Delete a movie (**Requires authentication**).
  - `GET /movies/{id}/ratings` - Retrieve ratings for a specific movie.
  - `GET /actors` - Retrieve all actors.
  - `GET /ratings` - Retrieve all ratings.
- The API **MUST** support query parameters for filtering (e.g., `GET /movies?genre=Action&year=2020`).
- The API **MUST** support pagination for large result sets.
- Swagger or Postman **MUST** be used for documentation, including an interactive playground for trying out requests.

---

## **Group 2: GraphQL API Implementation**

### **GraphQL-Specific Requirements**

- The API **SHOULD** provide a **single endpoint (`/graphql`)** where all queries and mutations are handled.
- The API **MUST** support the following GraphQL operations:
  - `movies` - Fetch all movies, optionally filtering by genre or year.
  - `movie(id: ID!)` - Fetch details of a specific movie.
  - `addMovie(title: String!, release_year: Int!, genre: String!)` - Add a new movie (**Requires authentication**).
  - `updateMovie(id: ID!, title: String, release_year: Int, genre: String)` - Update a movie (**Requires authentication**).
  - `deleteMovie(id: ID!)` - Delete a movie (**Requires authentication**).
  - `ratings(movie_id: ID!)` - Fetch ratings for a specific movie.
  - `actors` - Fetch all actors.
- The API **MUST** allow at least one **nested query** (e.g., fetch a movie along with its ratings in one request).
- The API **MUST** provide documentation via **Swagger/OpenAPI or Postman documentation**.
- A **GraphQL Playground** **MUST** be available for query exploration.

---

## **Peer Review & Reflection**

After implementation, each student will **review an API from the opposite group** and compare:

1. **Ease of use**: Which API is more intuitive for a developer?
2. **Performance**: How do the number of requests and response sizes compare?
3. **Flexibility**: Which API allows for more efficient data fetching with minimal over-fetching or under-fetching?
4. **Error handling**: How well are invalid requests and failures handled?
5. **Authentication & Security**: How are authentication and authorization implemented?
6. **Maintainability**: Which implementation is easier to extend and modify?
7. **Documentation & Testing**: How clear is the documentation, and how easy is it to test the API using Swagger or Postman?
8. **REST-Specific Considerations:**
   - Does the REST API provide well-structured resource-based URLs?
   - How does HATEOAS improve navigation and discoverability?
   - How do query parameters and pagination affect efficiency?
   - Are the HTTP methods and status codes used correctly?
   - How does the REST API compare in terms of verbosity and over-fetching?
9. **GraphQL-Specific Considerations:**
   - How does GraphQL's single endpoint approach compare to multiple RESTful endpoints?
   - How do nested queries improve or complicate fetching related data?
   - How does the type system in GraphQL enhance or limit flexibility?

Each student must submit a **peer review reflection** comparing their API to the opposite implementation. This should be submitted as a **commentary on the merge request**.

---

## **Checklist for your assignment**

- **API Completeness**: Required endpoints/queries are implemented correctly.
- **Code Quality & Documentation**: Clear, well-structured, and documented code.
- **Authentication & Security**: Proper authentication.
- **Error Handling & Testing**: Handles invalid input, missing resources
- **Automated Tests in CI/CD**: Tests are run via CI/CD pipeline and are fully automated. 
- **Peer Review**: Thoughtful analysis and comparison of the other group's API.

---

## **Final Notes**

- Start by designing your data models.
- REST students should focus on **endpoint structure and HATEOAS**.
- GraphQL students should focus on **flexible queries and nested responses**.
- Keep your API **modular and testable**.
- Integrate testing into the **CI/CD pipeline**.
- Have fun and **learn the trade-offs of REST vs. GraphQL!** 🚀