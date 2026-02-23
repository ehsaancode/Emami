import { ButtonGroup, Dropdown } from "react-bootstrap";
import { useState } from "react";

const CommonDropDown = () => {

  const [selected,setSelected] = useState("")  
  const handleSlectedValue = (selectedVal)=>{
    setSelected(selectedVal)
  }
  // console.log("Selected Value:- ",selected);
  return (   
    <ButtonGroup className="ms-2 mt-2 mb-2">
      <Dropdown>
        <Dropdown.Toggle
        style={{backgroundColor:'black',color:"white"}}
          variant=""
          aria-expanded="false"
          aria-haspopup="true"              
          // className="btn ripple btn-warning"
          className="common_dropdown"
          data-bs-toggle="dropdown"
          type="button"
        >
          {selected === "" ? "Dropdown Menu":selected}
        </Dropdown.Toggle>
        <Dropdown.Menu
          style={{ margin: "0px",top: "100%",left: "15px",marginTop: "0.125rem"}}
          className="dropdown-menu tx-13"
        >
          <Dropdown.Item className="dropdown-item" onClick={()=>handleSlectedValue("DineOrder Business")}>
            DineOrder Business
          </Dropdown.Item>
          <Dropdown.Item className="dropdown-item" onClick={()=>handleSlectedValue("DineOrder Business Analytics")}>
            DineOrder Business Analytics            
          </Dropdown.Item>
          <Dropdown.Item className="dropdown-item" onClick={()=>handleSlectedValue("External Business")}>
            External Business
          </Dropdown.Item>
          <Dropdown.Item className="dropdown-item" onClick={()=>handleSlectedValue("Jump Driver")}>
            Jump Driver
          </Dropdown.Item>
          <Dropdown.Item className="dropdown-item" onClick={()=>handleSlectedValue("Kuick Customers")}>
            Kuick Customers
          </Dropdown.Item>
          <Dropdown.Item className="dropdown-item" onClick={()=>handleSlectedValue("All Customers")}>
            All Customers
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </ButtonGroup>
  );
};

CommonDropDown.propTypes = {};

CommonDropDown.defaultProps = {};

export default CommonDropDown;

