import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

describe("Show User Profile Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("user", 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at) values ('${id}', 'user', 'user@finapi.com.br', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to show  an user profile", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@finapi.com.br",
      password: "user",
    });

    const { token } = authResponse.body;

    const userProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(userProfile.status).toBe(200);
    expect(userProfile.body).toHaveProperty("id");
    expect(userProfile.body.name).toEqual("user");
    expect(userProfile.body.email).toEqual("user@finapi.com.br");
  });

  it("should not be able to show  an user profile with a invalid token", async () => {
    const token = "IVALID TOKEN";

    const userProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(userProfile.status).toBe(401);
  });
  it("should not be able to show  an user profile without a token", async () => {
    const userProfile = await request(app).get("/api/v1/profile");
    expect(userProfile.status).toBe(401);
  });
});
