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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Background Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Bill" : "Create New Bill"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Bill Number and Title Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Bill Number */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bill Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="e.g., Bill No. 1"
                  value={formData.bill_number}
                  onChange={(e) =>
                    setFormData({ ...formData, bill_number: e.target.value })
                  }
                />
              </div>

              {/* Bill Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bill Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="e.g., Preliminaries and General Items"
                  value={formData.bill_title}
                  onChange={(e) =>
                    setFormData({ ...formData, bill_title: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
                rows={4}
                placeholder="Project description and additional notes..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Contingency Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contingency Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="e.g., 6.5"
                value={formData.contingency_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contingency_percentage:
                      e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBillMutation.isPending}
              className="px-6 py-2.5 bg-gray-950 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {createBillMutation.isPending
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Bill"
                : "Create Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
