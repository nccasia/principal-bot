import { Body, Controller, Get, Post } from '@nestjs/common';
import { CvFormService } from '../services/cv-form.service';
import { CvSubmissionDto } from '../dtos/cv-submission.dto';
import { TalentApiService } from '../services/talent-api.service';

@Controller('cv-form')
export class CvFormController {
  constructor(
    private readonly cvFormService: CvFormService,
    private readonly talentApiService: TalentApiService,
  ) {}

  @Post('submit')
  async submitCvForm(@Body() sumissionDto: CvSubmissionDto) {
    return await this.cvFormService.submitCvForm(sumissionDto);
  }

  @Get('form-data')
  async getFormData(): Promise<any> {
    return await this.talentApiService.getFormData();
  }
}
