import { Form } from "react-bootstrap";

const SearchBar = ({
    placeholder,
    value,
    onChange,
    wrapperStyle,
    inputStyle,
    iconStyle,
    inputClassName = "form-control rounded-pill",
    iconClassName = "si si-magnifier",
    ...inputProps
}) => {
    return (
        <div style={{ ...styles.searchWrapper, ...wrapperStyle }}>
            <Form.Control
                type="text"
                className={inputClassName}
                style={{ ...styles.searchInput, ...inputStyle }}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...inputProps}
            />
            <span className="input-group-text bg-white border-0">
                <i className={iconClassName} style={{ ...styles.searchIcon, ...iconStyle }}></i>
            </span>
        </div>
    );
};

export default SearchBar;

const styles = {
    searchWrapper: {
        position: "relative",
        width: "100%",
    },
    searchInput: {
        paddingRight: "42px",
        fontSize: "14px",
    },
    searchIcon: {
        position: "absolute",
        right: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#9ca3af",
        fontSize: "16px",
        pointerEvents: "none",
    },
};

