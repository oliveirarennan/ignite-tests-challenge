type ViewStatement = {
  id?: string;
  user_id?: string;
  sender_id?: string;
  description: string;
  amount: number;
  type: string;
  created_at: Date;
  updated_at: Date;
};

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: ViewStatement[];
    balance: number;
  }) {
    const parsedStatement = statement.map(
      ({
        id,
        amount,
        description,
        type,
        created_at,
        updated_at,
        sender_id,
      }) => ({
        id,
        sender_id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
      })
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
