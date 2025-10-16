import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { ItemType } from '../entities/item.entity';

export class CreateItemDto {
  @IsUUID('4', { message: 'project_id must be a valid UUID' })
  @IsNotEmpty({ message: 'project_id is required' })
  project_id: string;

  @IsNumber({}, { message: 'section_id must be a number' })
  @IsNotEmpty({ message: 'section_id is required' })
  @IsPositive({ message: 'section_id must be positive' })
  section_id: number;

  @IsEnum(ItemType, {
    message:
      'item_type must be one of: MEASURED, LUMP_SUM, PRIME_COST, PROVISIONAL, ATTENDANT, COLLECTION',
  })
  @IsNotEmpty({ message: 'item_type is required' })
  item_type: ItemType;

  @IsString({ message: 'item_code must be a string' })
  @IsNotEmpty({ message: 'item_code is required' })
  @MaxLength(20, { message: 'item_code cannot exceed 20 characters' })
  item_code: string;

  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description is required' })
  @MaxLength(500, { message: 'description cannot exceed 500 characters' })
  description: string;

  @IsOptional()
  @IsString({ message: 'ksmm_reference must be a string' })
  @MaxLength(50, { message: 'ksmm_reference cannot exceed 50 characters' })
  ksmm_reference?: string;

  @IsOptional()
  @IsString({ message: 'remarks must be a string' })
  @MaxLength(300, { message: 'remarks cannot exceed 300 characters' })
  remarks?: string;

  @IsOptional()
  @IsString({ message: 'page_reference must be a string' })
  @MaxLength(50, { message: 'page_reference cannot exceed 50 characters' })
  page_reference?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'quantity must be a number with max 2 decimal places' },
  )
  @IsNotEmpty({ message: 'quantity is required' })
  @IsPositive({ message: 'quantity must be positive' })
  quantity: number;

  @IsString({ message: 'unit must be a string' })
  @IsNotEmpty({ message: 'unit is required' })
  @MaxLength(20, { message: 'unit cannot exceed 20 characters' })
  unit: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'rate must be a number with max 2 decimal places' },
  )
  @IsNotEmpty({ message: 'rate is required' })
  @Min(0, { message: 'rate cannot be negative' })
  rate: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'amount must be a number with max 2 decimal places' },
  )
  @Min(0, { message: 'amount cannot be negative' })
  amount?: number;
}
