import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Balance", () => {
  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );

    await inMemoryUsersRepository.create({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });
  });

  it("should be able to get a User Balance without statements", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    const userBalance = await getBalanceUseCase.execute({
      user_id: user?.id as string,
    });

    expect(userBalance).toHaveProperty("balance");
    expect(userBalance.balance).toBe(0);
    expect(userBalance.statement.length).toBe(0);
  });

  it("should be able to get a User Balance with statements", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    await inMemoryStatementsRepository.create({
      amount: 200,
      description: "Test 1 Deposit",
      type: OperationType.DEPOSIT,
      user_id: user?.id as string,
    });

    await inMemoryStatementsRepository.create({
      amount: 100,
      description: "Test 2 Withdraw",
      type: OperationType.WITHDRAW,
      user_id: user?.id as string,
    });

    const userBalance = await getBalanceUseCase.execute({
      user_id: user?.id as string,
    });

    expect(userBalance).toHaveProperty("balance");
    expect(userBalance.balance).toBe(100);
    expect(userBalance.statement.length).toBe(2);
  });

  it("should not be able to get a Balance of a non-existent user", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: "non-existent-user-id",
      })
    ).rejects.toEqual(new AppError("User not found", 404));
  });
});
