import { Project } from "@/lib/types";
import {
  Building,
  Calendar,
  MapPin,
  Plus,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface ProjectsCardViewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  onCreateClick: () => void;
  searchQuery?: string;
}

export function ProjectsCardView({
  projects,
  onProjectClick,
  onCreateClick,
  searchQuery = "",
}: ProjectsCardViewProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      TENDERING: "bg-blue-100 text-blue-800 border-blue-200",
      ON_HOLD: "bg-yellow-100 text-yellow-800 border-yellow-200",
      COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      DELAYED: "bg-orange-100 text-orange-800 border-orange-200",
      HANDOVER: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    const colors = {
      RESIDENTIAL: "bg-blue-50 text-blue-700 border-blue-200",
      COMMERCIAL: "bg-purple-50 text-purple-700 border-purple-200",
      INFRASTRUCTURE: "bg-orange-50 text-orange-700 border-orange-200",
      INDUSTRIAL: "bg-gray-50 text-gray-700 border-gray-200",
      RENOVATION: "bg-green-50 text-green-700 border-green-200",
      OTHER: "bg-pink-50 text-pink-700 border-pink-200",
    };
    return colors[type as keyof typeof colors] || "bg-gray-50 text-gray-700";
  };

  if (projects.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? "No projects found" : "No projects yet"}
        </h3>
        <p className="text-gray-600 mb-4">
          {searchQuery
            ? "Try adjusting your search query"
            : "Get started by creating your first project"}
        </p>
        {!searchQuery && (
          <button
            onClick={onCreateClick}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Project</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer group"
          onClick={() => onProjectClick(project.id)}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm font-mono text-gray-500">
                  {project.code}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded border ${getTypeColor(
                    project.type
                  )}`}
                >
                  {project.type}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  {project.city}, {project.county}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {project.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    Progress
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer Stats */}
            <div className="pt-4 border-t grid grid-cols-2 gap-4">
              {project.budget && (
                <div>
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <DollarSign className="w-3 h-3 mr-1" />
                    <span>Budget</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {project.currency} {Number(project.budget).toLocaleString()}
                  </div>
                </div>
              )}
              {project.stage && (
                <div>
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>Stage</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {project.stage.replace(/_/g, " ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
