"use client";

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
  ChevronRight as BreadcrumbChevron,
  Home,
} from "lucide-react";
import { useState } from "react";
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
}

interface BillWithSections {
  id: number;
  bill_number: string;
  bill_title: string;
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

  const queryClient = useQueryClient();

  // Fetch project details for breadcrumb
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response.data;
    },
  });

  const { data: bill, isLoading } = useQuery({
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
      }
      return response.data;
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

  const getItemTypeBadge = (type: string) => {
    const styles = {
      MEASURED: "bg-blue-100 text-blue-800",
      LUMP_SUM: "bg-purple-100 text-purple-800",
      PRIME_COST: "bg-orange-100 text-orange-800",
      PROVISIONAL: "bg-yellow-100 text-yellow-800",
      ATTENDANT: "bg-gray-100 text-gray-800",
      COLLECTION: "bg-green-100 text-green-800",
    };
    return styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading bill details...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Bill not found</div>
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {bill.bill_number}
                </h1>
                <p className="text-gray-600 mt-1">{bill.bill_title}</p>
              </div>
            </div>

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
          <h2 className="text-xl font-semibold text-gray-900">Sections</h2>
          <button
            onClick={() => setShowCreateSectionForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {bill.sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm border"
            >
              {/* Section Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.section_code}: {section.section_title}
                      </h3>
                      {section.preamble && (
                        <p className="text-sm text-gray-600 mt-1">
                          {section.preamble}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        KES {Number(section.total_amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {section.item_count} items
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSection(section);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Section"
                      >
                        <Edit className="w-4 h-4 text-gray-600 hover:text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete Section"
                        disabled={deleteSectionMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              {expandedSections.has(section.id) && (
                <div className="border-t bg-gray-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Items</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openItemForm(section.id);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-mono text-sm font-medium">
                                  {item.item_code}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getItemTypeBadge(
                                    item.item_type
                                  )}`}
                                >
                                  {item.item_type}
                                </span>
                              </div>
                              <p className="text-gray-900 text-sm">
                                {item.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                <span>Unit: {item.unit}</span>
                                <span>
                                  Rate: KES {Number(item.rate).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                KES {Number(item.amount).toLocaleString()}
                              </div>
                              <div className="flex space-x-1 mt-2">
                                <button
                                  onClick={() =>
                                    handleEditItem(item, section.id)
                                  }
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit Item"
                                >
                                  <Edit className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Delete Item"
                                  disabled={deleteItemMutation.isPending}
                                >
                                  <Trash2 className="w-3 h-3 text-gray-600 hover:text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Collections */}
              {expandedSections.has(section.id) && (
                <div className="border-t bg-gray-50">
                  <div className="p-4">
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
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No sections found</div>
            <p className="text-gray-600">
              Add your first section to start building this bill.
            </p>
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
