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
  ChevronRight as BreadcrumbChevron,
  Home,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import CreateBillForm from "@/components/forms/CreateBillForm";

interface Project {
  id: string;
  name: string;
}

export default function BOQManagement() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const queryClient = useQueryClient();

  // Fetch project details for breadcrumb
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response.data;
    },
  });

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
      // Sort bills by extracting numbers from bill_number
      const sortedBills = response.data.sort((a, b) => {
        const aNum = parseInt(a.bill_number.replace(/\D/g, "") || "0");
        const bNum = parseInt(b.bill_number.replace(/\D/g, "") || "0");
        return aNum - bNum;
      });
      return sortedBills;
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

  const handleViewBill = (billId: number) => {
    router.push(`/projects/${projectId}/boq/bills/${billId}`);
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
            <span className="text-gray-900 font-medium">BOQ</span>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bill of Quantities
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {project?.name || "Project"} BOQ Management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bills Overview</h2>
            <p className="text-gray-600 mt-1">
              {bills?.length || 0} bill{bills?.length !== 1 ? "s" : ""} in this
              project
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Bill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bills?.map((bill) => (
            <div
              key={bill.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {bill.bill_number}
                  </h3>
                  <p className="text-lg text-gray-700 font-medium mb-3">
                    {bill.bill_title}
                  </p>
                  {bill.description && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {bill.description}
                    </p>
                  )}
                </div>
                <div className="flex items-start space-x-3 ml-6">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      KES {Number(bill.total_amount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      +{bill.contingency_percentage || 0}% contingency
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-2">
                    <button
                      onClick={() => setEditingBill(bill)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                      title="Edit Bill"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete Bill"
                      disabled={deleteBillMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {bill.section_count || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    Section{bill.section_count !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {bill.item_count || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    Item{bill.item_count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 font-medium transition-colors"
                  onClick={() => handleViewBill(bill.id)}
                >
                  <FileText className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2 font-medium transition-colors disabled:opacity-50"
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
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No bills found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Create your first bill to start building the BOQ for this project.
              Bills help you organize different aspects of your construction
              project.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 flex items-center space-x-3 mx-auto font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
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
