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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="EACC Headquarters Face-lift"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Project Type
              </label>
              <select
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium"
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Project Status
              </label>
              <select
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium"
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

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                City
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="Nairobi"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                County
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="Nairobi County"
                value={formData.county}
                onChange={(e) =>
                  setFormData({ ...formData, county: e.target.value })
                }
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Budget (KES)
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
                placeholder="5000000"
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

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notes
              </label>
              <textarea
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium resize-none"
                rows={3}
                placeholder="Project description and additional notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
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
              disabled={createProjectMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors font-semibold"
            >
              <Save className="w-4 h-4" />
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
