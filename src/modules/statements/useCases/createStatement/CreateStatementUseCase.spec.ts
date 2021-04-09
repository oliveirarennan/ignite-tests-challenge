import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    await inMemoryUsersRepository.create({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });
  });

  it("should be able to create a statement", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "Test",
      type: OperationType.DEPOSIT,
      user_id: user?.id as string,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.description).toEqual("Test");
  });

  it("should not be able to create a statement with a non-existent user", async () => {
    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "Test",
        type: OperationType.DEPOSIT,
        user_id: "non-existent-user-id",
      })
    ).rejects.toEqual(new AppError("User not found", 404));
  });

  it("should be able to create deposit statement", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "DEPOSIT TEST",
      type: OperationType.DEPOSIT,
      user_id: user?.id as string,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual(OperationType.DEPOSIT);
    expect(statement.amount).toEqual(100);
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    await createStatementUseCase.execute({
      amount: 200,
      description: "DEPOSIT FOR WITHDRAW TEST",
      type: OperationType.DEPOSIT,
      user_id: user?.id as string,
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "WITHDRAW TEST",
      type: OperationType.WITHDRAW,
      user_id: user?.id as string,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual(OperationType.WITHDRAW);
    expect(statement.amount).toEqual(100);
  });

  it("should not be able to create a withdraw statement without funds", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "WITHDRAW TEST",
        type: OperationType.WITHDRAW,
        user_id: user?.id as string,
      })
    ).rejects.toEqual(new AppError("Insufficient funds", 400));
  });
});
