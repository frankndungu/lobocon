"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Search, Book, X, Copy, Hash, FileText } from "lucide-react";

interface KSMMClause {
  id: number;
  section_code: string;
  section: string;
  contents: string;
  clause_title: string;
  clause_reference: string;
}

interface KSMMSearchProps {
  onSelect?: (clause: KSMMClause) => void; // Made optional for reference-only mode
  placeholder?: string;
  className?: string;
  showTemplateOptions?: boolean;
}

export default function KSMMSearch({
  onSelect,
  placeholder = "Search KSMM clauses or enter section code (A, B, C, A1, B2...)...",
  className = "",
  showTemplateOptions = true,
}: KSMMSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState<KSMMClause | null>(null);
  const [templateMode, setTemplateMode] = useState<"full" | "title" | "custom">(
    "full"
  );
  const searchRef = useRef<HTMLDivElement>(null);

  // Get available section codes for quick reference
  const { data: sectionCodes } = useQuery({
    queryKey: ["ksmm-section-codes"],
    queryFn: async () => {
      const response = await api.get<string[]>("/clauses/sections/codes");
      return response.data;
    },
  });

  const { data: clauses, isLoading } = useQuery({
    queryKey: ["ksmm-search", searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 1) return [];
      const response = await api.get<KSMMClause[]>(
        `/clauses?search=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    },
    enabled: searchTerm.length >= 1,
  });

  const handleSelect = (clause: KSMMClause) => {
    setSelectedClause(clause);
    // ✅ REMOVED: No longer automatically populates description
    // Users must manually copy what they want using the copy buttons
    setIsOpen(false);
  };

  const quickSearchSection = (sectionCode: string) => {
    setSearchTerm(sectionCode);
    setIsOpen(true);
  };

  const clearSelection = () => {
    setSelectedClause(null);
    setSearchTerm("");
  };

  const copyClauseContent = (clause: KSMMClause) => {
    let content;
    switch (templateMode) {
      case "title":
        content = clause.clause_title;
        break;
      case "custom":
        content = `${clause.clause_title}: ${clause.contents}`;
        break;
      default:
        content = clause.contents;
    }
    navigator.clipboard.writeText(content);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(
      searchTerm.length >= 1 && Boolean(clauses?.length) && !selectedClause
    );
  }, [searchTerm, clauses, selectedClause]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Section Access */}
      {sectionCodes && sectionCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-600 flex items-center mr-2">
            <Hash className="w-3 h-3 mr-1" />
            Quick sections:
          </span>
          {sectionCodes.slice(0, 8).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => quickSearchSection(code)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      )}

      {/* Template Mode Selection */}
      {showTemplateOptions && (
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-gray-600">Template:</span>
          <div className="flex space-x-2">
            {[
              { value: "full", label: "Full Content" },
              { value: "title", label: "Title Only" },
              { value: "custom", label: "Title + Content" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTemplateMode(option.value as any)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  templateMode === option.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-sm"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedClause(null);
            }}
            onFocus={() => {
              if (
                searchTerm.length >= 1 &&
                clauses?.length &&
                !selectedClause
              ) {
                setIsOpen(true);
              }
            }}
          />
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                Searching KSMM clauses...
              </div>
            ) : clauses?.length ? (
              <div className="divide-y divide-gray-100">
                {clauses.map((clause) => {
                  // Preview based on template mode
                  let previewContent;
                  switch (templateMode) {
                    case "title":
                      previewContent = clause.clause_title;
                      break;
                    case "custom":
                      previewContent = `${clause.clause_title}: ${clause.contents}`;
                      break;
                    default:
                      previewContent = clause.contents;
                  }

                  return (
                    <div
                      key={clause.id}
                      className="relative group"
                      title={`Full Reference: ${clause.clause_reference}`}
                    >
                      <button
                        className="w-full p-4 text-left hover:bg-blue-50 transition-colors group"
                        onClick={() => handleSelect(clause)}
                      >
                        <div className="flex items-start space-x-3">
                          <Book className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {clause.section}
                              </span>
                              <span className="font-medium text-gray-900 text-sm">
                                {clause.clause_title}
                              </span>
                            </div>

                            {/* Clause Reference - Always visible */}
                            <div className="text-gray-600 text-xs mb-2 leading-relaxed">
                              <span className="font-medium">Reference: </span>
                              <span className="italic">
                                {clause.clause_reference}
                              </span>
                            </div>

                            {/* Template Preview */}
                            <div className="text-gray-700 text-sm line-clamp-2 leading-relaxed mb-2">
                              <span className="text-xs text-gray-500 font-medium">
                                Preview:{" "}
                              </span>
                              {previewContent}
                            </div>

                            <div className="text-xs text-gray-500">
                              Section: {clause.section_code} •{" "}
                              {clause.contents.length} chars
                            </div>
                          </div>

                          {/* Copy buttons */}
                          <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                copyClauseContent(clause);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-all cursor-pointer rounded"
                              title="Copy template content"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  clause.clause_reference
                                );
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-all cursor-pointer rounded"
                              title="Copy full reference"
                            >
                              <FileText className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </button>

                      {/* Hover tooltip for full reference */}
                      <div className="absolute left-0 top-full mt-2 w-full max-w-md bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                        <div className="font-medium mb-1">
                          Full KSMM Reference:
                        </div>
                        <div className="leading-relaxed">
                          {clause.clause_reference}
                        </div>
                        <div className="mt-2 text-gray-300">
                          Click FileText icon to copy • Click Copy icon for
                          template
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Book className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <div className="text-sm">No KSMM clauses found</div>
                <div className="text-xs text-gray-400 mt-1">
                  Try section codes like A, B, C or keywords
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Clause Display */}
      {selectedClause && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm">
                  KSMM Template Applied
                </span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  {templateMode}
                </span>
              </div>
              <div className="text-sm text-blue-800 mb-1">
                <strong>{selectedClause.section}:</strong>{" "}
                {selectedClause.clause_title}
              </div>
              <div className="text-sm text-blue-700 leading-relaxed">
                {templateMode === "title" && selectedClause.clause_title}
                {templateMode === "custom" &&
                  `${selectedClause.clause_title}: ${selectedClause.contents}`}
                {templateMode === "full" && selectedClause.contents}
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors ml-2"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
