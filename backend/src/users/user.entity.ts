import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Review } from '../reviews/review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text', unique: true, nullable: false })
  email?: string;

  @Column({ type: 'text', name: 'display_name', nullable: false })
  displayName?: string;

  @Column({ type: 'text', name: 'password_hash', nullable: false })
  passwordHash?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  }

  @Column({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt?: Date;

  @OneToMany(() => Review, (review) => review.user)
  reviews?: Review[];
}
