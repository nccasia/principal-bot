import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CvFormEntity } from '../entities/cv-form.entity';
import { Repository } from 'typeorm';
import { CvSubmissionDto } from '../dtos/cv-submission.dto';

@Injectable()
export class CvFormRepository {
  constructor(
    @InjectRepository(CvFormEntity)
    private readonly cvFormRepository: Repository<CvFormEntity>,
  ) {}

  async createCvForm(submissionDto: CvSubmissionDto): Promise<CvFormEntity> {
    const newCvForm = this.cvFormRepository.create({
      fullname: submissionDto.fullname,
      email: submissionDto.email,
      phone: submissionDto.phone,
      candidateType: submissionDto['candidate-type'],
      position: submissionDto.position,
      branch: submissionDto.branch,
      cvSource: submissionDto['cv-source'],
      gender: submissionDto.gender,
      dob: submissionDto.dob || null,
      address: submissionDto.address || null,
      note: submissionDto.note || null,
      attachmentUrl: submissionDto.attachmentUrl,
    });
    return this.cvFormRepository.save(newCvForm);
  }
}
