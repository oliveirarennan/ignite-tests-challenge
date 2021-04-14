import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddTransferToStatement1618324556248 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "transfer_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
        name: "FKTransferStatement",
        columnNames: ["transfer_id"],
        referencedTableName: "transfers",
        referencedColumnNames: ["id"],
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("statements", "FKTransferStatement");
    await queryRunner.dropColumn("statements", "transfer_id");
  }
}
