const request = require("supertest");
const app = require("../src/app");
const database = require("../database");

let storedMovieResourceId = [];
const cleanupAfterPostTests = async (postId) => {
  //Ici on supprime le tuple avec l'ID postId
  await database.query("DELETE FROM movies WHERE id = ?", [postId]);
};

describe("GET /api/movies", () => {
  it("should return all movies", async () => {
    const response = await request(app).get("/api/movies");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/movies/:id", () => {
  it("should return one movie", async () => {
    const response = await request(app).get("/api/movies/1");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });

  it("should return no movie", async () => {
    const response = await request(app).get("/api/movies/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/movies", () => {
  it("should return created movie", async () => {
    const newMovie = {
      title: "Star Wars",
      director: "George Lucas",
      year: "1977",
      color: "1",
      duration: 120,
    };

    const response = await request(app).post("/api/movies").send(newMovie);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "select * from movies where id = ?",
      response.body.id
    );

    const [movieInDatabase] = result;

    expect(movieInDatabase).toHaveProperty("id");
    expect(movieInDatabase).toHaveProperty("title");
    expect(movieInDatabase.title).toStrictEqual(newMovie.title);
    expect(movieInDatabase).toHaveProperty("director");
    expect(movieInDatabase.director).toStrictEqual(newMovie.director);
    expect(movieInDatabase).toHaveProperty("year");
    expect(movieInDatabase.year).toStrictEqual(newMovie.year);
    expect(movieInDatabase).toHaveProperty("color");
    expect(movieInDatabase.color).toStrictEqual(newMovie.color);
    expect(movieInDatabase).toHaveProperty("duration");
    expect(movieInDatabase.duration).toStrictEqual(newMovie.duration);

    const newResourceId = response.body.id;
    //Ici je stocke le nouveau element créé pour le netoyage ultérieur
    storedMovieResourceId.push(newResourceId);
  });

  it("should return an error", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .post("/api/movies")
      .send(movieWithMissingProps);
    expect(response.status).toEqual(500);
    const newResourceId = response.body.id;
    //Ici je stocke le nouveau element créé pour le netoyage ultérieur
    storedMovieResourceId.push(newResourceId);
  });
});

describe("PUT /api/movies/:id", () => {
  it("should edit movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2009",
      color: "1",
      duration: 162,
    };

    const responseFirst = await request(app).post("/api/movies").send(newMovie);

    expect(responseFirst.status).toEqual(201);
    expect(responseFirst.body).toHaveProperty("id");
    expect(typeof responseFirst.body.id).toBe("number");

    const id = responseFirst.body.id;

    const updatedMovie = {
      title: "Wild is life",
      director: "Alan Smithee",
      year: "2023",
      color: "0",
      duration: 120,
    };

    const responseSecond = await request(app)
      .put(`/api/movies/${id}`)
      .send(updatedMovie);
    expect(responseSecond.status).toEqual(204);

    const [movies] = await database.query(
      "SELECT * FROM movies WHERE id = ?",
      id
    );

    const [movieInDatabase] = movies;

    expect(movieInDatabase).toHaveProperty("id");

    expect(movieInDatabase).toHaveProperty("title");
    expect(movieInDatabase.title).toStrictEqual(updatedMovie.title);

    expect(movieInDatabase).toHaveProperty("director");
    expect(movieInDatabase.director).toStrictEqual(updatedMovie.director);

    expect(movieInDatabase).toHaveProperty("year");
    expect(movieInDatabase.year).toStrictEqual(updatedMovie.year);

    expect(movieInDatabase).toHaveProperty("color");
    expect(movieInDatabase.color).toStrictEqual(updatedMovie.color);

    expect(movieInDatabase).toHaveProperty("duration");
    expect(movieInDatabase.duration).toStrictEqual(updatedMovie.duration);

    const newResourceId = responseFirst.body.id;
    //Ici je stocke le nouveau element créé pour le netoyage ultérieur
    storedMovieResourceId.push(newResourceId);
  });

  it("should return an error", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .put("/api/movies/1")
      .send(movieWithMissingProps);

    expect(response.status).toEqual(500);
  });

  it("should return no movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2009",
      color: "1",
      duration: 162,
    };

    const response = await request(app).put("/api/movies/0").send(newMovie);

    expect(response.status).toEqual(404);
  });
});

afterEach(async () => {
  //ici on va parcourir les IDs stockés et nettoyer chaque ressource
  for (const resourceId of storedMovieResourceId) {
    await cleanupAfterPostTests(resourceId);
  }
});
afterAll(() => {
  database.end();
});
