import React, { useState } from "react";
import { Breadcrumb, Button, Card, Col, Dropdown, Form, Row, Table, Modal, FormGroup } from "react-bootstrap";

const CustomTable = ({ columns, data }) => {
  // State for Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // State for Filtering
  const [filterText, setFilterText] = useState("");

  // Handle Sorting
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Handle Filtering
  const filteredData = sortedData.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  // Pagination Logic
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  console.log(paginatedData);
  

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <>
        {/* Filter Input */}
        {/* <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter rows..."
        /> */}

        {/* Rows Per Page Dropdown */}
        <div className="d-flex">
            <label htmlFor="rowsPerPage">Show </label>
            <select
                className=" mb-4 selectpage border me-1"
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
            </select>
        </div>

        {/* Table */}
        <table className="table table-bordered text-nowrap mb-0">
            <thead>
                <tr>
                {columns.map((column) => (
                    <th
                    key={column.accessor}
                    onClick={() => handleSort(column.accessor)}
                    >
                    {column.label}
                    {sortConfig.key === column.accessor
                        ? sortConfig.direction === "asc"
                        ? <i className="fa fa-angle-up"></i>
                        : <i className="fa fa-angle-down"></i>
                        : ""}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {columns.map((column) => (
                    <td key={column.accessor}>{row[column.accessor]}</td>
                    ))}
                </tr>
                ))}
            </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="d-block d-sm-flex mt-4 ">
            <span className="">
                Page{" "}
                <strong>
                {currentPage} of {totalPages}
                </strong>{" "}
            </span>
            <span className="ms-sm-auto ">
                <Button
                    variant=""
                    className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    >
                    {" Previous "}
                </Button>
                <Button
                    variant=""
                    className="btn-default tablebutton me-2 my-1"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                {" << "}
                </Button>
                <Button
                    variant=""
                    className="btn-default tablebutton me-2 my-1"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                {" < "}
                </Button>
                {/* <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button> */}
                {/* <span style={{ margin: "0 10px" }}>
                    Page {currentPage} of {totalPages}
                </span> */}
                {/* <button
                    onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                >
                    Next
                </button> */}
                <Button
                    variant=""
                    className="btn-default tablebutton me-2 my-1"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                {" > "}
                </Button>
                <Button
                    variant=""
                    className="btn-default tablebutton me-2 my-1"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                {" >> "}
                </Button>
                <Button
                    variant=""
                    className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                {" Next "}
                </Button>
            </span>
        </div>
    </>
  );
};

export default CustomTable;
