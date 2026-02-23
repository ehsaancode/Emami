import React, { useEffect, useState } from "react";
import { checkEmpty } from "../../../helpers/utility";
import { Button, Table } from "react-bootstrap";
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
  pagination,
}) => {
  const [dataArray, setdataArray] = React.useState();
  const [shortBY, setshortBY] = React.useState("");
  const [shortField, setshortField] = React.useState();
  const [headerArray, setheaderArray] = useState(header);
  const [searchArray, setsearchArray] = useState([]);
  const [searchkey, setsearchkey] = useState([]);
  const [globalFilter, setglobalFilterValue] = useState();
  const [canPreviousPage, setcanPreviousPage] = useState();
  const [canNextPage, setcanNextPage] = useState();
  const [isSearchEnabled, setisSearchEnabled] = useState();

  useEffect(() => {
    setdataArray(data);
    console.log(data)
    setheaderArray(header);
    setisSearchEnabled(header?.some((item) => item.search === "Yes"));
  }, [data, header]);




  const shortingData = (index, short, accessor) => {
    if (short == "Yes") {
      setshortField(accessor);
      if (shortBY == "" || shortBY == "desc") {
        if (shortType == "fromData") {
          // Sorting by ascending order
          const sortedData = dataArray?.sort((a, b) => {
            if (a[index] < b[index]) return -1; // a comes before b
            if (a[index] > b[index]) return 1; // a comes after b
            return 0; // a and b are equal
          });
          setdataArray(sortedData);
        } else {
          handleChange(accessor, 'asc', "", 1, perPageSize);
        }
        setshortBY("asc");
      } else {
        if (shortType == "fromData") {
          // Sorting by descending order
          const sortedData = dataArray?.sort((a, b) => {
            if (a[index] < b[index]) return 1; // a comes after b
            if (a[index] > b[index]) return -1; // a comes before b
            return 0; // a and b are equal
          });
          setdataArray(sortedData);
        } else {
          handleChange(accessor, 'desc', "", 1, perPageSize);
        }

        setshortBY("desc");
      }
    }
  };

  // Dynamic filtering function
  const dynamicFilter = (arr, searchKeys, searchValues) => {
    return arr.filter((item) =>
      searchValues?.every((value) =>
        searchKeys?.some((key) => {
          // Convert item[key] to string if it's not already a string
          const itemValue = item[key] != null ? item[key].toString() : "";
          // Perform case-insensitive search by converting both to strings and lowercasing them
          return itemValue.toLowerCase().includes(value.toLowerCase());
        })
      )
    );
  };

  const ChangeFuntion = (e, index, accessor) => {
    const headervalue = headerArray?.map((headerA, indx) =>
      indx === index
        ? { ...headerA, value: e.target.value.toLowerCase() }
        : headerA
    );
    setheaderArray(headervalue);
    let valueArray = [];
    let keyArray = [];
    headervalue?.map((headerA, indx) => {
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
            valueArray?.map((value) => value.toLowerCase())
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
    return arr?.filter((item) =>
      item?.some((value) =>
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
        {pagination == "Yes" ? (
          <div className="show">
            <span style={{ 'paddingRight': '5px'}}>Show</span> 
            <select
              className=" mb-4 selectpage border me-1"
              value={perPageSize}
              onChange={(e) => {
                // setperPageSize(Number(e.target.value));
                handleChange("", "", "", 1, Number(e.target.value));
                setshortBY("");
              }}
            >
              {pagesizeArray?.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                   {pageSize}
                </option>
              ))}
            </select>
          </div>
         
        ) : (
          ""
        )}

        {/* <span className="d-flex ms-auto">
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e)}
            className="form-control mb-4"
            placeholder="Search..."
          />
        </span> */}
      </div>

      <Table className="table table-bordered table-hover mb-0 text-md-nowrap">
        <thead>
          <tr>
            {headerArray?.map((headerIterm, index) =>
              headerIterm.show ? (
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
                      shortBY == "desc" ? (
                        <i className="fa fa-angle-up"></i>
                      ) : shortBY == "asc" ? (
                        <i className="fa fa-angle-down"></i>
                      ) : (
                        ""
                      ) // Replaced () with null
                    ) : (
                      "" // You can also use null here if no output is desired
                    )}
                  </span>
                </td>
              ) : (
                ""
              )
            )}
          </tr>

          <tr>
            {isSearchEnabled &&
              headerArray?.map((headerIterm, index) =>
                headerIterm.show ? (
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
                ) : (
                  ""
                )
              )}
          </tr>
        </thead>
        <tbody>
          {!checkEmpty(dataArray) ? (
            dataArray?.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row?.map((cell, cellIndex) =>
                  cellIndex > 0 ? (
                    <td key={cellIndex}>
                      {Array.isArray(cell) ? (
                        cell.map((item, itemIndex) => {
                          if (item === "Edit") {
                            return (
                              <Button
                                key={itemIndex}
                                type="button"
                                variant="dark"
                                className="btn btn-sm me-2"
                                onClick={() => actionChange(item, row, rowIndex)}
                              >
                                Edit
                              </Button>
                            );
                          }
                          if (item === "Delete") {
                            return (
                              <Button
                                key={itemIndex}
                                type="button"
                                variant="danger"
                                className="btn btn-sm me-2"
                                onClick={() => actionChange(item, row, rowIndex)}
                              >
                                Delete
                              </Button>
                            );
                          }
                          if (item === "Print") {
                            return (
                              <Button
                                key={itemIndex}
                                type="button"
                                variant="dark"
                                className="btn btn-sm me-2"
                                onClick={() => actionChange(item, row, rowIndex)}
                              >
                                Print
                              </Button>
                            );
                          }
                          return null;
                        })
                      ) : (
                        
                        <div dangerouslySetInnerHTML={{ __html: cell }} />
                      )}
                    </td>
                  ) : null
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="40" className="text-center">
                No data found.
              </td>
            </tr>
          )}
        </tbody>

      </Table>

      {!checkEmpty(dataArray) && pagination == "Yes" && TotalPage>1 ? (
        <div className="d-block d-sm-flex mt-4 ">
          <div className="">
             {/* {currentPage}  */}
            <span style={{ 'paddingRight': '5px'}}>Page</span> 
            <select
              className="mb-4 selectpage border me-1"
              value={currentPage}
              onChange={(e) => {
                handleChange("", "", "", Number(e.target.value), perPageSize);
              }} // Assuming setCurrentPage is defined
            >
              {/* {Array.from({ length: TotalPage }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <option key={pageNumber} value={pageNumber}>
                    {pageNumber}
                  </option>
                )
              )} */}

              {TotalPage > 0 &&
                Array.from({ length: TotalPage }, (_, i) => i + 1).map((pageNumber) => (
                  <option key={pageNumber} value={pageNumber}>
                    {pageNumber}
                  </option>
                ))}

            </select>
            <strong>of {TotalPage}</strong>{" "}
          </div>
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
      ) : (
        <></>
      )}
    </div>
  );
};

export default TableData;

