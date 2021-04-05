import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

describe("Create User Controller", () => {
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

  it("should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User2",
      email: "user2@finapi.com.br",
      password: "user2",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({});
  });

  it("should not be able to create a user with a existent email", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User",
      email: "user@finapi.com.br",
      password: "user",
    });

    expect(response.status).toBe(400);
  });
});
