import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import addEditEventStyles from "./addEditEventStyles";

export default function EventFormActions({
    isSubEventMode,
    isEditMode,
    isSubmitting,
    editingSubEventId,
    onSkipSubEvent,
    onAddOrUpdateSubEvent,
    onSubmitSubEvents,
    onAddSubEvent,
    onCancel,
    onSubmitEvent,
}) {
    const { actionsStyles } = addEditEventStyles;

    return (
        <div
            className="d-flex justify-content-end gap-2 mb-2"
            style={actionsStyles}
        >
            {isSubEventMode ? (
                <>
                    <CustomButton
                        variant="secondary"
                        title="Skip Sub Event"
                        onClick={onSkipSubEvent}
                        disabled={isSubmitting}
                    />
                    <CustomButton
                        variant="secondary"
                        title={editingSubEventId ? "Update" : "Add"}
                        onClick={onAddOrUpdateSubEvent}
                        disabled={isSubmitting}
                    />
                    <CustomButton
                        title={isEditMode ? "Update" : "Submit"}
                        onClick={onSubmitSubEvents}
                        disabled={isSubmitting}
                    />
                </>
            ) : (
                <>
                    {!isEditMode && (
                        <CustomButton
                            variant="secondary"
                            title="Add Sub Event"
                            onClick={onAddSubEvent}
                            disabled={isSubmitting}
                        />
                    )}
                    <CustomButton
                        variant="secondary"
                        title="Cancel"
                        onClick={onCancel}
                    />
                    <CustomButton
                        title={isEditMode ? "Update" : "Submit"}
                        onClick={onSubmitEvent}
                        disabled={isSubmitting}
                    />
                </>
            )}
        </div>
    );
}
