"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bill } from "@/lib/types";
import {
  Plus,
  Calculator,
  FileText,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import CreateBillForm from "@/components/forms/CreateBillForm";

export default function BOQManagement() {
  const params = useParams();
  const projectId = params.id as string;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const queryClient = useQueryClient();

  const {
    data: bills,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bills", projectId],
    queryFn: async () => {
      const response = await api.get<Bill[]>(
        `/boq/bills?project_id=${projectId}`
      );
      return response.data;
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (billId: number) => {
      await api.delete(`/boq/bills/${billId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills", projectId] });
    },
    onError: (error) => {
      console.error("Error deleting bill:", error);
      alert("Failed to delete bill. Please try again.");
    },
  });

  const recalculateBillMutation = useMutation({
    mutationFn: async (billId: number) => {
      await api.post(`/boq/bills/${billId}/recalculate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills", projectId] });
    },
    onError: (error) => {
      console.error("Error recalculating bill:", error);
      alert("Failed to recalculate bill. Please try again.");
    },
  });

  const handleDeleteBill = (bill: Bill) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${bill.bill_number}"? This will also delete all sections and items within this bill.`
      )
    ) {
      deleteBillMutation.mutate(bill.id);
    }
  };

  const handleRecalculate = (billId: number) => {
    recalculateBillMutation.mutate(billId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading BOQ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">
          Error loading bills. Please check your connection and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bill of Quantities
              </h1>
              <p className="text-gray-600 mt-1">Project BOQ Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bills</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Bill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bills?.map((bill) => (
            <div
              key={bill.id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {bill.bill_number}
                  </h3>
                  <p className="text-gray-600 mt-1">{bill.bill_title}</p>
                  {bill.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {bill.description}
                    </p>
                  )}
                </div>
                <div className="flex items-start space-x-2 ml-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      KES {Number(bill.total_amount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bill.contingency_percentage || 0}% contingency
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 ml-2">
                    <button
                      onClick={() => setEditingBill(bill)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors"
                      title="Edit Bill"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete Bill"
                      disabled={deleteBillMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Sections</div>
                  <div className="text-lg font-medium">
                    {bill.section_count || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Items</div>
                  <div className="text-lg font-medium">
                    {bill.item_count || 0}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 flex items-center justify-center space-x-2 transition-colors"
                  onClick={() =>
                    (window.location.href = `/projects/${projectId}/boq/bills/${bill.id}`)
                  }
                >
                  <FileText className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                  onClick={() => handleRecalculate(bill.id)}
                  disabled={recalculateBillMutation.isPending}
                >
                  <Calculator className="w-4 h-4" />
                  <span>
                    {recalculateBillMutation.isPending
                      ? "Calculating..."
                      : "Recalculate"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {bills?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bills found
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first bill to start building the BOQ.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Bill Modal */}
      <CreateBillForm
        projectId={projectId}
        isOpen={showCreateForm || !!editingBill}
        onClose={() => {
          setShowCreateForm(false);
          setEditingBill(null);
        }}
        editingBill={editingBill}
      />
    </div>
  );
}
