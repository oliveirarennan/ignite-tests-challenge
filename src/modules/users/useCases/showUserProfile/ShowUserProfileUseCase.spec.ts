import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show user profile", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    await createUserUseCase.execute({
      name: "User Test 1",
      email: "user.test@test.com",
      password: "user_test_password",
    });
  });

  it("should be able to get the user profile data", async () => {
    const user = await inMemoryUsersRepository.findByEmail(
      "user.test@test.com"
    );
    const userProfile = await showUserProfileUseCase.execute(
      user?.id as string
    );

    expect(userProfile).toHaveProperty("id");
    expect(userProfile.name).toEqual("User Test 1");
    expect(userProfile.email).toEqual("user.test@test.com");
  });

  it("should not be able to get profile of a non-existent user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("non_existent_user_id");
    }).rejects.toBeInstanceOf(AppError);
  });
});
