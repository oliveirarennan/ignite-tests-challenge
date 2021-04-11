import { Transfer } from "../entities/Transfer";
import { ICreateTransferDTO } from "../useCases/createTransfer/ICreateTransferDTO";

interface ITransferRepository {
  create(data: ICreateTransferDTO): Promise<Transfer>;
  all(): Promise<Transfer[]>;
  findById(id: string): Promise<Transfer>;
  findBySenderId(sender_id: string): Promise<Transfer[]>;
  findByReceiverId(receiver_id: string): Promise<Transfer[]>;
}

export { ITransferRepository };
