"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Save } from "lucide-react";

// Add Bill interface to match your backend structure
interface Bill {
  id: number;
  bill_number: string;
  bill_title: string;
  description?: string;
  contingency_percentage: number;
  total_amount?: number;
  section_count?: number;
  item_count?: number;
}

interface CreateBillFormProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  editingBill?: Bill | null;
}

interface CreateBillData {
  project_id: string;
  bill_number: string;
  bill_title: string;
  description: string;
  contingency_percentage: number;
}

interface UpdateBillData {
  bill_number: string;
  bill_title: string;
  description: string;
  contingency_percentage: number;
}

export default function CreateBillForm({
  projectId,
  isOpen,
  onClose,
  editingBill,
}: CreateBillFormProps) {
  const [formData, setFormData] = useState<CreateBillData>({
    project_id: projectId,
    bill_number: "",
    bill_title: "",
    description: "",
    contingency_percentage: 6.5,
  });

  const queryClient = useQueryClient();
  const isEditing = !!editingBill;

  // Populate form when editing
  useEffect(() => {
    if (editingBill) {
      setFormData({
        project_id: projectId,
        bill_number: editingBill.bill_number,
        bill_title: editingBill.bill_title,
        description: editingBill.description || "",
        contingency_percentage: editingBill.contingency_percentage,
      });
    } else {
      // Reset form for create mode
      setFormData({
        project_id: projectId,
        bill_number: "",
        bill_title: "",
        description: "",
        contingency_percentage: 6.5,
      });
    }
  }, [editingBill, projectId]);

  const createBillMutation = useMutation({
    mutationFn: async (data: CreateBillData) => {
      if (isEditing && editingBill) {
        // For updates, exclude project_id since it shouldn't change
        const {
          project_id,
          ...updateData
        }: { project_id: string; [key: string]: any } = data;

        // Ensure contingency_percentage is a number
        const updatePayload: UpdateBillData = {
          ...updateData,
          contingency_percentage: Number(updateData.contingency_percentage),
        } as UpdateBillData;

        const response = await api.patch(
          `/boq/bills/${editingBill.id}`,
          updatePayload
        );
        return response.data;
      } else {
        // For creates, ensure contingency_percentage is a number
        const createPayload = {
          ...data,
          contingency_percentage: Number(data.contingency_percentage),
        };

        const response = await api.post("/boq/bills", createPayload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills", projectId] });
      onClose();
      // Reset form
      setFormData({
        project_id: projectId,
        bill_number: "",
        bill_title: "",
        description: "",
        contingency_percentage: 6.5,
      });
    },
    onError: (error: any) => {
      console.error("Error saving bill:", error);
      alert(
        `Failed to ${isEditing ? "update" : "create"} bill. ${
          error.response?.data?.message || "Please try again."
        }`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.bill_number.trim()) {
      alert("Bill number is required");
      return;
    }
    if (!formData.bill_title.trim()) {
      alert("Bill title is required");
      return;
    }
    if (!formData.description.trim()) {
      alert("Description is required");
      return;
    }

    createBillMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Bill" : "Create New Bill"}
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
                    // Ensure it's converted to a number, not a string
                    contingency_percentage:
                      e.target.value === "" ? 0 : Number(e.target.value),
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
                {createBillMutation.isPending
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Bill"
                  : "Create Bill"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
