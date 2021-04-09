import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    await createUserUseCase.execute({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });
  });

  it("should be able to authenticate a user", async () => {
    const authenticatedUser = await authenticateUserUseCase.execute({
      email: "user.test@test.com",
      password: "user_test_password",
    });

    expect(authenticatedUser).toHaveProperty("token");
    expect(authenticatedUser.user.name).toEqual("User Test 1");
    expect(authenticatedUser.user.email).toEqual("user.test@test.com");
  });

  it("should not be able to authenticate a user with a non-existent email", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "non.existent.email@test.com",
        password: "user_test_password",
      })
    ).rejects.toEqual(new AppError("Incorrect email or password", 401));
  });

  it("should not be able to authenticate a user with an incorrect password", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "user.test@test.com",
        password: "wrong_password",
      })
    ).rejects.toEqual(new AppError("Incorrect email or password", 401));
  });
});
