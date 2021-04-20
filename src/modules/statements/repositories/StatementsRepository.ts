import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";
export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type,
    transfer_id,
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
      transfer_id,
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id },
    });
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statements = await this.repository.find({
      where: { user_id },
      relations: ["transfer"],
    });

    const balance = statements.reduce((acc, operation) => {
      if (operation.type === "withdraw") {
        return acc - Number(operation.amount);
      } else {
        return acc + Number(operation.amount);
      }
    }, 0);

    if (with_statement) {
      const statementsMapped = statements.map((statement) =>
        statement.transfer
          ? {
              id: statement.transfer.id,
              sender_id: statement.transfer.sender_id,
              description: statement.description,
              amount: statement.amount,
              type: statement.type,
              created_at: statement.created_at,
              updated_at: statement.updated_at,
            }
          : {
              id: statement.id,
              description: statement.description,
              amount: statement.amount,
              type: statement.type,
              created_at: statement.created_at,
              updated_at: statement.updated_at,
            }
      );
      return {
        //@ts-ignore
        statement: statementsMapped,
        balance,
      };
    }
    return {
      balance,
    };
  }
}
