import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MezonModule } from 'src/mezon/mezon.module';
import { Asterisk } from './commands/asterisk/asterisk';
import { ApplyCVCommand } from './commands/asterisk/apply-cv/apply-cv.command';
import { MessageButtonClickListener } from './listeners/message-button-click.listener';
import { CvFormRepository } from './repositories/cv-form.repository';
import { CvFormEntity } from './entities/cv-form.entity';
import { BranchEntity } from './entities/branch.entity';
import { PositionEntity } from './entities/position.entity';
import { CvSourceEntity } from './entities/cv-source.entity';
import { BranchPositionEntity } from './entities/branch-position.entity';
import { CvFormController } from './controllers/cv-form.controller';
import { CvFormService } from './services/cv-form.service';
import { TalentApiService } from './services/talent-api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CvFormEntity,
      BranchEntity,
      PositionEntity,
      CvSourceEntity,
      BranchPositionEntity,
    ]),
    MulterModule.register({
      dest: './files',
    }),
    DiscoveryModule,
    ConfigModule,
    MezonModule.forRootAsync({
      imports: [ConfigModule],
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [CvFormController],
  providers: [
    Asterisk,
    ApplyCVCommand,
    MessageButtonClickListener,
    CvFormRepository,
    CvFormService,
    TalentApiService,
  ],
  exports: [Asterisk, CvFormRepository],
})
export class BotModule {}
