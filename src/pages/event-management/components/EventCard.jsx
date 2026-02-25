import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiChevronRight } from 'react-icons/fi';
import CustomButton from '../../../pagecomponents/Elements/Buttons/CustomButton';
import { deleteData, sendForApproval } from '../../../redux/slices/EventSlice';
import { toastMessage } from '../../../helpers/utility';
import DeleteEventModal from './DeleteEventModal';

const EventCard = ({
  event_Is_Sent_For_Approval = 0,
  layout = 'grid',
  title = 'Annual Gala 2024',
  date = 'March 15, 2024',
  time = '12:00 PM - 2:00 PM',
  location = 'Grand Hall, New York',
  invitees = '4 invitees (3 families)',
  subEvents = ['Grand Inauguration', 'Grand Inauguration'],
  eventId,
  eventRaw,
  onEdit,
  onDelete,
  onViewAll,
  onReview,
  onDeleted,
  requestViewAll,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendingApproval, setIsSendingApproval] = useState(false);
  const [isSentForApproval, setIsSentForApproval] = useState(Boolean(event_Is_Sent_For_Approval));
  const isListView = layout === 'list';
  const normalizedSubEvents = Array.isArray(subEvents) ? subEvents : [];
  const subEventTitles = normalizedSubEvents
    .map((item) => (typeof item === 'string' ? item : (item?.title ?? item?.event_name ?? item?.name)))
    .map((title) => title?.trim?.() ?? title)
    .filter(Boolean);
  const visibleSubEvents = isListView ? subEventTitles : subEventTitles.slice(0, 2);
  // const inviteesText = Array.isArray(invitees)
  //     ? `${invitees.length} invitee${invitees.length === 1 ? "" : "s"}`
  //     : invitees;
  // const hasInvitees = Boolean(
  //     Array.isArray(invitees) ? invitees.length : inviteesText
  // );

  const inviteeCount = invitees?.length || 0;

  const inviteesText = inviteeCount ? `${inviteeCount} invitee${inviteeCount === 1 ? '' : 's'}` : 'No invitees';

  const hasInvitees = inviteeCount > 0;

  useEffect(() => {
    setIsSentForApproval(Boolean(event_Is_Sent_For_Approval));
  }, [event_Is_Sent_For_Approval]);

  const handleSendForApproval = async () => {
    const rawId = eventRaw?.event_Id ?? eventId;
    if (!rawId) {
      toastMessage('error', 'Event id is missing.');
      return;
    }

    setIsSendingApproval(true);
    try {
      const { payload } = await dispatch(sendForApproval({ inputData: { eventId: rawId } }));

      if (payload?.status !== 'success') {
        toastMessage('error', payload?.msg || payload?.message || 'Failed to send for approval.');
        return;
      }

      setIsSentForApproval(true);
      toastMessage('success', payload?.msg || payload?.message || 'Event sent for approval.');
      if (requestViewAll) {
        try {
          Promise.resolve(requestViewAll()).catch(() => {
            // Keep UI feedback focused on the approval action.
          });
        } catch (error) {
          // Keep UI feedback focused on the approval action.
        }
      }
    } catch (error) {
      toastMessage('error', error?.response?.data?.msg || error?.message || 'Failed to send for approval.');
    } finally {
      setIsSendingApproval(false);
    }
  };

  const styles = {
    card: {
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 10px rgba(16,24,40,0.06)',
    },

    body: { padding: '16px 16px' },

    title: {
      fontSize: 16,
      lineHeight: 1.25,
      fontWeight: 700,
      color: '#2f343a',
      margin: 0,
    },

    actionsWrap: { gap: 6 },

    circleBtn: {
      width: 28,
      height: 28,
      borderRadius: 999,
      border: '1px solid #e8eaee',
      background: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      color: '#1f2937',
      fontSize: 12,
    },

    viewAllBtn: {
      height: 28,
      borderRadius: 999,
      border: '1px solid #e8eaee',
      background: '#fff',
      padding: '0 10px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontWeight: 600,
      color: '#2f343a',
      fontSize: 12,
    },

    metaRow: { marginTop: isListView ? 10 : 12, rowGap: 10 },
    metaItem: { gap: 8 },

    metaIcon: {
      width: 30,
      height: 30,
      borderRadius: 999,
      border: '1.5px solid #0d6efd',
      background: '#f3f7ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      color: '#0d6efd',
      flex: '0 0 auto',
    },

    metaText: {
      fontSize: 11,
      fontWeight: 600,
      color: '#7a828c',
    },

    divider: {
      height: 1,
      background: '#eef1f5',
      margin: '12px 0 10px',
    },

    divider2: {
      height: 1,
      background: '#eef1f5',
      margin: '10px 0',
    },

    sectionTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: '#2f343a',
      marginBottom: 2,
    },

    details: {
      fontSize: 11,
      fontWeight: 600,
      color: '#0d6efd',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    },

    subEventsLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: '#0d6efd',
      marginBottom: 6,
      cursor: 'pointer',
    },

    subEventItem: {
      fontSize: 12,
      fontWeight: 600,
      color: '#2f343a',
      padding: '6px 0',
    },

    subEventDivider: {
      height: 1,
      background: '#eef1f5',
    },
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
      return;
    }

    navigate('/event-management/new-event', {
      state: {
        mode: 'edit',
        eventRaw,
      },
    });
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    const rawId = eventRaw?.event_Id ?? eventId;
    if (!rawId) {
      toastMessage('error', 'Event id is missing.');
      return;
    }

    setIsDeleting(true);
    try {
      const { payload } = await dispatch(deleteData({ inputData: { event_Id: rawId } }));
      if (payload?.status !== 'success') {
        toastMessage('error', payload?.msg || payload?.message || 'Failed to delete event.');
        return;
      }
      toastMessage('success', payload?.msg || payload?.message || 'Event deleted.');
      setIsDeleteModalOpen(false);
      onDeleted?.();
    } catch (error) {
      toastMessage('error', error?.response?.data?.msg || error?.message || 'Failed to delete event.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="card border-0" style={styles.card}>
        <div className="card-body" style={styles.body}>
          {/* Header */}
          <div className="d-flex align-items-start justify-content-between">
            <h2 style={styles.title}>{title}</h2>

            <div className="d-flex align-items-center" style={styles.actionsWrap}>
              <button className="btn" style={styles.circleBtn} onClick={handleEditClick}>
                <FiEdit2 />
              </button>

              <button
                className="btn"
                style={{ ...styles.circleBtn, color: '#ff2b2b' }}
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <FiTrash2 />
              </button>

              <CustomButton
                onClick={handleSendForApproval}
                variant="secondary"
                loading={isSendingApproval}
                disabled={isSendingApproval || isSentForApproval}
              >
                {isSentForApproval ? 'Sent for approval' : 'Send For approval'}
              </CustomButton>

              {onReview && <CustomButton onClick={onReview}>Review</CustomButton>}
            </div>
          </div>

          {/* Meta */}
          <div className="row" style={styles.metaRow}>
            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center" style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <i className="bi bi-calendar3" />
                </div>
                <div style={styles.metaText}>{date}</div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center" style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <i className="bi bi-clock" />
                </div>
                <div style={styles.metaText}>{time}</div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center" style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <i className="bi bi-geo-alt" />
                </div>
                <div style={styles.metaText}>{location}</div>
              </div>
            </div>

            {hasInvitees && (
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center" style={styles.metaItem}>
                  <div style={styles.metaIcon}>
                    <i className="bi bi-person" />
                  </div>
                  <div style={styles.metaText}>{inviteesText}</div>
                </div>
              </div>
            )}
          </div>

          {visibleSubEvents.length > 0 && (
            <div style={{ marginTop: 25 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={styles.subEventsLabel}>Sub Events</div>
                <div style={styles.subEventsLabel} onClick={onViewAll}>{`View All >`}</div>
              </div>

              <div>
                {visibleSubEvents.map((item, index) => (
                  <div key={`${item}-${index}`}>
                    {index > 0 && <div style={isListView ? styles.subEventDivider : styles.divider2} />}
                    <div style={isListView ? styles.subEventItem : styles.sectionTitle}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <DeleteEventModal
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={title}
      />
    </>
  );
};

export default EventCard;
