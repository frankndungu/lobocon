import { Project } from "@/lib/types";
import { Building, Calendar, Plus, Table as TableIcon } from "lucide-react";

interface ProjectsTableProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  onCreateClick: () => void;
  searchQuery?: string;
}

export function ProjectsTable({
  projects,
  onProjectClick,
  onCreateClick,
  searchQuery = "",
}: ProjectsTableProps) {
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
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="text-center py-12">
          <TableIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programme
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onProjectClick(project.id)}
              >
                {/* Project */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {project.code}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{project.city}</div>
                  <div className="text-sm text-gray-500">{project.county}</div>
                </td>

                {/* Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(
                      project.type
                    )}`}
                  >
                    {project.type}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </td>

                {/* Stage */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.stage ? project.stage.replace(/_/g, " ") : "—"}
                </td>

                {/* Budget */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {project.budget
                    ? `${project.currency} ${Number(
                        project.budget
                      ).toLocaleString()}`
                    : "—"}
                </td>

                {/* Progress */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 mr-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-900 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                      {project.progress}%
                    </div>
                  </div>
                </td>

                {/* Programme */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.programme || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
