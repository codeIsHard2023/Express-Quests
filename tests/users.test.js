const request = require("supertest");
const app = require("../src/app");
const database = require("../database");
const crypto = require("node:crypto");

let storedUserResourceId = [];
const cleanupAfterPostTests = async (postId) => {
  //Ici on supprime le tuple avec l'ID postId
  await database.query("DELETE FROM users WHERE id = ?", [postId]);
};

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.com`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "select * from users where id = ?",
      response.body.id
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");
    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(newUser.firstname);
    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(newUser.lastname);
    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(newUser.email);
    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(newUser.city);
    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(newUser.language);

    //ici je récupére le ID de l'element que je crée avec le test via POST
    const newResourceId = response.body.id;
    //Ici je stocke le nouveau element créé pour le netoyage ultérieur
    storedUserResourceId.push(newResourceId);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Joe Green" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);
    expect(response.status).toEqual(500);

    //ici je récupére le ID de l'element que je crée avec le test via POST
    const newResourceId = response.body.id;
    //Ici je stocke le nouveau element créé pour le netoyage ultérieur
    storedUserResourceId.push(newResourceId);
  });
});

afterEach(async () => {
  //ici on va parcourir les IDs stockés et nettoyer chaque ressource
  for (const resourceId of storedUserResourceId) {
    await cleanupAfterPostTests(resourceId);
  }
});
afterAll(() => {
  database.end();
});
