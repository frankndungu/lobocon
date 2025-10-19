import { api } from "./api";
import {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from "./types";

// Collections API functions using your existing api instance
export const collectionsApi = {
  // Get all collections with optional filtering
  async getCollections(
    filters: {
      project_id?: string;
      section_id?: number;
      collection_type?: string;
    } = {}
  ) {
    const params = new URLSearchParams();
    if (filters.project_id) params.append("project_id", filters.project_id);
    if (filters.section_id)
      params.append("section_id", filters.section_id.toString());
    if (filters.collection_type)
      params.append("collection_type", filters.collection_type);

    const response = await api.get<Collection[]>(`/boq/collections?${params}`);
    return response.data;
  },

  // Get single collection by ID
  async getCollection(id: number) {
    const response = await api.get<Collection>(`/boq/collections/${id}`);
    return response.data;
  },

  // Create new collection
  async createCollection(collectionData: CreateCollectionData) {
    const response = await api.post<Collection>(
      "/boq/collections",
      collectionData
    );
    return response.data;
  },

  // Update collection
  async updateCollection(id: number, updateData: UpdateCollectionData) {
    const response = await api.patch<Collection>(
      `/boq/collections/${id}`,
      updateData
    );
    return response.data;
  },

  // Delete collection
  async deleteCollection(id: number) {
    await api.delete(`/boq/collections/${id}`);
  },
};

// Collection type constants
export const COLLECTION_TYPES = {
  PAGE_REFERENCE: "PAGE_REFERENCE",
  ITEM_COLLECTION: "ITEM_COLLECTION",
  DRAWING_REFERENCE: "DRAWING_REFERENCE",
  SPECIFICATION_REFERENCE: "SPECIFICATION_REFERENCE",
} as const;

// Collection type labels for display
export const COLLECTION_TYPE_LABELS = {
  [COLLECTION_TYPES.PAGE_REFERENCE]: "Page Reference",
  [COLLECTION_TYPES.ITEM_COLLECTION]: "Item Collection",
  [COLLECTION_TYPES.DRAWING_REFERENCE]: "Drawing Reference",
  [COLLECTION_TYPES.SPECIFICATION_REFERENCE]: "Specification Reference",
};

// Collection type colors for badges
export const COLLECTION_TYPE_COLORS = {
  [COLLECTION_TYPES.PAGE_REFERENCE]: "bg-blue-100 text-blue-800",
  [COLLECTION_TYPES.ITEM_COLLECTION]: "bg-green-100 text-green-800",
  [COLLECTION_TYPES.DRAWING_REFERENCE]: "bg-purple-100 text-purple-800",
  [COLLECTION_TYPES.SPECIFICATION_REFERENCE]: "bg-orange-100 text-orange-800",
};
