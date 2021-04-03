import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Statement Operation", () => {
  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    await inMemoryUsersRepository.create({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });
  });

  it("should be able to get a operation", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    const operation = await inMemoryStatementsRepository.create({
      amount: 200,
      description: "Test 1 Deposit",
      type: OperationType.DEPOSIT,
      user_id: user?.id as string,
    });

    const statement = await getStatementOperationUseCase.execute({
      statement_id: operation?.id as string,
      user_id: user?.id as string,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toEqual(200);
    expect(statement.description).toEqual("Test 1 Deposit");
    expect(statement.type).toEqual(OperationType.DEPOSIT);
    expect(statement.user_id).toEqual(user?.id);
  });

  it("should not be able to get a operation of a non-existent statement", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "non-existent-statement-id",
        user_id: user?.id as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to get a operation of a non-existent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "non-existent-statement-id",
        user_id: "non-existent-user-id",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
