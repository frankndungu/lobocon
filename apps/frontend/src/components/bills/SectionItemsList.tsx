import { Package } from "lucide-react";
import { ItemCard } from "./ItemCard";

interface Item {
  id: number;
  item_code: string;
  description: string;
  item_type: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  sort_order?: number;
}

interface SectionItemsListProps {
  items: Item[];
  selectedItems: Set<number>;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onToggleSelection: (itemId: number) => void;
  onAddItem: () => void;
  isDeletingItem: boolean;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

export function SectionItemsList({
  items,
  selectedItems,
  onEditItem,
  onDeleteItem,
  onToggleSelection,
  onAddItem,
  isDeletingItem,
  formatCurrency,
  formatNumber,
}: SectionItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-950 mb-2">
          No items in this section
        </h3>
        <p className="text-gray-700 mb-4 font-medium">
          Add your first item to start building this section.
        </p>
        <button
          onClick={onAddItem}
          className="bg-gray-950 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
        >
          Add First Item
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          item={item}
          index={index}
          isSelected={selectedItems.has(item.id)}
          onEdit={() => onEditItem(item)}
          onDelete={() => onDeleteItem(item)}
          onToggleSelection={() => onToggleSelection(item.id)}
          isDeleting={isDeletingItem}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      ))}
    </div>
  );
}
