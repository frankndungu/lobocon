"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Layers } from "lucide-react";

interface Section {
  id: number;
  section_code: string;
  section_title: string;
  preamble?: string;
  total_amount: number;
  item_count: number;
}

interface CreateSectionFormProps {
  projectId: string;
  billId: string;
  isOpen: boolean;
  onClose: () => void;
  editingSection?: Section | null;
}

interface CreateSectionData {
  project_id: string;
  bill_id: number;
  section_code: string;
  section_title: string;
  preamble?: string;
}

export default function CreateSectionForm({
  projectId,
  billId,
  isOpen,
  onClose,
  editingSection,
}: CreateSectionFormProps) {
  const [formData, setFormData] = useState<CreateSectionData>({
    project_id: projectId,
    bill_id: parseInt(billId),
    section_code: "",
    section_title: "",
    preamble: "",
  });

  const queryClient = useQueryClient();
  const isEditing = !!editingSection;

  // Populate form when editing
  useEffect(() => {
    if (editingSection) {
      setFormData({
        project_id: projectId,
        bill_id: parseInt(billId),
        section_code: editingSection.section_code,
        section_title: editingSection.section_title,
        preamble: editingSection.preamble || "",
      });
    } else {
      setFormData({
        project_id: projectId,
        bill_id: parseInt(billId),
        section_code: "",
        section_title: "",
        preamble: "",
      });
    }
  }, [editingSection, projectId, billId]);

  const createSectionMutation = useMutation({
    mutationFn: async (data: CreateSectionData) => {
      if (isEditing && editingSection) {
        const response = await api.patch(
          `/boq/sections/${editingSection.id}`,
          data
        );
        return response.data;
      } else {
        const response = await api.post("/boq/sections", data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-full", billId] });
      onClose();
      setFormData({
        project_id: projectId,
        bill_id: parseInt(billId),
        section_code: "",
        section_title: "",
        preamble: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSectionMutation.mutate(formData);
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
              <Layers className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Section" : "Add New Section"}
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
            {/* Section Code and Title Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Section Code */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Section Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="e.g., A"
                  value={formData.section_code}
                  onChange={(e) =>
                    setFormData({ ...formData, section_code: e.target.value })
                  }
                />
              </div>

              {/* Section Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Section Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="e.g., Preliminaries"
                  value={formData.section_title}
                  onChange={(e) =>
                    setFormData({ ...formData, section_title: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Preamble */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Preamble
              </label>
              <textarea
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
                rows={4}
                placeholder="General conditions and specifications for this section..."
                value={formData.preamble}
                onChange={(e) =>
                  setFormData({ ...formData, preamble: e.target.value })
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
              disabled={createSectionMutation.isPending}
              className="px-6 py-2.5 bg-gray-950 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {createSectionMutation.isPending
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Section"
                : "Add Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
