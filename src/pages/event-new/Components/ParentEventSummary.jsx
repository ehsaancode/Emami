import addEditEventStyles from "./addEditEventStyles";

export default function ParentEventSummary({
    parentEvent,
}) {
    const {
        parentStyles,
        parentTitleStyles,
        parentMetaStyles,
        dotStyles,
    } = addEditEventStyles;

    const inviteesText = Array.isArray(parentEvent?.invitees)
        ? `${parentEvent.invitees.length} invitee${parentEvent.invitees.length === 1 ? "" : "s"}`
        : parentEvent?.invitees || "";

    return (
        <div style={parentStyles}>
            <div style={parentTitleStyles}>
                {parentEvent?.title || "Parent Event"}
            </div>
            <div style={parentMetaStyles}>
                <span>{parentEvent?.date || ""}</span>
                <span style={dotStyles} />
                <span>{parentEvent?.time || ""}</span>
                <span style={dotStyles} />
                <span>{parentEvent?.location || ""}</span>
                <span style={dotStyles} />
                <span>{inviteesText}</span>
            </div>
        </div>
    );
}
