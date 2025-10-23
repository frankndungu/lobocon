"use client";

import { Bill } from "@/lib/types";
import { Edit, Trash2, Calculator, Plus } from "lucide-react";

interface BillsTableViewProps {
  bills: Bill[];
  onViewBill: (billId: number) => void;
  onEditBill: (bill: Bill) => void;
  onDeleteBill: (bill: Bill) => void;
  onRecalculate: (billId: number) => void;
  onCreateClick: () => void;
  isRecalculating: boolean;
  isDeleting: boolean;
}

export function BillsTableView({
  bills,
  onViewBill,
  onEditBill,
  onDeleteBill,
  onRecalculate,
  onCreateClick,
  isRecalculating,
  isDeleting,
}: BillsTableViewProps) {
  // Get a color based on bill number for variety (same as card view)
  const getBillColor = (billNumber: string) => {
    const colors = [
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-teal-100 text-teal-700 border-teal-200",
    ];

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Bill
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Sections
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Contingency
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bills.map((bill) => {
              const titleColor = getBillColor(bill.bill_number);

              return (
                <tr
                  key={bill.id}
                  onClick={() => onViewBill(bill.id)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Bill Number */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-950">
                      {bill.bill_number}
                    </div>
                  </td>

                  {/* Title with colored badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded border ${titleColor}`}
                    >
                      {bill.bill_title}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4">
                    {bill.description ? (
                      <div className="text-sm text-gray-600 line-clamp-2 font-medium max-w-md">
                        {bill.description}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        No description
                      </span>
                    )}
                  </td>

                  {/* Sections */}
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-950 text-base">
                      {bill.section_count || 0}
                    </span>
                  </td>

                  {/* Items */}
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-950 text-base">
                      {bill.item_count || 0}
                    </span>
                  </td>

                  {/* Contingency */}
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-950">
                      +{bill.contingency_percentage || 0}%
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-green-600 text-lg">
                      {formatCurrency(Number(bill.total_amount) || 0)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      {/* Calculate */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecalculate(bill.id);
                        }}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        title="Recalculate"
                        disabled={isRecalculating}
                      >
                        <Calculator className="w-4 h-4 text-gray-600" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBill(bill);
                        }}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Edit Bill"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBill(bill);
                        }}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Bill"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
