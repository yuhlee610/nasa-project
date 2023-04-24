const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Test api", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  })

  describe("Test GET /launches", () => {
    test("It should be 200", async () => {
      const response = await request(app).get("/v1/launches").expect(200);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launches", () => {
    test("It should be 201", async () => {
      await request(app)
        .post("/v1/launches")
        .send({
          mission: "asd",
          rocket: "dsf",
          target: "Kepler-1652 b",
          launchDate: "May 4, 2033",
        })
        .expect(201);
    });

    test("It should catch missing required properties", () => {});

    test("It should catch invalid date", () => {});
  });
});
