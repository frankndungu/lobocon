"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Save, BookOpen } from "lucide-react";
import KSMMSearch from "@/components/ui/KSMMSearch";

interface CreateItemFormProps {
  projectId: string;
  billId: string;
  sectionId: number;
  isOpen: boolean;
  onClose: () => void;
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

interface KSMMClause {
  id: number;
  section_code: string;
  section: string;
  contents: string;
  clause_title: string;
  clause_reference: string;
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

  const [useKSMM, setUseKSMM] = useState(false);

  const queryClient = useQueryClient();

  const createItemMutation = useMutation({
    mutationFn: async (data: CreateItemData) => {
      const response = await api.post("/boq/items", data);
      return response.data;
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
      setUseKSMM(false);
    },
  });

  const handleKSMMSelect = (clause: KSMMClause) => {
    setFormData({
      ...formData,
      description: clause.clause_reference,
      item_code: clause.section,
    });
    setUseKSMM(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItemMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Item Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="A.1.1"
                value={formData.item_code}
                onChange={(e) =>
                  setFormData({ ...formData, item_code: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Item Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium"
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

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseKSMM(!useKSMM)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{useKSMM ? "Manual Entry" : "Use KSMM"}</span>
                </button>
              </div>

              {useKSMM ? (
                <KSMMSearch
                  onSelect={handleKSMMSelect}
                  placeholder="Search KSMM clauses for professional descriptions..."
                />
              ) : (
                <textarea
                  required
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium resize-none"
                  rows={3}
                  placeholder="Detailed description of the work item"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="m², m³, Nr, Sum"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rate (KES) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="0.00"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

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
              disabled={createItemMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors font-semibold"
            >
              <Save className="w-4 h-4" />
              <span>
                {createItemMutation.isPending ? "Creating..." : "Add Item"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
