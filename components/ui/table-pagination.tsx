import { ChevronLeft, ChevronRight } from "lucide-react";

import * as React from 'react';
import { Button } from './button';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  dataLength: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  dataLength,
  onPageChange,
  pageSize,
}) => {
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const startItem = dataLength > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, dataLength);

  if (dataLength === 0) {
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-gray-500">
        총 {dataLength}개 중 {startItem}-{endItem}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">이전 페이지</span>
        </Button>
        <div className="flex items-center">
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "ghost"}
              size="sm"
              className="w-8"
              onClick={() => onPageChange(pageNum)}
              aria-label={` 페이지`}
              aria-current={pageNum === currentPage ? "page" : undefined}
            >
              {pageNum}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">다음 페이지</span>
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
