enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export type ICreateStatementDTO = {
  user_id: string;
  description: string;
  amount: number;
  type: OperationType;
  transfer_id?: string;
};
