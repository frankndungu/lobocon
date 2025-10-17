"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bill } from "@/lib/types";
import { Plus, Calculator, FileText, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import CreateBillForm from "@/components/forms/CreateBillForm";

export default function BOQManagement() {
  const params = useParams();
  const projectId = params.id as string;
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: bills, isLoading } = useQuery({
    queryKey: ["bills", projectId],
    queryFn: async () => {
      const response = await api.get<Bill[]>(
        `/boq/bills?project_id=${projectId}`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading BOQ...</div>
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
              <p className="text-gray-600 mt-1">EACC Headquarters Face-lift</p>
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {bill.bill_number}
                  </h3>
                  <p className="text-gray-600 mt-1">{bill.bill_title}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    KES {Number(bill.total_amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bill.contingency_percentage}% contingency
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Sections</div>
                  <div className="text-lg font-medium">
                    {bill.section_count}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Items</div>
                  <div className="text-lg font-medium">{bill.item_count}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 flex items-center justify-center space-x-2"
                  onClick={() =>
                    (window.location.href = `/projects/${projectId}/boq/bills/${bill.id}`)
                  }
                >
                  <FileText className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 flex items-center justify-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span>Recalculate</span>
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
            <p className="text-gray-600">
              Create your first bill to start building the BOQ.
            </p>
          </div>
        )}
      </div>

      {/* Create Bill Modal */}
      <CreateBillForm
        projectId={projectId}
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />
    </div>
  );
}
