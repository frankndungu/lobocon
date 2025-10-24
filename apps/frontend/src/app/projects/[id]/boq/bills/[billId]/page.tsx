"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import CreateSectionForm from "@/components/forms/CreateSectionForm";
import CreateItemForm from "@/components/forms/CreateItemForm";
import BillTotals from "@/components/ui/BillTotals";
import { useCalculations } from "@/hooks/useCalculations";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BillBreadcrumb } from "@/components/bills/BillBreadcrumb";
import { BillHeader } from "@/components/bills/BillHeader";
import { SectionCard } from "@/components/bills/SectionCard";
import { EmptyState } from "@/components/bills/EmptyState";

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

  // Fetch project details
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

      if (response.data?.sections) {
        response.data.sections.sort((a, b) =>
          a.section_code.localeCompare(b.section_code)
        );
        response.data.sections.forEach((section) => {
          section.items.sort((a, b) => {
            if (a.sort_order && b.sort_order)
              return a.sort_order - b.sort_order;
            return a.item_code.localeCompare(b.item_code);
          });
        });
      }
      return response.data;
    },
  });

  // Mutations
  const recalculateMutation = useMutation({
    mutationFn: () => api.post(`/boq/bills/${billId}/recalculate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] });
      queryClient.invalidateQueries({ queryKey: ["bills", projectId] });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: number) => api.delete(`/boq/sections/${sectionId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => api.delete(`/boq/items/${itemId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] }),
  });

  const calculations = useCalculations(
    bill || { sections: [], contingency_percentage: 0 }
  );

  // Handlers
  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
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
        `Delete "${section.section_code}: ${section.section_title}"? This will delete all items in this section.`
      )
    ) {
      deleteSectionMutation.mutate(section.id);
    }
  };

  const handleDeleteItem = (item: Item) => {
    if (window.confirm(`Delete item "${item.item_code}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    const num = Number(amount) || 0;
    return `Ksh ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num: number) => {
    return Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
            Error loading bill. Please try again.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <BillBreadcrumb
        projectName={project?.name || "Project"}
        billNumber={bill.bill_number}
        onProjectClick={() => router.push(`/projects/${projectId}`)}
        onBoqClick={() => router.push(`/projects/${projectId}/boq`)}
      />

      {/* Header */}
      <BillHeader
        billNumber={bill.bill_number}
        billTitle={bill.bill_title}
        description={bill.description}
        onRecalculate={() => recalculateMutation.mutate()}
        onAddSection={() => setShowCreateSectionForm(true)}
        isRecalculating={recalculateMutation.isPending}
      />

      {/* Bill Totals - FIXED: Pass individual props instead of objects */}
      <BillTotals
        subtotal={calculations.subtotal}
        contingencyPercentage={bill.contingency_percentage}
        contingencyAmount={calculations.contingencyAmount}
        totalAmount={calculations.totalAmount}
        sectionCount={calculations.sectionCount}
        itemCount={calculations.itemCount}
      />

      {/* Sections */}
      <div className="space-y-6 mt-8">
        {bill.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            projectId={projectId}
            isExpanded={expandedSections.has(section.id)}
            selectedItems={selectedItems}
            onToggle={() => toggleSection(section.id)}
            onEdit={() => handleEditSection(section)}
            onDelete={() => handleDeleteSection(section)}
            onAddItem={() => openItemForm(section.id)}
            onEditItem={(item) => handleEditItem(item, section.id)}
            onDeleteItem={handleDeleteItem}
            onToggleItemSelection={toggleItemSelection}
            isDeleting={deleteSectionMutation.isPending}
            isDeletingItem={deleteItemMutation.isPending}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        ))}
      </div>

      {/* Empty State */}
      {bill.sections.length === 0 && (
        <EmptyState onCreateSection={() => setShowCreateSectionForm(true)} />
      )}

      {/* Modals */}
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
