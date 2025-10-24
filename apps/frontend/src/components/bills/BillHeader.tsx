import { Calculator, Plus } from "lucide-react";

interface BillHeaderProps {
  billNumber: string;
  billTitle: string;
  description?: string;
  onRecalculate: () => void;
  onAddSection: () => void;
  isRecalculating: boolean;
}

export function BillHeader({
  billNumber,
  billTitle,
  description,
  onRecalculate,
  onAddSection,
  isRecalculating,
}: BillHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 mb-2">
            {billNumber}
          </h1>
          <p className="text-xl text-gray-700 font-semibold mb-4">
            {billTitle}
          </p>
          {description && (
            <p className="text-gray-600 font-medium max-w-3xl">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center space-x-2 font-medium transition-colors disabled:opacity-50"
          >
            <Calculator className="w-4 h-4" />
            <span>{isRecalculating ? "Calculating..." : "Recalculate"}</span>
          </button>
          <button
            onClick={onAddSection}
            className="bg-gray-950 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2 font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>
      </div>
    </div>
  );
}
