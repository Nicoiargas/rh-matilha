"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  defaultValue?: string;
  clearable?: boolean;
}

export function SearchInput({
  placeholder = "Buscar...",
  onSearch,
  className = "",
  defaultValue = "",
  clearable = true
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce para evitar muitas chamadas durante a digitação
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== defaultValue) {
        setIsSearching(true);
        onSearch(query);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch, defaultValue]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch(query);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="pl-10 pr-10"
        disabled={isSearching}
      />
      {clearable && query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
