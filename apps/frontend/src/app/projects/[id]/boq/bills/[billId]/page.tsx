"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface Section {
  id: number;
  section_code: string;
  section_title: string;
  preamble?: string;
  total_amount: number;
  item_count: number;
  items: Item[];
}

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

interface BillWithSections {
  id: number;
  bill_number: string;
  bill_title: string;
  subtotal_amount: number;
  contingency_percentage: number;
  contingency_amount: number;
  total_amount: number;
  sections: Section[];
}

export default function BillDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const billId = params.billId as string;
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  const { data: bill, isLoading } = useQuery({
    queryKey: ["bill-full", billId],
    queryFn: async () => {
      const response = await api.get<BillWithSections>(
        `/boq/bills/${billId}/full`
      );
      return response.data;
    },
  });

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getItemTypeBadge = (type: string) => {
    const styles = {
      MEASURED: "bg-blue-100 text-blue-800",
      LUMP_SUM: "bg-purple-100 text-purple-800",
      PRIME_COST: "bg-orange-100 text-orange-800",
      PROVISIONAL: "bg-yellow-100 text-yellow-800",
      ATTENDANT: "bg-gray-100 text-gray-800",
      COLLECTION: "bg-green-100 text-green-800",
    };
    return styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading bill details...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Bill not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {bill.bill_number}
                </h1>
                <p className="text-gray-600 mt-1">{bill.bill_title}</p>
              </div>
            </div>

            {/* Bill Totals */}
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                KES {Number(bill.total_amount).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                Subtotal: KES {Number(bill.subtotal_amount).toLocaleString()} +
                {bill.contingency_percentage}% contingency
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Sections</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {bill.sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm border"
            >
              {/* Section Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.section_code}: {section.section_title}
                      </h3>
                      {section.preamble && (
                        <p className="text-sm text-gray-600 mt-1">
                          {section.preamble}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        KES {Number(section.total_amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {section.item_count} items
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              {expandedSections.has(section.id) && (
                <div className="border-t bg-gray-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Items</h4>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1">
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-mono text-sm font-medium">
                                  {item.item_code}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getItemTypeBadge(
                                    item.item_type
                                  )}`}
                                >
                                  {item.item_type}
                                </span>
                              </div>
                              <p className="text-gray-900 text-sm">
                                {item.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                <span>Unit: {item.unit}</span>
                                <span>
                                  Rate: KES {Number(item.rate).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                KES {Number(item.amount).toLocaleString()}
                              </div>
                              <div className="flex space-x-1 mt-2">
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <Edit className="w-3 h-3 text-gray-600" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {bill.sections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No sections found</div>
            <p className="text-gray-600">
              Add your first section to start building this bill.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
