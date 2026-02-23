import React, { useEffect, useState } from "react";
import { CCol, CFormLabel, CFormFeedback, CFormInput } from "@coreui/react";
import { checkEmpty } from "../../../helpers/utility";
import {
  Button,
  Card,
  Col,
  Row,
  Table,
  Spinner,
  Dropdown,
  ButtonGroup,
  Alert,
} from "react-bootstrap";
import { GlobalFilter } from "../../../components/job/job/data";
import ActionDropdown from "../Dropdown/ActionDropdown";

const TableData = ({
  header,
  data,
  shortType = "formApi",
  handleChange,
  pagesizeArray,
  TotalPage,
  perPageSize,
  currentPage,
  handleAction,
}) => {
  const [dataArray, setdataArray] = React.useState(data);
  const [shortBY, setshortBY] = React.useState("");
  const [shortField, setshortField] = React.useState();

  const [headerArray, setheaderArray] = useState(header);
  const [searchArray, setsearchArray] = useState([]);
  const [searchkey, setsearchkey] = useState([]);
  const [globalFilter, setglobalFilterValue] = useState();
  const [canPreviousPage, setcanPreviousPage] = useState();
  const [canNextPage, setcanNextPage] = useState();

  useEffect(() => {
    setdataArray(data);
    setheaderArray(header);
  }, [data, header]);

  const shortingData = (index, short, accessor) => {
    if (short == "Yes") {
      setshortField(accessor);
      if (shortBY == "" || shortBY == "DESC") {
        if (shortType == "fromData") {
          // Sorting by ascending order
          const sortedData = dataArray.sort((a, b) => {
            if (a[index] < b[index]) return -1; // a comes before b
            if (a[index] > b[index]) return 1; // a comes after b
            return 0; // a and b are equal
          });
          setdataArray(sortedData);
        } else {
          handleChange(accessor, shortBY, "", "", "");
        }
        setshortBY("ASC");
      } else {
        if (shortType == "fromData") {
          // Sorting by descending order
          const sortedData = dataArray.sort((a, b) => {
            if (a[index] < b[index]) return 1; // a comes after b
            if (a[index] > b[index]) return -1; // a comes before b
            return 0; // a and b are equal
          });
          setdataArray(sortedData);
        } else {
          handleChange(accessor, shortBY, "", "", "");
        }

        setshortBY("DESC");
      }
    }
  };

  // Dynamic filtering function
  const dynamicFilter = (arr, searchKeys, searchValues) => {
    return arr.filter((item) =>
      searchValues.every((value) =>
        searchKeys.some(
          (key) => item[key].toLowerCase().includes(value.toLowerCase()) // Check for substring matches
        )
      )
    );
  };

  const ChangeFuntion = (e, index, accessor) => {
    const headervalue = headerArray.map((headerA, indx) =>
      indx === index
        ? { ...headerA, value: e.target.value.toLowerCase() }
        : headerA
    );
    setheaderArray(headervalue);
    let valueArray = [];
    let keyArray = [];
    headervalue.map((headerA, indx) => {
      if (headerA.value != "") {
        valueArray.push(headerA.value);
        keyArray.push(indx);
      }
    });

    setsearchArray(valueArray);
    setsearchkey(keyArray);

    if (shortType == "fromData") {
      if (!checkEmpty(valueArray) && !checkEmpty(keyArray)) {
        // Call the dynamicFilter function
        setTimeout(() => {
          const result = dynamicFilter(
            data,
            keyArray,
            valueArray.map((value) => value.toLowerCase())
          );
          setdataArray(result);
        }, 100);
      } else {
        setdataArray(data);
      }
    } else {
      handleChange(accessor, "", "", "", "");
    }
  };

  const dynamicglobarFilter = (arr, term) => {
    return arr.filter((item) =>
      item.some((value) =>
        value.toString().toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const setGlobalFilter = (e) => {
    setglobalFilterValue(e.target.value);
    if (shortType == "fromData") {
      const result = dynamicglobarFilter(data, e.target.value);
      setdataArray(result);
    } else {
      handleChange("", "", e.target.value, "", "");
    }
  };

  useEffect(() => {
    setcanPreviousPage(currentPage > 1);
    setcanNextPage(currentPage < TotalPage);
  }, [currentPage, TotalPage]);

  const gotoPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= TotalPage) {
      handleChange("", "", "", pageNumber, perPageSize);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      handleChange("", "", "", currentPage - 1, perPageSize);
    }
  };

  const nextPage = () => {
    if (currentPage < TotalPage) {
      handleChange("", "", "", currentPage + 1, perPageSize);
    }
  };

  const actionChange = (action, rowData, indx) => {
    handleAction(action, rowData, indx);
  };

  return (
    <div className="table-responsive">
      <div className="d-flex">
        <select
          className=" mb-4 selectpage border me-1"
          value={perPageSize}
          onChange={(e) => {
            // setperPageSize(Number(e.target.value));
            handleChange("", "", "", 1, Number(e.target.value));
            setshortBY("");
          }}
        >
          {pagesizeArray.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        <span className="d-flex ms-auto">
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e)}
            className="form-control mb-4"
            placeholder="Search..."
          />
        </span>
      </div>

      <Table className="table table-bordered table-hover mb-0 text-md-nowrap">
        <thead>
          <tr>
            {headerArray.map((headerIterm, index) => (
              <td
                onClick={() =>
                  shortingData(index, headerIterm.short, headerIterm.accessor)
                }
                className="cursor-pointer"
              >
                {headerIterm.headerTitle}
                <span>
                  {headerIterm.short === "Yes" &&
                  shortField == headerIterm.accessor ? (
                    shortBY == "DESC" ? (
                      <i className="fa fa-angle-up"></i>
                    ) : shortBY == "ASC" ? (
                      <i className="fa fa-angle-down"></i>
                    ) : (
                      ""
                    ) // Replaced () with null
                  ) : (
                    "" // You can also use null here if no output is desired
                  )}
                </span>
              </td>
            ))}
          </tr>

          <tr>
            {headerArray.map((headerIterm, index) =>
              headerIterm.search === "Yes" ? (
                <td>
                  <input
                    type="text"
                    value={headerIterm.value}
                    onChange={(e) =>
                      ChangeFuntion(e, index, headerIterm.accessor)
                    }
                  />
                </td>
              ) : (
                <td></td>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {!checkEmpty(dataArray) ? (
            dataArray.map((row, index) => (
              <tr key={index}>
                {row.map((cell, i) => (
                  <td key={i}>
                    {Array.isArray(cell) ? (
                      <ActionDropdown
                        title="Manage"
                        items={cell}
                        rowData={row}
                        indx={index}
                        handleActionChange={actionChange}
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <td colspan="7" className="text-center">
              No data found.
            </td>
          )}
        </tbody>
      </Table>

      <div className="d-block d-sm-flex mt-4 ">
        <span className="">
          Page{" "}
          <strong>
            {currentPage} of {TotalPage}
          </strong>{" "}
        </span>
        <span className="ms-sm-auto ">
          <Button
            variant=""
            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
            onClick={() => gotoPage(1)}
            disabled={!canPreviousPage}
          >
            {" Previous "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 my-1"
            onClick={() => {
              previousPage();
            }}
            disabled={!canPreviousPage}
          >
            {" << "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 my-1"
            onClick={() => {
              previousPage();
            }}
            disabled={!canPreviousPage}
          >
            {" < "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 my-1"
            onClick={() => {
              nextPage();
            }}
            disabled={!canNextPage}
          >
            {" > "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 my-1"
            onClick={() => {
              nextPage();
            }}
            disabled={!canNextPage}
          >
            {" >> "}
          </Button>
          <Button
            variant=""
            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
            onClick={() => gotoPage(TotalPage)}
            disabled={!canNextPage}
          >
            {" Next "}
          </Button>
        </span>
      </div>
    </div>
  );
};

export default TableData;

