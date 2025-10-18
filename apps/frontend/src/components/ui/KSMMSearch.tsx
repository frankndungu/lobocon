"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Search, Book } from "lucide-react";

interface KSMMClause {
  id: number;
  section_code: string;
  section: string;
  contents: string;
  clause_title: string;
  clause_reference: string;
}

interface KSMMSearchProps {
  onSelect: (clause: KSMMClause) => void;
  placeholder?: string;
}

export default function KSMMSearch({
  onSelect,
  placeholder = "Search KSMM clauses...",
}: KSMMSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: clauses, isLoading } = useQuery({
    queryKey: ["ksmm-search", searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      const response = await api.get<KSMMClause[]>(
        `/clauses?search=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    },
    enabled: searchTerm.length >= 2,
  });

  const handleSelect = (clause: KSMMClause) => {
    onSelect(clause);
    setSearchTerm(clause.clause_title);
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(searchTerm.length >= 2 && Boolean(clauses?.length));
  }, [searchTerm, clauses]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-base font-medium"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() =>
            setIsOpen(searchTerm.length >= 2 && Boolean(clauses?.length))
          }
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Searching KSMM clauses...
            </div>
          ) : clauses?.length ? (
            clauses.map((clause) => (
              <button
                key={clause.id}
                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelect(clause)}
              >
                <div className="flex items-start space-x-3">
                  <Book className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {clause.section} - {clause.clause_title}
                    </div>
                    <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {clause.clause_reference}
                    </div>
                    <div className="text-blue-600 text-xs mt-1">
                      {clause.contents}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No KSMM clauses found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
