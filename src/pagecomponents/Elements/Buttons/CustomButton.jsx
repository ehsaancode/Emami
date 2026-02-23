import { Button, Spinner } from "react-bootstrap";

const CustomButton = ({
  className = "",
  variant = "primary",
  title,
  type = "button",
  onClick,
  disabled = false,
  style = {},
  children,
  loading = false,
  loadingText = "Loading...",
  showSpinner = false,
}) => {
  return (
    <>
      <style>
        {`
          .btn-pill-blue {
            border-radius: 999px !important;
            padding: 6px 22px !important;   /* smaller height & width */
            border: none !important;

            background: linear-gradient(
              180deg,
              #3b82ff 0%,
              #2563eb 100%
            ) !important;

            box-shadow:
              0 5px 12px rgba(37, 99, 235, 0.32),
              inset 0 -2px 0 rgba(0, 0, 0, 0.15);

            color: #fff !important;
            font-weight: 600;
            font-size: 13px;                /* slightly smaller text */
          }

          .btn-pill-blue:hover:not(:disabled) {
            filter: brightness(1.05);
          }

          .btn-pill-blue:active:not(:disabled) {
            filter: brightness(0.95);
          }

          .btn-pill-outline {
            border-radius: 999px !important;
            padding: 6px 22px !important;
            border: 1px solid #e5e7eb !important;
            background: #fff !important;
            color: #4b5563 !important;
            font-weight: 600;
            font-size: 13px;
            box-shadow: none !important;
          }

         .btn-pill-outline:hover:not(:disabled) {
            background: #f8fafc !important;
            color: #4b5563 !important;   /* prevent white text */
            border: 1px solid #e5e7eb !important;
          }

          .btn-pill-danger {
            border-radius: 999px !important;
            padding: 6px 22px !important;
            border: none !important;
            background: linear-gradient(180deg, #ff4d4f 0%, #e11d48 100%) !important;
            color: #fff !important;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 6px 12px rgba(225, 29, 72, 0.28);
          }

          .btn-pill-danger:hover:not(:disabled) {
            filter: brightness(1.05);
          }

          .btn-pill-danger:active:not(:disabled) {
            filter: brightness(0.95);
          }

          /* FIX DISABLED OUTLINE BUTTON */
.btn-pill-outline:disabled,
.btn-pill-outline.disabled {
  background: #f3f4f6 !important;     /* soft gray bg */
  border: 1px solid #e5e7eb !important;
  color: #9ca3af !important;          /* medium gray text */
  opacity: 1 !important;              /* remove bootstrap fade */
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05) !important;
  cursor: not-allowed !important;
}

/* Optional: disabled blue button also look premium */
.btn-pill-blue:disabled {
  background: linear-gradient(
    180deg,
    #93c5fd 0%,
    #60a5fa 100%
  ) !important;
  box-shadow: none !important;
  opacity: 1 !important;
}
        `}
      </style>

      {(() => {
        const variantClass =
          variant === "secondary"
            ? "btn-pill-outline"
            : variant === "danger"
              ? "btn-pill-danger"
              : "btn-pill-blue";
        return (
          <Button
            type={type}
            className={`${variantClass} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            style={style}
          >
            {loading ? (
              <>
                {showSpinner && (
                  <Spinner animation="border" size="sm" className="me-2" />
                )}
                {loadingText}
              </>
            ) : (
              children ?? title
            )}
          </Button>
        );
      })()}
    </>
  );
};

export default CustomButton;

