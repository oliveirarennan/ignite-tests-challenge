import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryTransfersRepository } from "../../repositories/in-memory/InMemoryTransfersRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let createTransferUseCase: CreateTransferUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTransfersRepository: InMemoryTransfersRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

describe("Create Transfer", () => {
  beforeEach(async () => {
    inMemoryTransfersRepository = new InMemoryTransfersRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createTransferUseCase = new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryTransfersRepository,
      inMemoryStatementsRepository
    );

    const user1 = await inMemoryUsersRepository.create({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });

    const user2 = await inMemoryUsersRepository.create({
      name: "User Test 2",
      email: "user2.test@test.com",
      password: "user2_test_password",
    });

    await inMemoryStatementsRepository.create({
      amount: 1000,
      description: "Test",
      type: OperationType.DEPOSIT,
      user_id: user1.id as string,
    });

    await inMemoryStatementsRepository.create({
      amount: 1000,
      description: "Test",
      type: OperationType.DEPOSIT,
      user_id: user2.id as string,
    });
  });

  it("should be able to create a transfer", async () => {
    const senderUser = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    const receiverUser = await inMemoryUsersRepository.findByEmail(
      "user2.test@test.com"
    );

    const transfer = await createTransferUseCase.execute({
      amount: 100,
      description: "test",
      receiver_id: receiverUser?.id as string,
      sender_id: senderUser?.id as string,
    });

    expect(transfer).toHaveProperty("id");
  });

  it("should not be able to create a transfer with a invalid user sender", async () => {
    const receiverUser = await inMemoryUsersRepository.findByEmail(
      "user2.test@test.com"
    );

    await expect(
      createTransferUseCase.execute({
        amount: 100,
        description: "test",
        receiver_id: receiverUser?.id as string,
        sender_id: "INVALID_USER_SENDER",
      })
    ).rejects.toEqual(new AppError("User not found", 401));
  });

  it("should not be able to create a transfer with a invalid user receiver", async () => {
    const senderUser = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );
    await expect(
      createTransferUseCase.execute({
        amount: 100,
        description: "test",
        receiver_id: "INVALID_USER_SENDER",
        sender_id: senderUser?.id as string,
      })
    ).rejects.toEqual(new AppError("ReceiverNotFound", 400));
  });

  it("should not be able to create a transfer with insufficient funds", async () => {
    const senderUser = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    const receiverUser = await inMemoryUsersRepository.findByEmail(
      "user2.test@test.com"
    );

    await expect(
      createTransferUseCase.execute({
        amount: 5000,
        description: "test",
        receiver_id: receiverUser?.id as string,
        sender_id: senderUser?.id as string,
      })
    ).rejects.toEqual(new AppError("Insufficient funds", 400));
  });

  it("should be able to create 2 statements for 1 transfer", async () => {
    const senderUser = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );

    const receiverUser = await inMemoryUsersRepository.findByEmail(
      "user2.test@test.com"
    );

    const transfer = await createTransferUseCase.execute({
      amount: 100,
      description: "test",
      receiver_id: receiverUser?.id as string,
      sender_id: senderUser?.id as string,
    });

    const transfers = await inMemoryStatementsRepository.getStatementByTransferId(
      transfer.id as string
    );

    expect(transfers?.length).toEqual(2);
  });
  it("should not be able to create a transfer with equals sender and receiver id", async () => {
    const senderUser = await inMemoryUsersRepository.findByEmail(
      "user2.test@test.com"
    );

    await expect(
      createTransferUseCase.execute({
        amount: 100,
        description: "test",
        receiver_id: senderUser?.id as string,
        sender_id: senderUser?.id as string,
      })
    ).rejects.toEqual(new AppError("Transfer to yourself is now allowed", 400));
  });
});
