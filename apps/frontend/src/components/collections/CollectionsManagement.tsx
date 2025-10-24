import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Tag,
  Book,
  Save,
} from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import {
  COLLECTION_TYPES,
  COLLECTION_TYPE_LABELS,
  COLLECTION_TYPE_COLORS,
} from "@/lib/collections-api";
import { CreateCollectionData } from "@/lib/types";

interface CollectionsManagementProps {
  projectId: string;
  sectionId?: number;
}

const CollectionsManagement: React.FC<CollectionsManagementProps> = ({
  projectId,
  sectionId,
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCollectionData>({
    project_id: projectId,
    section_id: sectionId || 0,
    collection_title: "",
    description: "",
    page_reference: "",
    document_reference: "",
    collection_type: COLLECTION_TYPES.PAGE_REFERENCE,
    notes: "",
    sort_order: 0,
  });

  // Use the collections hook
  const {
    collections,
    isLoading,
    createCollection,
    updateCollection,
    deleteCollection,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCollections(projectId, sectionId ? { section_id: sectionId } : {});

  // Filter and search collections
  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => {
      const matchesSearch =
        !searchQuery ||
        collection.collection_title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        collection.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        collection.page_reference
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesType =
        !filterType || collection.collection_type === filterType;

      return matchesSearch && matchesType;
    });
  }, [collections, searchQuery, filterType]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCollection) {
        await updateCollection(editingCollection.id, formData);
      } else {
        await createCollection(formData);
      }

      resetForm();
      setShowCreateForm(false);
      setEditingCollection(null);
    } catch (err) {
      console.error("Failed to save collection:", err);
      alert("Failed to save collection. Please try again.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      project_id: projectId,
      section_id: sectionId || 0,
      collection_title: "",
      description: "",
      page_reference: "",
      document_reference: "",
      collection_type: COLLECTION_TYPES.PAGE_REFERENCE,
      notes: "",
      sort_order: 0,
    });
  };

  // Handle edit
  const handleEdit = (collection: any) => {
    setFormData({
      project_id: projectId,
      section_id: collection.section_id,
      collection_title: collection.collection_title,
      description: collection.description,
      page_reference: collection.page_reference,
      document_reference: collection.document_reference || "",
      collection_type: collection.collection_type,
      notes: collection.notes || "",
      sort_order: collection.sort_order || 0,
    });
    setEditingCollection(collection);
    setShowCreateForm(true);
  };

  // Handle delete
  const handleDelete = async (collectionId: number) => {
    if (!window.confirm("Are you sure you want to delete this collection?"))
      return;

    try {
      await deleteCollection(collectionId);
    } catch (err) {
      console.error("Failed to delete collection:", err);
      alert("Failed to delete collection. Please try again.");
    }
  };

  // Collection type badge component
  const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        COLLECTION_TYPE_COLORS[type as keyof typeof COLLECTION_TYPE_COLORS]
      }`}
    >
      <Tag className="w-3 h-3 mr-1" />
      {COLLECTION_TYPE_LABELS[type as keyof typeof COLLECTION_TYPE_LABELS]}
    </span>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-950"></div>
        <span className="ml-2 text-gray-700 font-medium">
          Loading collections...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-950 flex items-center">
              <Book className="w-5 h-5 mr-2 text-gray-700" />
              Collections Management
            </h2>
            <p className="text-sm text-gray-700 mt-1 font-medium">
              Manage page references, document references, and item collections
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isCreating}
            className="inline-flex items-center px-4 py-2 bg-gray-950 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Collection
          </button>
        </div>

        {/* Search and filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white placeholder-gray-500 font-medium"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white font-medium"
          >
            <option value="">All Types</option>
            {Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Collections List */}
      <div className="p-6">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-950 mb-2">
              {searchQuery || filterType
                ? "No collections found"
                : "No collections yet"}
            </h3>
            <p className="text-gray-700 font-medium mb-4">
              {searchQuery || filterType
                ? "Try adjusting your search or filter"
                : "Add your first collection to track page references"}
            </p>
            {!searchQuery && !filterType && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gray-950 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
              >
                Add First Collection
              </button>
            )}
          </div>
        ) : (
          filteredCollections.map((collection) => (
            <div
              key={collection.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all mb-3 last:mb-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-950 mb-1">
                    {collection.collection_title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    {collection.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <TypeBadge type={collection.collection_type} />

                    <span className="inline-flex items-center text-xs text-gray-600 font-semibold">
                      <FileText className="w-3 h-3 mr-1" />
                      Page: {collection.page_reference}
                    </span>

                    {collection.document_reference && (
                      <span className="inline-flex items-center text-xs text-gray-600 font-semibold">
                        Doc: {collection.document_reference}
                      </span>
                    )}
                  </div>

                  {collection.notes && (
                    <p className="text-xs text-gray-600 italic font-medium">
                      Note: {collection.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(collection)}
                    disabled={isUpdating}
                    className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-950 rounded-lg disabled:opacity-50 transition-colors"
                    title="Edit collection"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    disabled={isDeleting}
                    className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg disabled:opacity-50 transition-colors"
                    title="Delete collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-950">
                  {editingCollection
                    ? "Edit Collection"
                    : "Create New Collection"}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Collection Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.collection_title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          collection_title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white placeholder-gray-500 font-medium"
                      placeholder="Enter collection title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Collection Type *
                    </label>
                    <select
                      required
                      value={formData.collection_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          collection_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white font-medium"
                    >
                      {Object.entries(COLLECTION_TYPE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white placeholder-gray-500 font-medium"
                    placeholder="Enter collection description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Page Reference *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.page_reference}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page_reference: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white placeholder-gray-500 font-medium"
                      placeholder="e.g., P-001, Drawing 1.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Document Reference
                    </label>
                    <input
                      type="text"
                      value={formData.document_reference}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          document_reference: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white placeholder-gray-500 font-medium"
                      placeholder="e.g., SPEC-001, DWG-A001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950 bg-white placeholder-gray-500 font-medium"
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCollection(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-950 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center px-4 py-2 bg-gray-950 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editingCollection
                    ? "Update Collection"
                    : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsManagement;
