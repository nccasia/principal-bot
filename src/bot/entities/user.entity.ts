import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  total_cv_submitted: number;

  @Column({ default: 20 })
  max_allowed_cv_submitted: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
