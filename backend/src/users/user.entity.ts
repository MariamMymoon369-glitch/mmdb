import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Check,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Review } from '../reviews/review.entity';

@Entity('users')
@Check(`char_length("display_name") >= 3`)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true, default: () => 'gen_random_uuid()' })
  uuid: string;

  @Column({ type: 'varchar', length: 50, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 50, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', unique: true, nullable: false, length: 255 })
  email: string;

  @Column({
    type: 'varchar',
    name: 'display_name',
    nullable: false,
    length: 50,
  })
  displayName: string;

  @Column({
    type: 'varchar',
    name: 'password_hash',
    nullable: false,
    length: 255,
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    name: 'profile_picture_url',
    nullable: true,
    default: 'https://ui-avatars.com/api/?name=User&background=random',
  })
  profilePictureUrl: string;

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
  createdAt: Date;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
