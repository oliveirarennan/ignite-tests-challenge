import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

describe("Transfer Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const user1_id = uuidV4();
    const user2_id = uuidV4();
    const password = await hash("user", 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at) values ('${user1_id}', 'user1', 'user1@finapi.com.br', '${password}', 'now()', 'now()');
    `);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at) values ('${user2_id}', 'user2', 'user2@finapi.com.br', '${password}', 'now()', 'now()');
    `);

    let operationId = uuidV4();
    await connection.query(`
      INSERT INTO statements(id, user_id, description, amount, type, created_at, updated_at) values ('${operationId}', '${user1_id}','DEPOSIT', 1000.0, 'deposit', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to create a transfer", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user1@finapi.com.br",
      password: "user",
    });

    const { token } = authResponse.body;

    const [user2] = await connection.query(`
    SELECT * FROM users where email = 'user2@finapi.com.br';
  `);

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user2.id}`)
      .send({
        amount: 100,
        description: "Transfer Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({});
  });

  it("should not be able create transfer with a invalid token", async () => {
    const token = "INVALID TOKEN";

    const transfer = await request(app)
      .get(`/api/v1/statements/transfer/INVALID_STRING`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(transfer.status).toBe(401);
  });

  it("should not be able create transfer with a invalid receiver", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user1@finapi.com.br",
      password: "user",
    });
    const { token } = authResponse.body;

    const statement = await request(app)
      .get(`/api/v1/statements/transfer/INVALID_STRING`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.status).toBe(404);
  });
});
