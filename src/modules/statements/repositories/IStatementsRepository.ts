import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";

type StatementTransfer = {
  statement: {
    id?: string;
    user_id?: string;
    sender_id?: string;
    description: string;
    amount: number;
    type: string;
    created_at: Date;
    updated_at?: Date;
  };
};

export interface IStatementsRepository {
  create: (data: ICreateStatementDTO) => Promise<Statement>;
  findStatementOperation: (
    data: IGetStatementOperationDTO
  ) => Promise<Statement | undefined>;
  getUserBalance: (
    data: IGetBalanceDTO
  ) => Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  >;
}
