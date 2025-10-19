import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsApi } from "@/lib/collections-api";
import {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from "@/lib/types";

export function useCollections(
  projectId: string,
  filters: {
    section_id?: number;
    collection_type?: string;
  } = {}
) {
  const queryClient = useQueryClient();

  // Query for fetching collections
  const {
    data: collections = [],
    isLoading,
    error,
    refetch: loadCollections,
  } = useQuery({
    queryKey: ["collections", projectId, filters],
    queryFn: () =>
      collectionsApi.getCollections({ project_id: projectId, ...filters }),
    enabled: !!projectId,
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: (data: CreateCollectionData) =>
      collectionsApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", projectId] });
      queryClient.invalidateQueries({ queryKey: ["bill-full"] });
    },
    onError: (error: any) => {
      console.error("Error creating collection:", error);
      throw error;
    },
  });

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCollectionData }) =>
      collectionsApi.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", projectId] });
      queryClient.invalidateQueries({ queryKey: ["bill-full"] });
    },
    onError: (error: any) => {
      console.error("Error updating collection:", error);
      throw error;
    },
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: (id: number) => collectionsApi.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", projectId] });
      queryClient.invalidateQueries({ queryKey: ["bill-full"] });
    },
    onError: (error: any) => {
      console.error("Error deleting collection:", error);
      throw error;
    },
  });

  // Helper functions
  const getCollectionsBySection = (sectionId: number): Collection[] => {
    return collections.filter((c) => c.section_id === sectionId);
  };

  const createCollection = async (
    data: CreateCollectionData
  ): Promise<Collection> => {
    return createCollectionMutation.mutateAsync(data);
  };

  const updateCollection = async (
    id: number,
    data: UpdateCollectionData
  ): Promise<Collection> => {
    return updateCollectionMutation.mutateAsync({ id, data });
  };

  const deleteCollection = async (id: number): Promise<void> => {
    return deleteCollectionMutation.mutateAsync(id);
  };

  return {
    // Data
    collections,
    isLoading,
    error,

    // Actions
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,

    // Helper functions
    getCollectionsBySection,

    // Mutation states
    isCreating: createCollectionMutation.isPending,
    isUpdating: updateCollectionMutation.isPending,
    isDeleting: deleteCollectionMutation.isPending,
  };
}
