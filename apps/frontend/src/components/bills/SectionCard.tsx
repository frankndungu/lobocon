import { ChevronDown, ChevronRight, Edit, Trash2, Plus } from "lucide-react";
import { SectionItemsList } from "./SectionItemsList";
import CollectionsManagement from "@/components/collections/CollectionsManagement";

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

interface Section {
  id: number;
  section_code: string;
  section_title: string;
  preamble?: string;
  total_amount: number;
  item_count: number;
  items: Item[];
}

interface SectionCardProps {
  section: Section;
  projectId: string;
  isExpanded: boolean;
  selectedItems: Set<number>;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onToggleItemSelection: (itemId: number) => void;
  isDeleting: boolean;
  isDeletingItem: boolean;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

export function SectionCard({
  section,
  projectId,
  isExpanded,
  selectedItems,
  onToggle,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItemSelection,
  isDeleting,
  isDeletingItem,
  formatCurrency,
  formatNumber,
}: SectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Section Header */}
      <div
        className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-950 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="font-mono text-base font-bold text-gray-950 bg-gray-100 px-3 py-1 rounded-md">
                {section.section_code}
              </span>
              <h2 className="text-xl font-bold text-gray-950">
                {section.section_title}
              </h2>
            </div>
            {section.preamble && (
              <p className="text-sm text-gray-600 font-medium max-w-2xl">
                {section.preamble}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-sm text-gray-600 font-medium mb-1">
              Section Total
            </div>
            <div className="text-xl font-bold text-gray-950">
              {formatCurrency(section.total_amount)}
            </div>
            <div className="text-xs text-gray-500">
              {section.item_count} items
            </div>
          </div>

          <div
            className="flex items-center space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit Section"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Section"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <>
          {/* Add Item Button */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-semibold">
                {section.item_count} item{section.item_count !== 1 ? "s" : ""}{" "}
                in this section
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddItem();
                }}
                className="bg-gray-950 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 flex items-center space-x-2 transition-colors font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <SectionItemsList
            items={section.items}
            selectedItems={selectedItems}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onToggleSelection={onToggleItemSelection}
            onAddItem={onAddItem}
            isDeletingItem={isDeletingItem}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />

          {/* Collections */}
          <div className="border-t border-gray-100">
            <div className="p-6">
              <CollectionsManagement
                projectId={projectId}
                sectionId={section.id}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
