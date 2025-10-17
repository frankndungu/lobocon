"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Save } from "lucide-react";

interface CreateBillFormProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CreateBillData {
  project_id: string;
  bill_number: string;
  bill_title: string;
  description: string;
  contingency_percentage: number;
}

export default function CreateBillForm({
  projectId,
  isOpen,
  onClose,
}: CreateBillFormProps) {
  const [formData, setFormData] = useState<CreateBillData>({
    project_id: projectId,
    bill_number: "",
    bill_title: "",
    description: "",
    contingency_percentage: 6.5,
  });

  const queryClient = useQueryClient();

  const createBillMutation = useMutation({
    mutationFn: async (data: CreateBillData) => {
      const response = await api.post("/boq/bills", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills", projectId] });
      onClose();
      setFormData({
        project_id: projectId,
        bill_number: "",
        bill_title: "",
        description: "",
        contingency_percentage: 6.5,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBillMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Bill
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Bill Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bill Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="Bill No. 3"
                value={formData.bill_number}
                onChange={(e) =>
                  setFormData({ ...formData, bill_number: e.target.value })
                }
              />
            </div>

            {/* Bill Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bill Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="M&E Works"
                value={formData.bill_title}
                onChange={(e) =>
                  setFormData({ ...formData, bill_title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium resize-none"
                rows={4}
                placeholder="Brief description of this bill's scope and work items"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Contingency Percentage */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contingency Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                value={formData.contingency_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contingency_percentage: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-8 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBillMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors font-semibold"
            >
              <Save className="w-4 h-4" />
              <span>
                {createBillMutation.isPending ? "Creating..." : "Create Bill"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
