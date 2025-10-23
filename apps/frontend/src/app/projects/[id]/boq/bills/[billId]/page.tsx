"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Calculator,
  ChevronRight as BreadcrumbChevron,
  Building,
  Package,
} from "lucide-react";
import CreateSectionForm from "@/components/forms/CreateSectionForm";
import CreateItemForm from "@/components/forms/CreateItemForm";
import BillTotals from "@/components/ui/BillTotals";
import { useCalculations } from "@/hooks/useCalculations";
import CollectionsManagement from "@/components/CollectionsManagement";
import { DashboardLayout } from "@/components/dashboard-layout";

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
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

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

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
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

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setShowCreateSectionForm(true);
  };

  const handleEditItem = (item: Item, sectionId: number) => {
    setEditingItem(item);
    setSelectedSectionId(sectionId);
    setShowCreateItemForm(true);
  };

  const handleDeleteSection = (section: Section) => {
    if (
      window.confirm(
        `Are you sure you want to delete section "${section.section_code}"? This will also delete all items within this section.`
      )
    ) {
      deleteSectionMutation.mutate(section.id);
    }
  };

  const handleDeleteItem = (item: Item) => {
    if (
      window.confirm(
        `Are you sure you want to delete item "${item.item_code}"?`
      )
    ) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleRecalculate = () => {
    recalculateMutation.mutate();
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getItemTypeBadge = (itemType: string) => {
    const badges: { [key: string]: string } = {
      MEASURED: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
      LUMP_SUM: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
      PC_SUM: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
      PROVISIONAL:
        "bg-orange-50 text-orange-700 border-orange-200 font-semibold",
      PERCENTAGE: "bg-teal-50 text-teal-700 border-teal-200 font-semibold",
      COLLECTION: "bg-gray-50 text-gray-700 border-gray-200 font-semibold",
    };
    return (
      badges[itemType] ||
      "bg-gray-50 text-gray-700 border-gray-200 font-semibold"
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-900 font-medium">
            Loading bill details...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !bill) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 font-medium">
            Error loading bill details. Please check your connection and try
            again.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header with Breadcrumbs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="px-6 py-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => router.push("/projects")}
              className="flex items-center hover:text-gray-950 transition-colors font-medium"
            >
              Projects
            </button>
            <BreadcrumbChevron className="w-4 h-4" />
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="hover:text-gray-950 transition-colors font-medium"
            >
              {project?.name || "Project"}
            </button>
            <BreadcrumbChevron className="w-4 h-4" />
            <button
              onClick={() => router.push(`/projects/${projectId}/boq`)}
              className="hover:text-gray-950 transition-colors font-medium"
            >
              BOQ
            </button>
            <BreadcrumbChevron className="w-4 h-4" />
            <span className="text-gray-950 font-semibold">
              {bill.bill_number}
            </span>
          </nav>

          {/* Bill Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-950 mb-1">
                {bill.bill_number}
              </h1>
              <p className="text-lg text-gray-900 font-semibold mb-2">
                {bill.bill_title}
              </p>
              {bill.description && (
                <p className="text-gray-700 font-medium">{bill.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRecalculate}
                disabled={recalculateMutation.isPending}
                className="bg-gray-100 text-gray-950 px-4 py-2.5 rounded-lg hover:bg-gray-200 flex items-center space-x-2 font-semibold transition-colors disabled:opacity-50"
              >
                <Calculator className="w-4 h-4" />
                <span>
                  {recalculateMutation.isPending
                    ? "Calculating..."
                    : "Recalculate"}
                </span>
              </button>
              <button
                onClick={() => setShowCreateSectionForm(true)}
                className="bg-gray-950 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 flex items-center space-x-2 font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Totals */}
      <BillTotals
        subtotal={calculations.subtotal}
        contingencyPercentage={bill.contingency_percentage}
        contingencyAmount={calculations.contingencyAmount}
        totalAmount={calculations.totalAmount}
        sectionCount={calculations.sectionCount}
        itemCount={calculations.itemCount}
      />

      {/* Sections List */}
      <div className="space-y-4">
        {bill.sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Section Header */}
            <div
              className="bg-gray-50 border-b border-gray-200 p-5 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-950 bg-white px-3 py-1 rounded-md border border-gray-200">
                        {section.section_code}
                      </span>
                      <h3 className="text-lg font-bold text-gray-950">
                        {section.section_title}
                      </h3>
                    </div>
                    {section.preamble && (
                      <p className="text-sm text-gray-700 mt-2 font-medium leading-relaxed">
                        {section.preamble}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-600 font-semibold mb-1">
                      Section Total
                    </div>
                    <div className="text-xl font-bold text-gray-950">
                      {formatCurrency(section.total_amount)}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSection(section);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Edit Section"
                    >
                      <Edit className="w-4 h-4 text-gray-600 hover:text-gray-950" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Section"
                      disabled={deleteSectionMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Items */}
            {expandedSections.has(section.id) && (
              <div>
                {/* Add Item Button */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 font-semibold">
                      {section.item_count} item
                      {section.item_count !== 1 ? "s" : ""} in this section
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openItemForm(section.id);
                      }}
                      className="bg-gray-950 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 flex items-center space-x-2 transition-colors font-medium shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {section.items.length > 0 ? (
                  <div className="p-6 space-y-4">
                    {section.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Checkbox */}
                          <div className="flex items-center pt-1">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="w-4 h-4 text-gray-950 border-gray-300 rounded focus:ring-gray-950"
                            />
                          </div>

                          {/* Item Number */}
                          <div className="flex items-center pt-1">
                            <div className="text-sm font-bold text-gray-700">
                              {index + 1}.{String(index + 1).padStart(2, "0")}
                            </div>
                          </div>

                          {/* Item Content */}
                          <div className="flex-1 min-w-0">
                            {/* Item Header with badges and actions */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-sm font-bold text-gray-950 bg-gray-100 px-3 py-1 rounded-md">
                                  {item.item_code}
                                </span>
                                <span
                                  className={`px-3 py-1 text-xs rounded-full border ${getItemTypeBadge(
                                    item.item_type
                                  )}`}
                                >
                                  {item.item_type.replace("_", " ")}
                                </span>
                              </div>

                              {/* Action Icons - Only Edit and Delete */}
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() =>
                                    handleEditItem(item, section.id)
                                  }
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Edit Item"
                                >
                                  <Edit className="w-4 h-4 text-gray-600 hover:text-gray-950" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Item"
                                  disabled={deleteItemMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-950 text-base leading-relaxed mb-4 font-medium">
                              {item.description}
                            </p>

                            {/* Calculation Details in Grid */}
                            <div className="grid grid-cols-4 gap-6 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium block mb-1">
                                  Quantity
                                </span>
                                <div className="font-bold text-gray-950">
                                  {formatNumber(item.quantity)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block mb-1">
                                  Unit
                                </span>
                                <div className="font-bold text-gray-950">
                                  {item.unit}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block mb-1">
                                  Rate
                                </span>
                                <div className="font-bold text-gray-950">
                                  {formatCurrency(item.rate)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block mb-1">
                                  Amount
                                </span>
                                <div className="font-bold text-gray-950 text-base">
                                  {formatCurrency(item.amount)}
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
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-950 mb-2">
                      No items in this section
                    </h3>
                    <p className="text-gray-700 mb-4 font-medium">
                      Add your first item to start building this section.
                    </p>
                    <button
                      onClick={() => openItemForm(section.id)}
                      className="bg-gray-950 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
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
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-950 mb-2">
            No sections found
          </h3>
          <p className="text-gray-700 mb-6 max-w-md mx-auto font-medium">
            Add your first section to start building this bill. Sections help
            organize different types of work.
          </p>
          <button
            onClick={() => setShowCreateSectionForm(true)}
            className="bg-gray-950 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            Create First Section
          </button>
        </div>
      )}

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
    </DashboardLayout>
  );
}
