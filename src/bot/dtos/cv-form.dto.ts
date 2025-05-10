/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CvFormDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên không hợp lệ (vd: Nguyễn Văn A)' })
  fullname: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ (vd: nguyenvana@gmail.com)' })
  email: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại không hợp lệ' })
  @Length(10, 10, { message: 'Số điện thoại không hợp lệ (vd: 0123456789)' })
  phone: string;

  @IsNotEmpty({ message: 'Loại ứng viên không được để trống' })
  @IsIn(['internship', 'fresher', 'junior', 'middle', 'senior'], {
    message: 'Loại ứng viên không hợp lệ',
  })
  'candidate-type': string;

  @IsNotEmpty({ message: 'Vị trí không được để trống' })
  position: string;

  @IsNotEmpty({ message: 'Chi nhánh không được để trống' })
  branch: string;

  @IsNotEmpty({ message: 'Nguồn CV không được để trống' })
  'cv-source': string;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsIn(['male', 'female'], { message: 'Giới tính không hợp lệ' })
  gender: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
