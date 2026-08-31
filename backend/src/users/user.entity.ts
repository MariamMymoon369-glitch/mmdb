import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from '../reviews/review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text', name: 'display_name' })
  displayName!: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt!: Date;

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];
}
