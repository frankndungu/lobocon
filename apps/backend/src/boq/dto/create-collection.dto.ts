import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsPositive,
  IsEnum,
} from 'class-validator';

// Collection types from your entity
enum CollectionType {
  PAGE_REFERENCE = 'PAGE_REFERENCE',
  ITEM_COLLECTION = 'ITEM_COLLECTION',
  DRAWING_REFERENCE = 'DRAWING_REFERENCE',
  SPECIFICATION_REFERENCE = 'SPECIFICATION_REFERENCE',
}

export class CreateCollectionDto {
  @IsUUID('4', { message: 'project_id must be a valid UUID' })
  @IsNotEmpty({ message: 'project_id is required' })
  project_id: string;

  @IsNumber({}, { message: 'section_id must be a number' })
  @IsNotEmpty({ message: 'section_id is required' })
  @IsPositive({ message: 'section_id must be positive' })
  section_id: number;

  @IsOptional()
  @IsNumber({}, { message: 'parent_item_id must be a number' })
  @IsPositive({ message: 'parent_item_id must be positive' })
  parent_item_id?: number;

  @IsString({ message: 'collection_title must be a string' })
  @IsNotEmpty({ message: 'collection_title is required' })
  @MaxLength(200, { message: 'collection_title cannot exceed 200 characters' })
  collection_title: string;

  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description is required' })
  @MaxLength(1000, { message: 'description cannot exceed 1000 characters' })
  description: string;

  @IsString({ message: 'page_reference must be a string' })
  @IsNotEmpty({ message: 'page_reference is required' })
  @MaxLength(100, { message: 'page_reference cannot exceed 100 characters' })
  page_reference: string;

  @IsOptional()
  @IsString({ message: 'document_reference must be a string' })
  @MaxLength(100, {
    message: 'document_reference cannot exceed 100 characters',
  })
  document_reference?: string;

  @IsOptional()
  @IsNumber({}, { message: 'sort_order must be a number' })
  @Min(0, { message: 'sort_order cannot be negative' })
  sort_order?: number;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @MaxLength(500, { message: 'notes cannot exceed 500 characters' })
  notes?: string;

  @IsOptional()
  @IsEnum(CollectionType, {
    message:
      'collection_type must be one of: PAGE_REFERENCE, ITEM_COLLECTION, DRAWING_REFERENCE, SPECIFICATION_REFERENCE',
  })
  collection_type?: CollectionType;
}
