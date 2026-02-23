import { CFormLabel } from "@coreui/react";
import { Form } from "react-bootstrap";

const CurrencyDropdown = ({value = "QAR", onChange}) => {
    const currencies = ["QAR", "USD", "EUR", "GBP", "INR"];

  return (
    <>
        <CFormLabel className="main-content-label tx-11 tx-medium tx-gray-600" htmlFor="service_Type">Select Currency</CFormLabel>
        <Form.Select
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="form-control"
        >
            {currencies.map((currency) => (
                <option key={currency} value={currency}>
                {currency}
                </option>
            ))}
        </Form.Select>
    </>
  );
}

export default CurrencyDropdown
