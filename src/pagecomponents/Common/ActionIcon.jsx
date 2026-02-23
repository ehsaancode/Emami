import { OverlayTrigger, Tooltip } from "react-bootstrap";

const ActionIcon = ({ tooltip, onClick, color, children }) => {
  return (
    <>
      <style>
        {`
          .btn-link:hover {
            opacity: 0.8;
            transform: scale(1.05);
          }
        `}
      </style>
      <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
        <button
          type="button"
          onClick={onClick}
          className="btn btn-link p-0 me-2"
          style={{ color }}
        >
          {children}
        </button>
      </OverlayTrigger>
    </>
  );
};

export default ActionIcon;
