"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder = "Tanlang" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current && !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    // Close on scroll to prevent detached floating
    const handleScroll = (event: Event) => {
      if (isOpen && selectRef.current && !selectRef.current.contains(event.target as Node) && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", () => setIsOpen(false));
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", () => setIsOpen(false));
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
      <button
        ref={selectRef}
        type="button"
        onClick={toggleDropdown}
        className="w-full px-4 py-2.5 bg-gray-50/50 backdrop-blur-md border border-gray-200 shadow-sm rounded-xl flex items-center justify-between text-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <span className={selectedOption ? "text-gray-800 font-medium" : "text-gray-400 font-medium"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {mounted && isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white/90 backdrop-blur-2xl border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                  value === option.value 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 font-medium"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
