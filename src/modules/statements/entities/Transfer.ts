import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { User } from "../../users/entities/User";
import { Statement } from "./Statement";

@Entity("transfers")
class Transfer {
  @PrimaryColumn("uuid")
  id?: string;

  @Column("uuid")
  sender_id: string;

  @ManyToOne(() => User, (sender) => sender.statement)
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @OneToMany(() => Statement, (statement) => statement.transfer)
  statements: Statement[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Transfer };
