import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

describe("Get Balance Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const user_id = uuidV4();
    const password = await hash("user", 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at) values ('${user_id}', 'user', 'user@finapi.com.br', '${password}', 'now()', 'now()');
    `);

    let operationId = uuidV4();
    await connection.query(`
      INSERT INTO statements(id, user_id, description, amount, type, created_at, updated_at) values ('${operationId}', '${user_id}','DEPOSIT', 200.0, 'deposit', 'now()', 'now()')
    `);

    operationId = uuidV4();
    await connection.query(`
      INSERT INTO statements(id, user_id, description, amount, type, created_at, updated_at) values ('${operationId}', '${user_id}', 'WITHDRAW', 100.0, 'withdraw', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to get an user stament", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@finapi.com.br",
      password: "user",
    });

    const { token } = authResponse.body;

    const statement = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.status).toBe(200);
    expect(statement.body).toHaveProperty("balance");
    expect(statement.body.balance).toEqual(100);
    expect(statement.body.statement).toHaveLength(2);
  });

  it("should not be able to get an user stament with a invalid token", async () => {
    const token = "INVALID TOKEN";

    const statement = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.status).toBe(401);
  });

  it("should not be able to get an user stament without a token", async () => {
    const statement = await request(app).get("/api/v1/statements/balance");

    expect(statement.status).toBe(401);
  });
});
