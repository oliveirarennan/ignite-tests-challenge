import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 401);
    }
  }

  export class ReceiverNotFound extends AppError {
    constructor() {
      super("ReceiverNotFound", 400);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }

  export class SelfTransfer extends AppError {
    constructor() {
      super("Transfer to yourself is now allowed", 400);
    }
  }
}
