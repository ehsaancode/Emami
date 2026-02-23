const IconBox = ({
    iconName,
    onClick
}) => {
    return(
        <>
            <div style={styles.iconBox } onClick={onClick}>
                <i className={` ${iconName}`}></i>
            </div>
        </>
    );
};

export default IconBox;

const styles = {
    iconBox: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: "#fff",
        borderRadius: "50%",
        border: "1px solid #9da3af",
        marginRight: "5px",
    },
};
