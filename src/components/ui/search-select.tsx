"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface SearchSelectOption {
  value: string;
  label: string;
  meta?: string;
}

interface SearchSelectProps {
  name: string;
  options: SearchSelectOption[];
  className?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
}

export function SearchSelect({
  name,
  options,
  className,
  placeholder = "Search and select",
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  required = false,
  emptyMessage = "No matches found",
}: SearchSelectProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    value ?? defaultValue ?? options[0]?.value ?? "",
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = isControlled ? value ?? "" : internalValue;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value ?? "");
    }
  }, [isControlled, value]);

  useEffect(() => {
    if (!options.some((option) => option.value === selectedValue)) {
      const fallbackValue = options[0]?.value ?? "";
      if (!isControlled) {
        setInternalValue(fallbackValue);
      }
      if (fallbackValue && fallbackValue !== selectedValue) {
        onValueChange?.(fallbackValue);
      }
    }
  }, [isControlled, onValueChange, options, selectedValue]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) {
      return options;
    }
    const normalizedQuery = query.toLowerCase();
    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(normalizedQuery);
      const metaMatch = option.meta?.toLowerCase().includes(normalizedQuery);
      return labelMatch || metaMatch;
    });
  }, [options, query]);

  const handleSelect = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
      setOpen(false);
    },
    [isControlled, onValueChange],
  );

  const displayLabel = selectedOption?.label ?? placeholder;

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <input
        type="hidden"
        name={name}
        value={selectedValue}
        required={required}
      />
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-white transition hover:border-fuchsia-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40",
          disabled && "cursor-not-allowed opacity-60",
        )}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span className={cn(!selectedOption && "text-white/50")}>
          {displayLabel}
        </span>
        <svg
          className={cn(
            "h-4 w-4 transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Search className="h-4 w-4 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="mt-3 max-h-64 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10",
                  option.value === selectedValue && "bg-white/10",
                )}
                onClick={() => handleSelect(option.value)}
              >
                <p className="font-semibold">{option.label}</p>
                {option.meta && (
                  <p className="text-xs text-white/60">{option.meta}</p>
                )}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-white/60">
                {emptyMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


