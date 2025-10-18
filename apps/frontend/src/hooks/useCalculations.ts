import { useMemo } from "react";

interface Item {
  quantity: number;
  rate: number;
  amount: number;
}

interface Section {
  items: Item[];
  total_amount: number;
}

interface Bill {
  sections: Section[];
  contingency_percentage: number;
  subtotal_amount?: number;
  total_amount?: number;
}

export function useCalculations(bill: Bill) {
  return useMemo(() => {
    if (!bill || !bill.sections) {
      return {
        subtotal: 0,
        contingencyAmount: 0,
        totalAmount: 0,
        sectionCount: 0,
        itemCount: 0,
      };
    }

    // Use backend calculated values if available, otherwise calculate
    const subtotal =
      bill.subtotal_amount ||
      bill.sections.reduce((total, section) => {
        return total + (section.total_amount || 0);
      }, 0);

    const contingencyAmount =
      (subtotal * (bill.contingency_percentage || 0)) / 100;
    const totalAmount = bill.total_amount || subtotal + contingencyAmount;

    const itemCount = bill.sections.reduce((total, section) => {
      return total + (section.items?.length || 0);
    }, 0);

    return {
      subtotal: isNaN(subtotal) ? 0 : subtotal,
      contingencyAmount: isNaN(contingencyAmount) ? 0 : contingencyAmount,
      totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
      sectionCount: bill.sections.length,
      itemCount: isNaN(itemCount) ? 0 : itemCount,
    };
  }, [bill]);
}
