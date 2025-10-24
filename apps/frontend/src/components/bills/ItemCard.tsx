import { Edit, Trash2 } from "lucide-react";

interface Item {
  id: number;
  item_code: string;
  description: string;
  item_type: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface ItemCardProps {
  item: Item;
  index: number;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSelection: () => void;
  isDeleting: boolean;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

const ITEM_TYPE_BADGES: Record<string, string> = {
  MEASURED: "bg-blue-50 text-blue-700 border-blue-200",
  LUMP_SUM: "bg-purple-50 text-purple-700 border-purple-200",
  PRIME_COST: "bg-amber-50 text-amber-700 border-amber-200",
  PROVISIONAL: "bg-green-50 text-green-700 border-green-200",
  ATTENDANT: "bg-pink-50 text-pink-700 border-pink-200",
  COLLECTION: "bg-gray-50 text-gray-700 border-gray-200",
};

export function ItemCard({
  item,
  index,
  isSelected,
  onEdit,
  onDelete,
  onToggleSelection,
  isDeleting,
  formatCurrency,
  formatNumber,
}: ItemCardProps) {
  const getItemTypeBadge = (type: string) => {
    return ITEM_TYPE_BADGES[type] || ITEM_TYPE_BADGES.MEASURED;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="w-4 h-4 text-gray-950 border-gray-300 rounded focus:ring-gray-950"
          />
        </div>

        {/* Item Number */}
        <div className="flex items-center pt-1">
          <div className="text-sm font-bold text-gray-700">
            {index + 1}.{String(index + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Item Content */}
        <div className="flex-1 min-w-0">
          {/* Item Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-bold text-gray-950 bg-gray-100 px-3 py-1 rounded-md">
                {item.item_code}
              </span>
              <span
                className={`px-3 py-1 text-xs rounded-full border ${getItemTypeBadge(
                  item.item_type
                )}`}
              >
                {item.item_type.replace("_", " ")}
              </span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Item"
              >
                <Edit className="w-4 h-4 text-gray-600 hover:text-gray-950" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Item"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-950 text-base leading-relaxed mb-4 font-medium">
            {item.description}
          </p>

          {/* Calculation Details */}
          <div className="grid grid-cols-4 gap-6 text-sm">
            <div>
              <span className="text-gray-600 font-medium block mb-1">
                Quantity
              </span>
              <div className="font-bold text-gray-950">
                {formatNumber(item.quantity)}
              </div>
            </div>
            <div>
              <span className="text-gray-600 font-medium block mb-1">Unit</span>
              <div className="font-bold text-gray-950">{item.unit}</div>
            </div>
            <div>
              <span className="text-gray-600 font-medium block mb-1">Rate</span>
              <div className="font-bold text-gray-950">
                {formatCurrency(item.rate)}
              </div>
            </div>
            <div>
              <span className="text-gray-600 font-medium block mb-1">
                Amount
              </span>
              <div className="font-bold text-gray-950 text-base">
                {formatCurrency(item.amount)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
