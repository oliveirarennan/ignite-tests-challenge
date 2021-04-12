import { getRepository, Repository } from "typeorm";
import { Transfer } from "../entities/Transfer";
import { ICreateTransferDTO } from "../useCases/createTransfer/ICreateTransferDTO";
import { ITransferRepository } from "./ITransfersRepository";

class TransfersRepository implements ITransferRepository {
  private repository: Repository<Transfer>;

  constructor() {
    this.repository = getRepository(Transfer);
  }

  async create(data: ICreateTransferDTO): Promise<Transfer> {
    const transfer = this.repository.create(data);

    this.repository.save(transfer);

    return transfer;
  }
  async all(): Promise<Transfer[]> {
    const transfers = await this.repository.find();

    return transfers;
  }
  async findById(id: string): Promise<Transfer> {
    const transfer = await this.repository.findOne({ id });

    return transfer!;
  }
  async findBySenderId(sender_id: string): Promise<Transfer[]> {
    const transfers = await this.repository.find({ sender_id });

    return transfers;
  }
  async findByReceiverId(receiver_id: string): Promise<Transfer[]> {
    const transfers = await this.repository.find({ receiver_id });

    return transfers;
  }
}

export { TransfersRepository };
