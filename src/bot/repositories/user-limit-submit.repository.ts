import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserLimitSubmitRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async updateUserAttemptSubmitCV(userId: string) {
    try {
      let user = await this.userRepository.findOne({
        where: { user_id: userId },
      });
      if (!user) {
        user = await this.userRepository.save({
          user_id: userId,
          total_cv_submitted: 1,
          max_allowed_cv_submitted: 20,
        });
        return user;
      }

      user.total_cv_submitted = user.total_cv_submitted + 1;
      return this.userRepository.save(user);
    } catch (error) {
      throw new Error('Error updating user attempt submit CV', error);
    }
  }

  async getUserAttemptSubmitCV(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });
      if (!user) {
        await this.userRepository.save({
          user_id: userId,
          total_cv_submitted: 0,
          max_allowed_cv_submitted: 20,
        });
        return 0;
      }
      return user.total_cv_submitted;
    } catch (error) {
      throw new Error('Error getting user attempt submit CV', error);
    }
  }
}
