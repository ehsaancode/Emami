import React, { useState } from "react";
import { CForm} from "@coreui/react";

const FormWrapper = ({onSubmit, children}) => {
    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            onSubmit();
        }
        setValidated(true);
    };

    return(
        <CForm className="g-3 needs-validation" noValidate validated={validated} onSubmit={handleSubmit}>
            {children}
        </CForm>
    );
};

export default FormWrapper;
