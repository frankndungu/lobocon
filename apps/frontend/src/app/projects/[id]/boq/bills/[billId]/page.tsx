"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Calculator,
  ChevronRight as BreadcrumbChevron,
  Home,
  Building,
  Package,
  GripVertical,
  Hash,
} from "lucide-react";
import CreateSectionForm from "@/components/forms/CreateSectionForm";
import CreateItemForm from "@/components/forms/CreateItemForm";
import BillTotals from "@/components/ui/BillTotals";
import { useCalculations } from "@/hooks/useCalculations";
import CollectionsManagement from "@/components/CollectionsManagement";

interface Section {
  id: number;
  section_code: string;
  section_title: string;
  preamble?: string;
  total_amount: number;
  item_count: number;
  items: Item[];
}

interface Item {
  id: number;
  item_code: string;
  description: string;
  item_type: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  sort_order?: number;
}

interface BillWithSections {
  id: number;
  bill_number: string;
  bill_title: string;
  description?: string;
  subtotal_amount: number;
  contingency_percentage: number;
  contingency_amount: number;
  total_amount: number;
  sections: Section[];
}

interface Project {
  id: string;
  name: string;
}

export default function BillDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const billId = params.billId as string;

  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );
  const [showCreateSectionForm, setShowCreateSectionForm] = useState(false);
  const [showCreateItemForm, setShowCreateItemForm] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);

  const queryClient = useQueryClient();

  // Fetch project details for breadcrumb
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response.data;
    },
  });

  // Fetch full bill with hierarchy
  const {
    data: bill,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bill-full", billId],
    queryFn: async () => {
      const response = await api.get<BillWithSections>(
        `/boq/bills/${billId}/full`
      );
      // Sort sections by section_code alphabetically (A, B, C, D...)
      if (response.data?.sections) {
        response.data.sections.sort((a, b) => {
          return a.section_code.localeCompare(b.section_code);
        });
        // Sort items within each section by sort_order or item_code
        response.data.sections.forEach((section) => {
          section.items.sort((a, b) => {
            if (a.sort_order && b.sort_order) {
              return a.sort_order - b.sort_order;
            }
            return a.item_code.localeCompare(b.item_code);
          });
        });
      }
      return response.data;
    },
  });

  // Recalculate bill mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/boq/bills/${billId}/recalculate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] });
      queryClient.invalidateQueries({ queryKey: ["bills", projectId] });
    },
    onError: (error) => {
      console.error("Error recalculating bill:", error);
      alert("Failed to recalculate bill. Please try again.");
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: number) => {
      await api.delete(`/boq/sections/${sectionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] });
    },
    onError: (error) => {
      console.error("Error deleting section:", error);
      alert("Failed to delete section. Please try again.");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/boq/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] });
    },
    onError: (error) => {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    },
  });

  // Reorder items mutation
  const reorderItemsMutation = useMutation({
    mutationFn: async (
      reorderData: { item_id: number; new_sort_order: number }[]
    ) => {
      await api.patch(`/boq/items/reorder`, { items: reorderData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] });
    },
    onError: (error) => {
      console.error("Error reordering items:", error);
      alert("Failed to reorder items. Please try again.");
    },
  });

  const calculations = useCalculations(
    bill || {
      sections: [],
      contingency_percentage: 0,
    }
  );

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const openItemForm = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    setShowCreateItemForm(true);
  };

  const closeItemForm = () => {
    setShowCreateItemForm(false);
    setSelectedSectionId(null);
    setEditingItem(null);
  };

  const handleDeleteSection = (section: Section) => {
    if (
      window.confirm(
        `Are you sure you want to delete section "${section.section_code}: ${section.section_title}"? This will also delete all items within this section.`
      )
    ) {
      deleteSectionMutation.mutate(section.id);
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setShowCreateSectionForm(true);
  };

  const handleDeleteItem = (item: Item) => {
    if (
      window.confirm(
        `Are you sure you want to delete item "${
          item.item_code
        }: ${item.description.substring(0, 50)}..."?`
      )
    ) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleEditItem = (item: Item, sectionId: number) => {
    setEditingItem(item);
    setSelectedSectionId(sectionId);
    setShowCreateItemForm(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: Item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    targetItem: Item,
    sectionItems: Item[]
  ) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = sectionItems.findIndex(
      (item) => item.id === draggedItem.id
    );
    const targetIndex = sectionItems.findIndex(
      (item) => item.id === targetItem.id
    );

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Create reorder data
    const reorderData = sectionItems.map((item, index) => {
      let newOrder = index + 1;

      if (index === targetIndex) {
        newOrder = draggedIndex + 1;
      } else if (
        draggedIndex < targetIndex &&
        index > draggedIndex &&
        index <= targetIndex
      ) {
        newOrder = index;
      } else if (
        draggedIndex > targetIndex &&
        index >= targetIndex &&
        index < draggedIndex
      ) {
        newOrder = index + 2;
      }

      return {
        item_id: item.id,
        new_sort_order: newOrder,
      };
    });

    reorderItemsMutation.mutate(reorderData);
    setDraggedItem(null);
  };

  const getItemTypeBadge = (type: string) => {
    const styles = {
      MEASURED: "bg-blue-100 text-blue-800 border-blue-200",
      LUMP_SUM: "bg-purple-100 text-purple-800 border-purple-200",
      PRIME_COST: "bg-orange-100 text-orange-800 border-orange-200",
      PROVISIONAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ATTENDANT: "bg-gray-100 text-gray-800 border-gray-200",
      COLLECTION: "bg-green-100 text-green-800 border-green-200",
    };
    return (
      styles[type as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading bill details...</div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">
          Error loading bill. Please check your connection and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumbs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => router.push("/projects")}
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Projects
            </button>
            <BreadcrumbChevron className="w-4 h-4" />
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="hover:text-blue-600 transition-colors"
            >
              {project?.name || "Project"}
            </button>
            <BreadcrumbChevron className="w-4 h-4" />
            <button
              onClick={() => router.push(`/projects/${projectId}/boq`)}
              className="hover:text-blue-600 transition-colors"
            >
              BOQ
            </button>
            <BreadcrumbChevron className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {bill.bill_number}
            </span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/projects/${projectId}/boq`)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {bill.bill_number}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{bill.bill_title}</p>
                {bill.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {bill.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => recalculateMutation.mutate()}
                disabled={recalculateMutation.isPending}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Calculator className="w-4 h-4" />
                <span>
                  {recalculateMutation.isPending
                    ? "Calculating..."
                    : "Recalculate"}
                </span>
              </button>
            </div>
          </div>

          {/* Bill Totals Header */}
          <div className="mt-6">
            <BillTotals
              subtotal={calculations.subtotal}
              contingencyPercentage={bill.contingency_percentage}
              contingencyAmount={calculations.contingencyAmount}
              totalAmount={calculations.totalAmount}
              sectionCount={calculations.sectionCount}
              itemCount={calculations.itemCount}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Sections</span>
          </h2>
          <button
            onClick={() => setShowCreateSectionForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {bill.sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Section Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {section.section_code}: {section.section_title}
                      </h3>
                      {section.preamble && (
                        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                          {section.preamble}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatCurrency(section.total_amount)}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {section.item_count} item
                        {section.item_count !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSection(section);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Edit Section"
                      >
                        <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete Section"
                        disabled={deleteSectionMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              {expandedSections.has(section.id) && (
                <div className="border-t border-gray-100">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>Items</span>
                        <span className="text-sm text-gray-500 font-normal">
                          ({section.items.length})
                        </span>
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openItemForm(section.id);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>

                  {section.items.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {section.items.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, item, section.items)}
                          className={`px-6 py-5 hover:bg-gray-50 transition-colors cursor-move ${
                            draggedItem?.id === item.id ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            {/* Drag Handle */}
                            <div className="flex items-center pt-1">
                              <GripVertical className="w-4 h-4 text-gray-300" />
                            </div>

                            {/* Item Number */}
                            <div className="flex items-center pt-1">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600">
                                  {index + 1}
                                </span>
                              </div>
                            </div>

                            {/* Item Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {/* Item Header */}
                                  <div className="flex items-center space-x-3 mb-3">
                                    <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                                      {item.item_code}
                                    </span>
                                    <span
                                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getItemTypeBadge(
                                        item.item_type
                                      )}`}
                                    >
                                      {item.item_type.replace("_", " ")}
                                    </span>
                                  </div>

                                  {/* Description */}
                                  <p className="text-gray-900 text-base leading-relaxed mb-4 pr-4">
                                    {item.description}
                                  </p>

                                  {/* Calculation Details */}
                                  <div className="grid grid-cols-3 gap-6 text-sm">
                                    <div>
                                      <span className="text-gray-500 font-medium">
                                        Quantity
                                      </span>
                                      <div className="font-semibold text-gray-900 text-lg">
                                        {item.quantity.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 font-medium">
                                        Unit
                                      </span>
                                      <div className="font-semibold text-gray-900 text-lg">
                                        {item.unit}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 font-medium">
                                        Rate
                                      </span>
                                      <div className="font-semibold text-gray-900 text-lg">
                                        {formatCurrency(item.rate)}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Amount and Actions */}
                                <div className="text-right ml-6">
                                  <div className="text-2xl font-bold text-gray-900 mb-2">
                                    {formatCurrency(item.amount)}
                                  </div>
                                  <div className="text-xs text-gray-500 mb-3">
                                    {item.quantity} ×{" "}
                                    {formatCurrency(item.rate)}
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() =>
                                        handleEditItem(item, section.id)
                                      }
                                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                      title="Edit Item"
                                    >
                                      <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item)}
                                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                      title="Delete Item"
                                      disabled={deleteItemMutation.isPending}
                                    >
                                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No items in this section
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Add your first item to start building this section.
                      </p>
                      <button
                        onClick={() => openItemForm(section.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add First Item
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Collections */}
              {expandedSections.has(section.id) && (
                <div className="border-t border-gray-100">
                  <div className="p-6">
                    <CollectionsManagement
                      projectId={projectId}
                      sectionId={section.id}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {bill.sections.length === 0 && (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No sections found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add your first section to start building this bill. Sections help
              organize different types of work.
            </p>
            <button
              onClick={() => setShowCreateSectionForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Section
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Section Modal */}
      <CreateSectionForm
        projectId={projectId}
        billId={billId}
        isOpen={showCreateSectionForm}
        onClose={() => {
          setShowCreateSectionForm(false);
          setEditingSection(null);
        }}
        editingSection={editingSection}
      />

      {/* Create/Edit Item Modal */}
      {selectedSectionId && (
        <CreateItemForm
          projectId={projectId}
          billId={billId}
          sectionId={selectedSectionId}
          isOpen={showCreateItemForm}
          onClose={closeItemForm}
          editingItem={editingItem}
        />
      )}
    </div>
  );
}
