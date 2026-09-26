import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  jti: string;

  @Column({ type: 'integer', name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({
    type: 'timestamptz',
    name: 'revoked_at',
    default: () => 'now()',
  })
  revokedAt: Date;
}
