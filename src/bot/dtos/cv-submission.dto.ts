import { IsString, IsUrl } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { CvFormDto } from './cv-form.dto';

export class CvSubmissionDto extends CvFormDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  attachmentUrl: string;
}
