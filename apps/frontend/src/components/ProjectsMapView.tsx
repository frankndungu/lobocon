import { Project } from "@/lib/types";
import { Map as MapIcon } from "lucide-react";

interface ProjectsMapViewProps {
  projects: Project[];
}

export function ProjectsMapView({ projects }: ProjectsMapViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
      <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Map View - Coming Soon
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-4">
        Interactive map showing project locations across Kenya will be available
        in an upcoming release. Stay tuned!
      </p>
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
        <span className="text-sm font-medium text-blue-700">
          {projects.length} project{projects.length !== 1 ? "s" : ""} ready to
          map
        </span>
      </div>
    </div>
  );
}
