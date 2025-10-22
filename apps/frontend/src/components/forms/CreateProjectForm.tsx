"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Save, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateProjectData {
  name: string;
  address?: string;
  city?: string;
  county?: string;
  type: string;
  status: string;
  budget?: number;
  notes?: string;
}

const PROJECT_TYPES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "RENOVATION", label: "Renovation" },
  { value: "OTHER", label: "Other" },
];

const PROJECT_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "TENDERING", label: "Tendering" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

export default function CreateProjectForm({
  isOpen,
  onClose,
}: CreateProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    address: "",
    city: "",
    county: "",
    type: "COMMERCIAL",
    status: "ACTIVE",
    budget: undefined,
    notes: "",
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await api.post("/projects", data);
      return response.data;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
      // Redirect to BOQ management for the new project
      router.push(`/projects/${newProject.id}/boq`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-900" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400"
                placeholder="e.g., EACC Headquarters Face-lift"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Type and Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project Type
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project Status
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City and County Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400"
                  placeholder="e.g., Nairobi"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  County
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400"
                  placeholder="e.g., Nairobi County"
                  value={formData.county}
                  onChange={(e) =>
                    setFormData({ ...formData, county: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400"
                placeholder="e.g., Integrity Centre, Nairobi"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Budget (KES)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400"
                placeholder="e.g., 5000000"
                value={formData.budget || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400 resize-none"
                rows={3}
                placeholder="Project description and additional notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              <span>
                {createProjectMutation.isPending
                  ? "Creating..."
                  : "Create Project"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
