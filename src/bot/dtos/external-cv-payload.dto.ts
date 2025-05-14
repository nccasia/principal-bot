import {
  IsEmail,
  IsNumber,
  IsString,
  Length,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class ExternalCvPayloadDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên không hợp lệ' })
  Name: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  Email: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại không hợp lệ' })
  @Length(10, 10, { message: 'Số điện thoại không hợp lệ (vd: 0123456789)' })
  Phone: string;

  @IsNotEmpty({ message: 'Vị trí không được để trống' })
  @IsNumber({}, { message: 'Vị trí không hợp lệ' })
  SubPositionId: number;

  @IsNotEmpty({ message: 'Chi nhánh không được để trống' })
  @IsNumber({}, { message: 'Chi nhánh không hợp lệ' })
  BranchId: number;

  @IsNotEmpty({ message: 'Nguồn CV không được để trống' })
  @IsNumber({}, { message: 'Nguồn CV không hợp lệ' })
  CVSourceId: number;

  @IsOptional()
  @IsString({ message: 'Ngày sinh không hợp lệ' })
  Birthday: string; // Should be in 'YYYY-MM-DD' or ISO 8601 date-time format

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsBoolean()
  IsFemale: boolean;

  @IsOptional()
  @IsString({ message: 'Địa chỉ không hợp lệ' })
  Address: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú không hợp lệ' })
  Note: string;

  @IsNotEmpty({ message: 'Link CV không được để trống' })
  @IsString({ message: 'Link CV không hợp lệ' })
  LinkCV: string;
}
