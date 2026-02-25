import { useState, useEffect } from "react";

export function useTablePagination<T>(
  data: T[],
  searchTerm: string,
  filterFn: (item: T, search: string) => boolean,
  pageSize: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1);

  const search = searchTerm.trim().toLowerCase();

  const filteredData = data.filter((item) =>
    search === "" ? true : filterFn(item, search)
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  return {
    filteredData,
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    getPageNumbers,
    startIndex,
  };
}