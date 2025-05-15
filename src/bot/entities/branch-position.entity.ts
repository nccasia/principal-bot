import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BranchEntity } from './branch.entity';
import { PositionEntity } from './position.entity';

@Entity('branch_positions')
export class BranchPositionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  branchId: number;

  @Column()
  positionId: number;

  @ManyToOne(() => BranchEntity, (branch) => branch.branchPositions)
  @JoinColumn({ name: 'branchId' })
  branch: BranchEntity;

  @ManyToOne(() => PositionEntity, (position) => position.branchPositions)
  @JoinColumn({ name: 'positionId' })
  position: PositionEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
