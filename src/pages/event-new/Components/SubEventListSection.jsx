import addEditEventStyles from "./addEditEventStyles";

export default function SubEventListSection({
    subEvents,
    subEventInviteesText,
    onEditSubEvent,
    onRemoveSubEvent,
}) {
    const {
        subEventListStyles,
        subEventCardStyles,
        subEventDateBadgeStyles,
        subEventDateTimeStyles,
        subEventDateDayStyles,
        subEventDateMonthStyles,
        subEventMainStyles,
        subEventTitleStyles,
        subEventMetaStyles,
        subEventDescriptionStyles,
        subEventActionsStyles,
        subEventActionButtonStyles,
        subEventRemoveStyles,
    } = addEditEventStyles;

    if (!subEvents.length) return null;

    return (
        <div style={subEventListStyles}>
            {subEvents.map((item) => (
                <div key={item.uiId} style={subEventCardStyles}>
                    <div style={subEventDateBadgeStyles}>
                        <div style={subEventDateTimeStyles}>
                            {item.display.badgeTime || item.display.time || "--"}
                        </div>
                        <div style={subEventDateDayStyles}>
                            {item.display.day || "--"}
                        </div>
                        <div style={subEventDateMonthStyles}>
                            {item.display.month || "--"}
                        </div>
                    </div>

                    <div style={subEventMainStyles}>
                        <div style={subEventTitleStyles}>
                            {item.display.title || "Untitled Sub Event"}
                        </div>
                        <div style={subEventMetaStyles}>
                            <span>{item.display.location || "No location"}</span>
                            <span>|</span>
                            <span>{subEventInviteesText}</span>
                        </div>
                        <div style={subEventDescriptionStyles}>
                            {item.display.description || "No description added for this sub event."}
                        </div>
                    </div>

                    <div style={subEventActionsStyles}>
                        <button
                            type="button"
                            onClick={() => onEditSubEvent(item.uiId)}
                            style={subEventActionButtonStyles}
                            aria-label="Edit sub event"
                        >
                            <i className="bi bi-pencil" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onRemoveSubEvent(item.uiId)}
                            style={subEventRemoveStyles}
                            aria-label="Remove sub event"
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
