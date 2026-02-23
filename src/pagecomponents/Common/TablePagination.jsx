import React from "react";
import { Button } from "react-bootstrap";

const TablePagination = ({
  variant = "compact",
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 10,
  pageSizeOptions = [5, 10, 15, 20, 50],
  rowsPerPageLabel = "Rows per page",
  updateRowsPerPage,
  onPageChange,
  footerLeftContent = null,
}) => {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
  const safeCurrentPage = Math.max(1, Number(currentPage) || 1);
  const isOnFirstPage = safeCurrentPage <= 1;
  const isOnLastPage = safeCurrentPage >= safeTotalPages;
  const canChangePage = typeof onPageChange === "function";

  if (variant === "default") {
    return (
      <div className="d-block d-sm-flex mt-4 ">
        <span className="">
          Page{" "}
          <strong>
            {safeCurrentPage} of {safeTotalPages}
          </strong>{" "}
        </span>
        <span className="ms-sm-auto ">
          <Button
            variant=""
            className="btn-default tablebutton me-2 my-1"
            onClick={() => canChangePage && onPageChange(1)}
            disabled={isOnFirstPage || !canChangePage}
          >
            {" << "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
            onClick={() => canChangePage && onPageChange(safeCurrentPage - 1)}
            disabled={isOnFirstPage || !canChangePage}
          >
            {" Previous "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
            onClick={() => canChangePage && onPageChange(safeCurrentPage + 1)}
            disabled={isOnLastPage || !canChangePage}
          >
            {" Next "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 my-1"
            onClick={() => canChangePage && onPageChange(safeTotalPages)}
            disabled={isOnLastPage || !canChangePage}
          >
            {" >> "}
          </Button>
        </span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between mt-4 table-pagination-compact">
      <span className="table-pagination-left">{footerLeftContent}</span>
      <div className="d-flex flex-wrap align-items-center table-pagination-right">
        <span className="me-2">{rowsPerPageLabel}</span>
        <select
          className="selectpage border me-3"
          id="showRowsPerPageBottom"
          value={rowsPerPage}
          onChange={(e) =>
            typeof updateRowsPerPage === "function" && updateRowsPerPage(Number(e.target.value))
          }
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="me-3 table-page-text">
          Page {safeCurrentPage} of {safeTotalPages}
        </span>
        <div className="d-flex align-items-center table-pagination-buttons">
          <Button
            variant=""
            className="btn-default tablebutton me-1 my-1"
            onClick={() => canChangePage && onPageChange(1)}
            disabled={isOnFirstPage || !canChangePage}
          >
            {"<<"}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-1 my-1"
            onClick={() => canChangePage && onPageChange(safeCurrentPage - 1)}
            disabled={isOnFirstPage || !canChangePage}
          >
            {"<"}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-1 my-1"
            onClick={() => canChangePage && onPageChange(safeCurrentPage + 1)}
            disabled={isOnLastPage || !canChangePage}
          >
            {">"}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton my-1"
            onClick={() => canChangePage && onPageChange(safeTotalPages)}
            disabled={isOnLastPage || !canChangePage}
          >
            {">>"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;

