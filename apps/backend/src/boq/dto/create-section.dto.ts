import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class CreateSectionDto {
  @IsUUID('4', { message: 'project_id must be a valid UUID' })
  @IsNotEmpty({ message: 'project_id is required' })
  project_id: string;

  @IsNumber({}, { message: 'bill_id must be a number' })
  @IsNotEmpty({ message: 'bill_id is required' })
  @IsPositive({ message: 'bill_id must be positive' })
  bill_id: number;

  @IsString({ message: 'section_code must be a string' })
  @IsNotEmpty({ message: 'section_code is required' })
  @MaxLength(20, { message: 'section_code cannot exceed 20 characters' })
  section_code: string;

  @IsString({ message: 'section_title must be a string' })
  @IsNotEmpty({ message: 'section_title is required' })
  @MaxLength(200, { message: 'section_title cannot exceed 200 characters' })
  section_title: string;

  @IsOptional()
  @IsString({ message: 'preamble must be a string' })
  @MaxLength(2000, { message: 'preamble cannot exceed 2000 characters' })
  preamble?: string;

  @IsOptional()
  @IsNumber({}, { message: 'sort_order must be a number' })
  @Min(0, { message: 'sort_order cannot be negative' })
  sort_order?: number;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @MaxLength(500, { message: 'notes cannot exceed 500 characters' })
  notes?: string;
}
