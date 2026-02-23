import React, { useState } from "react";
import { CCol, CFormLabel, CFormFeedback, CFormInput } from "@coreui/react";
import { checkEmpty } from "../../../helpers/utility";

// Helper function to manage error states
const getErrorState = (type, value, regex, maxLength, minLength, required) => {
  if (checkEmpty(value) && required==false) {
    return { valid: false, message: "This field is required" };
  }

  if (regex && !regex.test(value)) {
    return { valid: false, message: "Pattern is invalid" };
  }

  if (maxLength && value.length > maxLength) {
    return {
      valid: false,
      message: `Maximum characters allowed are ${maxLength}`,
    };
  }

  if (minLength && value.length < minLength) {
    return {
      valid: false,
      message: `Minimum characters required are ${minLength}`,
    };
  }

  return { valid: true, message: "" };
};

const InputField = ({
  col,
  label,
  type,
  placeholder,
  name,
  val,
  required = false,
  maxLength,
  minLength,
  regex,
  disabled=false,
  // blankErrorMsg = "This field is required",
  // patternErrorMsg = "Pattern is invalid",
  // maxErrorMsg,
  // minErrorMsg,
  handleChange,
  show = false,
  className,
  clickSubmit
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [inputType, setInputType] = useState(type);
  const [errorState, setErrorState] = useState({ valid: true, message: "" });

  const handleInputChange = (e) => {
    setIsTouched(true);
    const value = e.target.value;

    const error = getErrorState(
      type,
      value,
      regex,
      maxLength,
      minLength,
      required
    );
    setErrorState(error);
    if(disabled==false)
    {
      handleChange(value, error.valid, name);

    }
  };

  const passwordToggle = () => {
    setInputType(inputType === "password" ? "text" : "password");
  };

  return (
    <>
     
      <CFormLabel className="main-content-label tx-11 tx-medium tx-gray-600" htmlFor={name}>{label}</CFormLabel>
      <CFormInput
        type={inputType}
        placeholder={placeholder}
        name={name}
        id={name}
        value={val}
        required={required}
        maxLength={maxLength}
        onChange={handleInputChange}
        autoComplete="off"
        disabled={disabled}
        className={`${className} ${isTouched && !errorState.valid ? "is-invalid" : ""} ${isTouched  && errorState.valid ? "is-valid" : "" }`}
        aria-invalid={!errorState.valid}
      />

      {type === "password" || show ? (
        <div className="pos-absolute top45 right45" onClick={passwordToggle}>
          <i
            className={`bi ${
              inputType === "password" ? "bi-eye-slash" : "bi-eye"
            }`}
          ></i>
        </div>
      ) : null}

      {!errorState.valid && clickSubmit==false && (
        <CFormFeedback invalid>{errorState.message}</CFormFeedback>
      )}
     
    </>
  );
};

export default InputField;


