'use client';

import { Calculator, TrendingUp } from 'lucide-react';

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
  itemCount 
}: BillTotalsProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <span>Bill Summary</span>
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{sectionCount} sections</span>
          <span>{itemCount} items</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            KES {Number(subtotal).toLocaleString()}
          </span>
        </div>

        {/* Contingency */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            Contingency ({contingencyPercentage}%)
          </span>
          <span className="font-medium text-gray-900">
            KES {Number(contingencyAmount).toLocaleString()}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Amount</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              KES {Number(totalAmount).toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+{contingencyPercentage}% contingency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}