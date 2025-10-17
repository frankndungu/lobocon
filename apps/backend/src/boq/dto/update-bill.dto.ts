import { PartialType } from '@nestjs/mapped-types';
import { CreateBillDto } from './create-bill.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateBillDto extends PartialType(CreateBillDto) {
  // All fields from CreateBillDto are now optional for updates

  // Add any update-specific fields if needed
  @IsOptional()
  @IsNumber({}, { message: 'id must be a number' })
  @Min(1, { message: 'id must be positive' })
  id?: number;
}
