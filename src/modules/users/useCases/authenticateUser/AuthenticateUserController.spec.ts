import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { app } from "../../../../app";

describe("Authenticate User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at) values ('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe("admin");
    expect(response.body.user.email).toBe("admin@finapi.com.br");
  });

  it("should not be able to authenticate a user with incorrect email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrong@finapi.com.br",
      password: "admin",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "wrong_password",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user with incorrect email and password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrong@finapi.com.br",
      password: "wrong_password",
    });

    expect(response.status).toBe(401);
  });
});
