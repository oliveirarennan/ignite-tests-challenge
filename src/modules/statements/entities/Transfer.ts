import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { User } from "../../users/entities/User";

@Entity("transfers")
class Transfer {
  @PrimaryColumn("uuid")
  id?: string;

  @Column()
  receiver_id: string;

  @ManyToOne(() => User, (receiver) => receiver.statement)
  @JoinColumn({ name: "receiver_id" })
  receiver: User;

  @Column()
  sender_id: string;

  @ManyToOne(() => User, (sender) => sender.statement)
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Transfer };
