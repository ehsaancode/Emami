import React from "react";
import { Dropdown } from "react-bootstrap";

const ActionDropdown = ({
  toggleBtnClassName,
  title,
  items = [],
  handleActionChange,
  rowData,
  indx,
}) => {
  return (
    <>
      <Dropdown>
        <Dropdown.Toggle
          className={`btn btn-dark btn-sm ${toggleBtnClassName}`}>
          {title}
        </Dropdown.Toggle>
        <Dropdown.Menu
          style={{ margin: "0px" }}
          className="dropdown-menu tx-13"
        >
          {items.map((item, index) => (
            <Dropdown.Item
              key={index}
              className={`dropdown-item ${item === "Delete" ? "delete-item" : ""}`}
              onClick={(e) => {
                handleActionChange(item, rowData, indx);
              }}
            >
              {item}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default ActionDropdown;

