import { injectable, inject } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransferRepository } from "../../repositories/ITransfersRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

/**
 * TODO:
 *  [x] Adicionar Transfer nos operation types
 *  [] Gerar Statemant positivo para o destinatario
 *  [] Gerar Statment negativo para o remetente
 */

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

interface IRequest {
  receiver_id: string;
  sender_id: string;
  amount: number;
  description: string;
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("TransfersRepository")
    private transfersRepository: ITransferRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ receiver_id, sender_id, amount, description }: IRequest) {
    const userSender = await this.usersRepository.findById(sender_id);

    if (!userSender) {
      throw new CreateTransferError.UserNotFound();
    }

    const userReceiver = await this.usersRepository.findById(receiver_id);

    if (!userReceiver) {
      throw new CreateTransferError.ReceiverNotFound();
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
      with_statement: false,
    });

    if (balance.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const transfer = await this.transfersRepository.create({
      sender_id,
      receiver_id,
    });

    const senderStatement = await this.statementsRepository.create({
      user_id: sender_id,
      type: OperationType.TRANSFER,
      description: "Transfer Operation",
      amount: -1 * amount,
    });

    const receiverStatement = await this.statementsRepository.create({
      user_id: receiver_id,
      type: OperationType.TRANSFER,
      description,
      amount,
    });
  }
}

export { CreateTransferUseCase };
