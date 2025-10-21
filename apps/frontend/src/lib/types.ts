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
  // Relations for full hierarchy
  sections?: Section[];
  project?: Project;
}

export interface Section {
  id: number;
  project_id: string;
  bill_id: number;
  section_number: string;
  section_title: string;
  description?: string;
  sort_order: number;
  total_amount: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  items?: Item[];
  collections?: Collection[];
  bill?: Bill;
}

export interface Item {
  id: number;
  project_id: string;
  bill_id: number;
  section_id: number;
  item_code: string;
  description: string;
  item_type: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Relations
  section?: Section;
  collections?: Collection[];
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
  // Relations
  section?: Section;
  parent_item?: Item;
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

// Additional types for bill detail functionality
export interface BillStats {
  subtotal_amount: number;
  contingency_amount: number;
  total_amount: number;
  section_count: number;
  item_count: number;
  collection_count: number;
}

export interface CreateSectionData {
  project_id: string;
  bill_id: number;
  section_number: string;
  section_title: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateSectionData {
  section_number?: string;
  section_title?: string;
  description?: string;
  sort_order?: number;
}

export interface CreateItemData {
  project_id: string;
  bill_id: number;
  section_id: number;
  item_code: string;
  description: string;
  item_type: string;
  quantity: number;
  unit: string;
  rate: number;
  sort_order?: number;
}

export interface UpdateItemData {
  section_id?: number;
  item_code?: string;
  description?: string;
  item_type?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  sort_order?: number;
}
