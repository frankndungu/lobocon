export interface Project {
  id: string;
  name: string;
  code: string;
  city: string;
  county: string;
  type: string;
  stage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: number;
  project_id: string;
  bill_number: string;
  bill_title: string;
  description?: string;
  sort_order: number;
  subtotal_amount: number;
  contingency_percentage: number;
  contingency_amount: number;
  total_amount: number;
  section_count: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: number;
  project_id: string;
  section_id: number;
  parent_item_id?: number;
  collection_title: string;
  description: string;
  page_reference: string;
  document_reference?: string;
  collection_type: string;
  sort_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionData {
  project_id: string;
  section_id: number;
  parent_item_id?: number;
  collection_title: string;
  description: string;
  page_reference: string;
  document_reference?: string;
  collection_type: string;
  sort_order?: number;
  notes?: string;
}

export interface UpdateCollectionData {
  section_id?: number;
  parent_item_id?: number;
  collection_title?: string;
  description?: string;
  page_reference?: string;
  document_reference?: string;
  collection_type?: string;
  sort_order?: number;
  notes?: string;
}