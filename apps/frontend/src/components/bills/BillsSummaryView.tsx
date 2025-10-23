"use client";

import { Bill } from "@/lib/types";
import { Plus, CheckCircle2, DollarSign } from "lucide-react";

interface BillsSummaryViewProps {
  bills: Bill[];
  onViewBill: (billId: number) => void;
  onCreateClick: () => void;
}

export function BillsSummaryView({
  bills,
  onViewBill,
  onCreateClick,
}: BillsSummaryViewProps) {
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

  // Calculate totals
  const grandTotal = bills.reduce(
    (sum, bill) => sum + (Number(bill.total_amount) || 0),
    0
  );

  const totalSections = bills.reduce(
    (sum, bill) => sum + (Number(bill.section_count) || 0),
    0
  );

  const totalItems = bills.reduce(
    (sum, bill) => sum + (Number(bill.item_count) || 0),
    0
  );

  // Note: bill.total_amount already includes contingencies from backend
  // So grandTotal is the final contract sum (no need to add contingencies again)
  const finalContractSum = grandTotal;

  const formatCurrency = (amount: number) => {
    const num = Number(amount) || 0;
    return `Ksh ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-8">
      {/* Bills List with Numbers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-100">
          {bills.map((bill, index) => {
            const billAmount = Number(bill.total_amount) || 0;

            return (
              <div
                key={bill.id}
                onClick={() => onViewBill(bill.id)}
                className="px-10 py-6 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  {/* Left: Number and Bill Info */}
                  <div className="flex items-start space-x-8">
                    {/* Number Circle */}
                    <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-700">
                        {index + 1}
                      </span>
                    </div>

                    {/* Bill Details */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-950 mb-2">
                        {bill.bill_number}
                      </h3>
                      <p className="text-base text-gray-600 font-medium">
                        {bill.bill_title}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount and Contingency */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-950 mb-2">
                      {formatCurrency(billAmount)}
                    </div>
                    <div className="text-base text-gray-600 font-medium">
                      +{bill.contingency_percentage || 0}% of total
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grand Total */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-10 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CheckCircle2 className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-950">GRAND TOTAL</span>
          </div>
          <div className="text-4xl font-bold text-blue-600">
            {formatCurrency(grandTotal)}
          </div>
        </div>
      </div>

      {/* Final Contract Sum */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl px-10 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <DollarSign className="w-7 h-7 text-green-600" />
            <span className="text-xl font-bold text-gray-950">
              FINAL CONTRACT SUM
            </span>
          </div>
          <div className="text-4xl font-bold text-green-600">
            {formatCurrency(finalContractSum)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-base text-gray-600 font-medium mb-4">
            Total Bills
          </div>
          <div className="text-5xl font-bold text-gray-950">{bills.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-base text-gray-600 font-medium mb-4">
            Total Sections
          </div>
          <div className="text-5xl font-bold text-gray-950">
            {totalSections}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-base text-gray-600 font-medium mb-4">
            Total Items
          </div>
          <div className="text-5xl font-bold text-gray-950">{totalItems}</div>
        </div>
      </div>
    </div>
  );
}
