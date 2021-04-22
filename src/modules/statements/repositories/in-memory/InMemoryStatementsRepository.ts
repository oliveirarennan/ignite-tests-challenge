import { Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();

    Object.assign(statement, data);

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(
      (operation) =>
        operation.id === statement_id && operation.user_id === user_id
    );
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statements: Statement[] }
  > {
    const statements = this.statements.filter(
      (operation) => operation.user_id === user_id
    );

    const balance = statements.reduce((acc, operation) => {
      if (operation.type === "withdraw") {
        return acc - Number(operation.amount);
      } else {
        return acc + Number(operation.amount);
      }
    }, 0);

    if (with_statement) {
      return {
        statements,
        balance,
      };
    }

    return { balance };
  }

  async getStatementByTransferId(
    transfer_id: string
  ): Promise<Statement[] | undefined> {
    const statements = this.statements.filter(
      (statement) => statement.transfer_id === transfer_id
    );

    return statements;
  }
}
