import { Building } from "lucide-react";

interface EmptyStateProps {
  onCreateSection: () => void;
}

export function EmptyState({ onCreateSection }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
      <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-950 mb-2">
        No sections found
      </h3>
      <p className="text-gray-700 mb-6 max-w-md mx-auto font-medium">
        Add your first section to start building this bill. Sections help
        organize different types of work.
      </p>
      <button
        onClick={onCreateSection}
        className="bg-gray-950 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
      >
        Create First Section
      </button>
    </div>
  );
}
