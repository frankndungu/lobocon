"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bill } from "@/lib/types";
import {
  Plus,
  Search,
  Filter,
  FileText,
  LayoutGrid,
  Table as TableIcon,
  BarChart3,
  TrendingUp,
  UploadIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import CreateBillForm from "@/components/forms/CreateBillForm";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BillsCardView } from "@/components/bills/BillsCardView";
import { BillsTableView } from "@/components/bills/BillsTableView";
import { BillsSummaryView } from "@/components/bills/BillsSummaryView";

interface Project {
  id: string;
  name: string;
  code: string;
  client?: string;
  city?: string;
  start_date?: string;
}

type ViewMode = "card" | "table" | "summary";

export default function BOQManagement() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response.data;
    },
  });

  // Fetch bills
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
      const sortedBills = response.data.sort((a, b) => {
        const aNum = parseInt(a.bill_number.replace(/\D/g, "") || "0");
        const bNum = parseInt(b.bill_number.replace(/\D/g, "") || "0");
        return aNum - bNum;
      });
      return sortedBills;
    },
  });

  // Filter bills based on search query (client-side filtering)
  const filteredBills = useMemo(() => {
    if (!bills) return [];
    if (!searchQuery.trim()) return bills;

    const query = searchQuery.toLowerCase();
    return bills.filter((bill) => {
      return (
        bill.bill_number.toLowerCase().includes(query) ||
        bill.bill_title.toLowerCase().includes(query) ||
        bill.description?.toLowerCase().includes(query)
      );
    });
  }, [bills, searchQuery]);

  // Delete bill mutation
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

  // Recalculate bill mutation
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

  // Calculate total project value from ALL bills (not filtered)
  const totalProjectValue =
    bills?.reduce((sum, bill) => {
      const amount = Number(bill.total_amount) || 0;
      return sum + amount;
    }, 0) || 0;

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

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const formatCurrency = (amount: number) => {
    const num = Number(amount) || 0;
    return `Ksh ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-900 font-medium">
            Loading BOQ...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 font-medium">
            Error loading bills. Please check your connection and try again.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Top Section - Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          {/* Left: Project Info */}
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
              <FileText className="w-7 h-7 text-gray-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-950 mb-2">
                {project?.name || "Project"}
              </h1>
              <p className="text-sm text-gray-600 font-medium mb-3">
                {project?.code || "N/A"}
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Client: </span>
                  <span className="text-gray-950 font-semibold">
                    {project?.client || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Location: </span>
                  <span className="text-gray-950 font-semibold">
                    {project?.city || "Nairobi"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Date: </span>
                  <span className="text-gray-950 font-semibold">
                    {formatDate(project?.start_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Total Project Value Card */}
          <div className="bg-gray-950 text-white rounded-xl px-8 py-6 shadow-lg min-w-[320px]">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium opacity-90">
                Total Project Value
              </span>
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(totalProjectValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Search Input - NOW WORKING */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-medium text-sm w-64"
            />
          </div>

          {/* Filter Button */}
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center space-x-2 font-medium transition-colors text-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {/* Export PDF Button */}
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center space-x-2 font-medium transition-colors text-sm">
            <UploadIcon className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          {/* Export Excel Button */}
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center space-x-2 font-medium transition-colors text-sm">
            <UploadIcon className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* View Mode and Create Button Row */}
      <div className="mb-6 flex items-center justify-between">
        {/* View Mode Icons */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "card"
                ? "bg-gray-950 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-gray-950 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Table View"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("summary")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "summary"
                ? "bg-gray-950 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Summary View"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Create New Bill Button */}
        <button
          onClick={handleCreateClick}
          className="bg-gray-950 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 flex items-center space-x-2 font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Bill</span>
        </button>
      </div>

      {/* Search Results Indicator */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600 font-medium">
          Found {filteredBills.length} bill
          {filteredBills.length !== 1 ? "s" : ""} matching "{searchQuery}"
        </div>
      )}

      {/* Render View Based on Mode - USING FILTERED BILLS */}
      {viewMode === "card" && (
        <BillsCardView
          bills={filteredBills}
          onViewBill={handleViewBill}
          onEditBill={setEditingBill}
          onDeleteBill={handleDeleteBill}
          onRecalculate={handleRecalculate}
          onCreateClick={handleCreateClick}
          isRecalculating={recalculateBillMutation.isPending}
          isDeleting={deleteBillMutation.isPending}
        />
      )}

      {viewMode === "table" && (
        <BillsTableView
          bills={filteredBills}
          onViewBill={handleViewBill}
          onEditBill={setEditingBill}
          onDeleteBill={handleDeleteBill}
          onRecalculate={handleRecalculate}
          onCreateClick={handleCreateClick}
          isRecalculating={recalculateBillMutation.isPending}
          isDeleting={deleteBillMutation.isPending}
        />
      )}

      {viewMode === "summary" && (
        <BillsSummaryView
          bills={filteredBills}
          onViewBill={handleViewBill}
          onCreateClick={handleCreateClick}
        />
      )}

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
    </DashboardLayout>
  );
}
