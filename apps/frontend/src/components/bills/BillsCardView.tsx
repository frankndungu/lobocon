"use client";

import { useState } from "react";
import { Bill } from "@/lib/types";
import {
  MoreVertical,
  FileText,
  BarChart3,
  Calculator,
  Trash2,
  Plus,
  Edit,
} from "lucide-react";

interface BillsCardViewProps {
  bills: Bill[];
  onViewBill: (billId: number) => void;
  onEditBill: (bill: Bill) => void;
  onDeleteBill: (bill: Bill) => void;
  onRecalculate: (billId: number) => void;
  onCreateClick: () => void;
  isRecalculating: boolean;
  isDeleting: boolean;
}

export function BillsCardView({
  bills,
  onViewBill,
  onEditBill,
  onDeleteBill,
  onRecalculate,
  onCreateClick,
  isRecalculating,
  isDeleting,
}: BillsCardViewProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Get a color based on bill number for variety
  const getBillColor = (billNumber: string) => {
    const colors = [
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-teal-100 text-teal-700 border-teal-200",
    ];

    // Extract number from bill number (e.g., "Bill No. 1" -> 1)
    const num = parseInt(billNumber.replace(/\D/g, "")) || 0;
    return colors[num % colors.length];
  };

  const formatCurrency = (amount: number) => {
    const num = Number(amount) || 0;
    return `Ksh ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (bills.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <Plus className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-950 mb-3">No bills found</h3>
        <p className="text-gray-700 mb-8 max-w-md mx-auto leading-relaxed font-medium">
          Create your first bill to start building the BOQ for this project.
        </p>
        <button
          onClick={onCreateClick}
          className="bg-gray-950 text-white px-8 py-3 rounded-lg hover:bg-gray-800 flex items-center space-x-3 mx-auto font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create Your First Bill</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bills.map((bill) => {
        const titleColor = getBillColor(bill.bill_number);

        return (
          <div
            key={bill.id}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all relative"
          >
            <div className="p-6">
              {/* Header with Title and More Icon */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-950">
                  {bill.bill_number}
                </h3>
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === bill.id ? null : bill.id)
                    }
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === bill.id && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      {/* Menu */}
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => {
                            onEditBill(bill);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Bill</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bill Title with Dynamic Color */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded border ${titleColor}`}
                >
                  {bill.bill_title}
                </span>
              </div>

              {/* Description */}
              {bill.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {bill.description}
                </p>
              )}

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">
                    Sections: {bill.section_count || 0}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="font-medium">
                    Items: {bill.item_count || 0}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">
                    Contingency: +{bill.contingency_percentage || 0}%
                  </span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-4">
                <div className="text-xs text-gray-600 font-semibold mb-1">
                  Total Amount
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(bill.total_amount) || 0)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewBill(bill.id)}
                  className="flex-1 bg-gray-950 text-white py-2.5 rounded-lg hover:bg-gray-800 font-medium transition-colors text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => onRecalculate(bill.id)}
                  className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Recalculate"
                  disabled={isRecalculating}
                >
                  <Calculator className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDeleteBill(bill)}
                  className="p-2.5 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Bill"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
