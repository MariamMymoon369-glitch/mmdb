import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true, default: () => 'gen_random_uuid()' })
  uuid: string;

  @Column({ type: 'varchar', length: 50, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 50, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

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

  @Column({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;
}
