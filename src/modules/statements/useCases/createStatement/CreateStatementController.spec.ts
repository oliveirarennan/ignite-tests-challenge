import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

describe("Create Statement Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const user_id = uuidV4();
    const password = await hash("user", 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at) values ('${user_id}', 'user', 'user@finapi.com.br', '${password}', 'now()', 'now()');
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to create a stament Deposit Operation", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@finapi.com.br",
      password: "user",
    });

    const { token } = authResponse.body;

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200.0,
        description: "Statement Deposit Test",
      });

    expect(statement.status).toBe(201);
    expect(statement.body).toHaveProperty("id");
    expect(statement.body.amount).toEqual(200);
    expect(statement.body.description).toEqual("Statement Deposit Test");
  });

  it("should be able to create a stament Withdraw Operation", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@finapi.com.br",
      password: "user",
    });

    const { token } = authResponse.body;

    const statement = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200.0,
        description: "Statement Withdraw Test",
      });

    expect(statement.status).toBe(201);
    expect(statement.body).toHaveProperty("id");
    expect(statement.body.amount).toEqual(200);
    expect(statement.body.description).toEqual("Statement Withdraw Test");
  });

  it("should not be able to create a stament Withdraw Operation with insuficient funds", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@finapi.com.br",
      password: "user",
    });

    const { token } = authResponse.body;

    const statement = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 300.0,
        description: "Statement Withdraw Test",
      });

    expect(statement.status).toBe(400);
  });

  it("should not be able to create a stament Operation with a invalid user", async () => {
    const token = "INVALID TOKEN";

    const statement = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100.0,
        description: "Statement Withdraw Test",
      });

    expect(statement.status).toBe(401);
  });

  it("should not be able to create a stament Operation without a token", async () => {
    const statement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100.0,
        description: "Statement Withdraw Test",
      });

    expect(statement.status).toBe(401);
  });
});
