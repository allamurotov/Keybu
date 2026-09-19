"use client";
import React from "react";
import { ChevronDown } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onDownloadXLS: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onDownloadXLS,
}: PaginationProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between py-4 gap-4 bg-[#F8F9FA] rounded-b-xl px-4">
      <div className="flex items-center gap-5 text-[14px] text-gray-700 font-semibold">
        <span>
          Sahifada {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} gacha.
          Umumiy {totalItems}ta
        </span>

        <button
          onClick={onDownloadXLS}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
              fill="#107C41"
            />
            <path d="M14 2V8H20" fill="#185C37" />
            <path
              d="M8.5 11L10.5 15.5L8.5 20H11L12 17.5L13 20H15.5L13.5 15.5L15.5 11H13L12 13.5L11 11H8.5Z"
              fill="white"
            />
          </svg>
          <span>({totalItems}) Yuklab olish .XLS</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[14px] text-gray-700 font-medium relative group">
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="appearance-none bg-transparent outline-none cursor-pointer pr-5"
          >
            <option value={10}>Bir sahifada: 10</option>
            <option value={20}>Bir sahifada: 20</option>
            <option value={50}>Bir sahifada: 50</option>
          </select>
          <ChevronDown
            size={16}
            className="text-gray-500 absolute right-0 pointer-events-none"
          />
        </div>

        <div className="flex items-center gap-1 ml-4">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-[14px] font-medium transition-colors ${currentPage === page ? "bg-white border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-gray-900" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="text-gray-400 px-1 font-medium">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 h-8 flex items-center justify-center rounded bg-white border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-1 disabled:opacity-50"
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  );
}
