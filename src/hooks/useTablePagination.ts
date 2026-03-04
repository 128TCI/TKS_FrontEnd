import { useState, useEffect } from "react";

export function useTablePagination<T>(
  data: T[],
  searchTerm: string,
  filterFn: (item: T, search: string) => boolean,
  pageSize: number = 10
) {
  // Current page state
  const [currentPage, setCurrentPage] = useState(1);

  // Normalize search term
  const search = searchTerm.trim().toLowerCase();

  // Filter data based on search
  const filteredData = data.filter((item) =>
    search === "" ? true : filterFn(item, search)
  );

  // Calculate total pages (at least 1)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Calculate start/end indexes for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const endIndex = startIndex + paginatedData.length; // <= Correct end index

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  return {
    filteredData,      // All filtered items
    paginatedData,     // Items for current page
    totalPages,        // Total pages
    currentPage,       // Current page number
    setCurrentPage,    // Function to set current page
    getPageNumbers,    // Function to get pagination numbers
    startIndex,        // Start index for current page
    endIndex,          // End index for current page
  };
}