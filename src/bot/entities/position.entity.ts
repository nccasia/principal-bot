import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { BranchPositionEntity } from './branch-position.entity';

@Entity('positions')
export class PositionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @OneToMany(
    () => BranchPositionEntity,
    (branchPosition) => branchPosition.position,
    { cascade: true },
  )
  branchPositions: BranchPositionEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
