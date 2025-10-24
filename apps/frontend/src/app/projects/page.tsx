"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";
import {
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Map as MapIcon,
} from "lucide-react";
import CreateProjectForm from "@/components/forms/CreateProjectForm";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectsCardView } from "@/components/projects/ProjectsCardView";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { ProjectsMapView } from "@/components/projects/ProjectsMapView";

type ViewMode = "card" | "table" | "map";

export default function ProjectSelection() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get<Project[]>("/projects");
      return response.data;
    },
  });

  // Filter projects based on search query
  const filteredProjects = projects?.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectClick = (projectId: string) => {
    window.location.href = `/projects/${projectId}/boq`;
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading projects...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600">
            Error loading projects. Make sure your backend is running on
            localhost:3000
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">
                Manage your construction projects and their Bill of Quantities
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "card"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Thumbnail View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "map"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render View Based on Mode */}
      {viewMode === "card" && (
        <ProjectsCardView
          projects={filteredProjects || []}
          onProjectClick={handleProjectClick}
          onCreateClick={handleCreateClick}
          searchQuery={searchQuery}
        />
      )}

      {viewMode === "table" && (
        <ProjectsTable
          projects={filteredProjects || []}
          onProjectClick={handleProjectClick}
          onCreateClick={handleCreateClick}
          searchQuery={searchQuery}
        />
      )}

      {viewMode === "map" && (
        <ProjectsMapView projects={filteredProjects || []} />
      )}

      {/* Create Project Modal */}
      <CreateProjectForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />
    </DashboardLayout>
  );
}
