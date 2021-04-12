import { Transfer } from "../../entities/Transfer";
import { ICreateTransferDTO } from "../../useCases/createTransfer/ICreateTransferDTO";
import { ITransferRepository } from "../ITransfersRepository";

class InMemoryTransfersRepository implements ITransferRepository {
  transfers: Transfer[] = [];

  async create(data: ICreateTransferDTO): Promise<Transfer> {
    const transfer = new Transfer();

    Object.assign(transfer, data);

    this.transfers.push(transfer);

    return transfer;
  }
  async findById(id: string): Promise<Transfer> {
    const transfer = this.transfers.find((transfer) => transfer.id === id);

    return transfer!;
  }
  async findBySenderId(sender_id: string): Promise<Transfer[]> {
    const transfers = this.transfers.filter(
      (transfer) => transfer.sender_id === sender_id
    );

    return transfers;
  }
  async findByReceiverId(receiver_id: string): Promise<Transfer[]> {
    const transfers = this.transfers.filter(
      (transfer) => transfer.receiver_id === receiver_id
    );

    return transfers;
  }

  async all(): Promise<Transfer[]> {
    return this.transfers;
  }
}

export { InMemoryTransfersRepository };
