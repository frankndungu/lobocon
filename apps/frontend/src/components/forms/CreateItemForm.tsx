"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Package } from "lucide-react";
import KSMMSearch from "@/components/ui/KSMMSearch";

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

interface CreateItemFormProps {
  projectId: string;
  billId: string;
  sectionId: number;
  isOpen: boolean;
  onClose: () => void;
  editingItem?: Item | null;
}

interface CreateItemData {
  project_id: string;
  section_id: number;
  item_code: string;
  description: string;
  item_type: string;
  quantity: number;
  unit: string;
  rate: number;
}

interface UpdateItemData {
  section_id: number;
  item_code: string;
  description: string;
  item_type: string;
  quantity: number;
  unit: string;
  rate: number;
}

const ITEM_TYPES = [
  { value: "MEASURED", label: "Measured" },
  { value: "LUMP_SUM", label: "Lump Sum" },
  { value: "PRIME_COST", label: "Prime Cost" },
  { value: "PROVISIONAL", label: "Provisional" },
  { value: "ATTENDANT", label: "Attendant" },
  { value: "COLLECTION", label: "Collection" },
];

export default function CreateItemForm({
  projectId,
  billId,
  sectionId,
  isOpen,
  onClose,
  editingItem,
}: CreateItemFormProps) {
  const [formData, setFormData] = useState<CreateItemData>({
    project_id: projectId,
    section_id: sectionId,
    item_code: "",
    description: "",
    item_type: "MEASURED",
    quantity: 1,
    unit: "",
    rate: 0,
  });

  const [showKSMM, setShowKSMM] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!editingItem;

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        project_id: projectId,
        section_id: sectionId,
        item_code: editingItem.item_code,
        description: editingItem.description,
        item_type: editingItem.item_type,
        quantity: editingItem.quantity,
        unit: editingItem.unit,
        rate: editingItem.rate,
      });
    } else {
      setFormData({
        project_id: projectId,
        section_id: sectionId,
        item_code: "",
        description: "",
        item_type: "MEASURED",
        quantity: 1,
        unit: "",
        rate: 0,
      });
    }
    setShowKSMM(false);
  }, [editingItem, projectId, sectionId]);

  const createItemMutation = useMutation({
    mutationFn: async (data: CreateItemData) => {
      if (isEditing && editingItem) {
        const {
          project_id,
          ...updateData
        }: { project_id: string; [key: string]: any } = data;

        const updatePayload: UpdateItemData = {
          ...updateData,
          quantity: Number(updateData.quantity),
          rate: Number(updateData.rate),
        } as UpdateItemData;

        const response = await api.patch(
          `/boq/items/${editingItem.id}`,
          updatePayload
        );
        return response.data;
      } else {
        const createPayload = {
          ...data,
          quantity: Number(data.quantity),
          rate: Number(data.rate),
        };

        const response = await api.post("/boq/items", createPayload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] });
      onClose();
      setFormData({
        project_id: projectId,
        section_id: sectionId,
        item_code: "",
        description: "",
        item_type: "MEASURED",
        quantity: 1,
        unit: "",
        rate: 0,
      });
      setShowKSMM(false);
    },
    onError: (error: any) => {
      console.error("Error saving item:", error);
      alert(
        `Failed to ${isEditing ? "update" : "create"} item. ${
          error.response?.data?.message || "Please try again."
        }`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItemMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Background Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Extra Wide for KSMM */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Item" : "Add New Item"}
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
            {/* Item Code, Type, Unit Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Item Code */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Item Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="e.g., A.1.1"
                  value={formData.item_code}
                  onChange={(e) =>
                    setFormData({ ...formData, item_code: e.target.value })
                  }
                />
              </div>

              {/* Item Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Item Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.item_type}
                  onChange={(e) =>
                    setFormData({ ...formData, item_type: e.target.value })
                  }
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="e.g., m², Nr, Sum"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                />
              </div>
            </div>

            {/* KSMM Toggle Button */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    SMM Library
                  </p>
                  <p className="text-xs text-gray-600">
                    Search and reference standardized construction descriptions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKSMM(!showKSMM)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showKSMM ? "Hide KSMM" : "Show KSMM"}
              </button>
            </div>

            {/* KSMM Search - Full Width */}
            {showKSMM && (
              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <KSMMSearch showTemplateOptions={true} />
                <p className="text-xs text-gray-500 mt-3">
                  💡 Tip: Use the copy buttons to copy SMM content, then paste
                  into the description field below
                </p>
              </div>
            )}

            {/* Description - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
                rows={5}
                placeholder="Professional description of the work item (use SMM reference for standardized language)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Quantity and Rate Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="0.00"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rate (KES) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="0.00"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Amount Preview */}
            {formData.quantity > 0 && formData.rate > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-green-700">
                    KES {(formData.quantity * formData.rate).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {formData.quantity} {formData.unit} × KES{" "}
                  {formData.rate.toLocaleString()}
                </p>
              </div>
            )}
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
              disabled={createItemMutation.isPending}
              className="px-6 py-2.5 bg-gray-950 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {createItemMutation.isPending
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Item"
                : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
