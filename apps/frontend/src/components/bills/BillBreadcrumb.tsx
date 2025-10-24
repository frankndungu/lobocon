import { ChevronRight } from "lucide-react";

interface BillBreadcrumbProps {
  projectName: string;
  billNumber: string;
  onProjectClick: () => void;
  onBoqClick: () => void;
}

export function BillBreadcrumb({
  projectName,
  billNumber,
  onProjectClick,
  onBoqClick,
}: BillBreadcrumbProps) {
  return (
    <div className="flex items-center text-sm text-gray-600 mb-6 font-medium">
      <button
        onClick={onProjectClick}
        className="hover:text-gray-950 transition-colors"
      >
        {projectName}
      </button>
      <ChevronRight className="w-4 h-4 mx-2" />
      <button
        onClick={onBoqClick}
        className="hover:text-gray-950 transition-colors"
      >
        BOQ
      </button>
      <ChevronRight className="w-4 h-4 mx-2" />
      <span className="text-gray-950">{billNumber}</span>
    </div>
  );
}
