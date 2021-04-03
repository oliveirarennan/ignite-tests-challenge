import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toEqual("User Test 1");
  });

  it("should not be able to create a user with a existent email", async () => {
    await createUserUseCase.execute({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });

    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test 1",
        email: "user.test@test.com",
        password: "user_test_password",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
