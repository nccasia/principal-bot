import { Injectable } from '@nestjs/common';
import { CvFormRepository } from '../repositories/cv-form.repository';
import { CvSubmissionDto } from '../dtos/cv-submission.dto';

@Injectable()
export class CvFormService {
  constructor(private readonly cvFormRepository: CvFormRepository) {}

  async submitCvForm(sumissionDto: CvSubmissionDto) {
    return this.cvFormRepository.createCvForm(sumissionDto);
  }
}
