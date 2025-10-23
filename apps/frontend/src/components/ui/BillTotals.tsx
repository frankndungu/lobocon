"use client";

import { Calculator, TrendingUp } from "lucide-react";

interface BillTotalsProps {
  subtotal: number;
  contingencyPercentage: number;
  contingencyAmount: number;
  totalAmount: number;
  sectionCount: number;
  itemCount: number;
}

export default function BillTotals({
  subtotal,
  contingencyPercentage,
  contingencyAmount,
  totalAmount,
  sectionCount,
  itemCount,
}: BillTotalsProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-950 flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-gray-700" />
          <span>Bill Summary</span>
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-700 font-semibold">
          <span>{sectionCount} sections</span>
          <span>{itemCount} items</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-semibold">Subtotal</span>
          <span className="font-bold text-gray-950">
            KES {Number(subtotal).toLocaleString()}
          </span>
        </div>

        {/* Contingency */}
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-semibold">
            Contingency ({contingencyPercentage}%)
          </span>
          <span className="font-bold text-gray-950">
            KES {Number(contingencyAmount).toLocaleString()}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-200"></div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xl font-bold text-gray-950">Total Amount</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              KES {Number(totalAmount).toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-green-600 font-semibold mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+{contingencyPercentage}% contingency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
