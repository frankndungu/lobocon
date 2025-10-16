import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateBillDto {
  @IsUUID('4', { message: 'project_id must be a valid UUID' })
  @IsNotEmpty({ message: 'project_id is required' })
  project_id: string;

  @IsString({ message: 'bill_number must be a string' })
  @IsNotEmpty({ message: 'bill_number is required' })
  @MaxLength(50, { message: 'bill_number cannot exceed 50 characters' })
  bill_number: string;

  @IsString({ message: 'bill_title must be a string' })
  @IsNotEmpty({ message: 'bill_title is required' })
  @MaxLength(200, { message: 'bill_title cannot exceed 200 characters' })
  bill_title: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(1000, { message: 'description cannot exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'sort_order must be a number' })
  @Min(1, { message: 'sort_order must be at least 1' })
  @Max(999, { message: 'sort_order cannot exceed 999' })
  sort_order?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'contingency_percentage must be a number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'contingency_percentage cannot be negative' })
  @Max(100, { message: 'contingency_percentage cannot exceed 100%' })
  contingency_percentage?: number;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @MaxLength(500, { message: 'notes cannot exceed 500 characters' })
  notes?: string;
}
