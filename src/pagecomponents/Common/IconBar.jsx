const IconBar = ({ icons = [], activeIndex = 0, onChange }) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
            }}
        >
            {icons.map((icon, index) => {
                const isActive = index === activeIndex;

                return (
                    <div
                        key={index}
                        onClick={() => onChange?.(index)}
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            background: "#fff",
                            border: isActive
                                ? "1px solid #005FFF"
                                : "1px solid #e5e7eb",
                        }}
                    >
                        <i
                            className={`${icon.iconName} tx-14 ${isActive ? "text-primary" : "text-muted"
                                }`}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default IconBar;

