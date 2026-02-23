import React, { useEffect, useMemo, useState } from 'react';
import ModalWrapper from '../../pagecomponents/Common/ModalWrapper';
import CustomButton from '../../pagecomponents/Elements/Buttons/CustomButton';
import { normalizeText } from '../../helpers/utility';

const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const raw = String(value).trim();
  if (!raw) return null;

  const hasTimezone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw);
  if (hasTimezone) {
    const dateWithZone = new Date(raw);
    return Number.isNaN(dateWithZone.getTime()) ? null : dateWithZone;
  }

  const normalized = raw.replace(' ', 'T');
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    const fallbackDate = new Date(raw);
    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
  const utcDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)),
  );

  return Number.isNaN(utcDate.getTime()) ? null : utcDate;
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = parseDateValue(value);
  if (!date) return String(value);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getAddressText = (address = {}) => {
  const street = [
    normalizeText(address.address_line1),
    normalizeText(address.address_line2),
    normalizeText(address.address_line3),
  ]
    .filter(Boolean)
    .join(', ');

  const city = normalizeText(address.city);
  const pinCode = normalizeText(address.pin_code);
  const cityPin = [city, pinCode].filter(Boolean).join(' - ');
  const output = [street, cityPin].filter(Boolean).join(', ');

  return output || '-';
};

const getMemberName = (member = {}) => {
  console.log("Member object:", member);
  
  const contact = member?.contact || {};

  const salutation = normalizeText(contact?.contact_Salutation);

  const fullName =
    (normalizeText(contact?.contact_Full_Name) ||
    [ 
      normalizeText(contact?.contact_Primary_Full_Name),
      normalizeText(contact?.contact_Last_Name),
    ]
      .filter(Boolean)
      .join(" ")) ?? "-";
  
  const nameWithSalutation = [salutation, fullName]
    .filter(Boolean)
    .join(" ") ?? "-";

  return nameWithSalutation || `Contact #${member?.contact_Id || "-"}`;
};

const getMemberContactId = (member = {}) => {
  const contactId = Number(member?.contact_Id || member?.contact?.contact_Contact_Id || 0);
  return Number.isFinite(contactId) && contactId > 0 ? contactId : 0;
};

const FamilyGroupViewDetails = ({ familyGroup, onRemoveMember, removingContactIds = [] }) => {
  
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [pendingMember, setPendingMember] = useState(null);

  const safeFamilyGroup = familyGroup || {};
  const addresses = Array.isArray(safeFamilyGroup.familyAddress) ? safeFamilyGroup.familyAddress : [];
  const primaryAddress = addresses[0] || null;
  const members = Array.isArray(safeFamilyGroup.members) ? safeFamilyGroup.members : [];
  const headMembers = Array.isArray(safeFamilyGroup.headmembers) ? safeFamilyGroup.headmembers : [];
  const removingSet = new Set(
    Array.isArray(removingContactIds)
      ? removingContactIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
      : [],
  );
  const pendingMemberId = useMemo(() => getMemberContactId(pendingMember), [pendingMember]);
  const isPendingRemoving = pendingMemberId ? removingSet.has(pendingMemberId) : false;
  const pendingMemberName = pendingMember ? getMemberName(pendingMember) : '';

  useEffect(() => {
    if (removeModalVisible) {
      document.body.classList.add('family-group-remove-modal-open');
    } else {
      document.body.classList.remove('family-group-remove-modal-open');
    }

    return () => {
      document.body.classList.remove('family-group-remove-modal-open');
    };
  }, [removeModalVisible]);

  const openRemoveModal = (member) => {
    setPendingMember(member);
    setRemoveModalVisible(true);
  };

  const closeRemoveModal = () => {
    setRemoveModalVisible(false);
    setPendingMember(null);
  };

  const handleConfirmRemove = () => {
    if (typeof onRemoveMember !== 'function' || !pendingMember) return;
    onRemoveMember(pendingMember);
    closeRemoveModal();
  };

  if (!familyGroup) {
    return <div className="family-group-view-empty">No family group details found.</div>;
  }

  return (
    <>
      <div className="family-group-view-container">
        <div className="family-group-view-summary">
          <div className="family-group-view-field">
            <span className="family-group-view-label">Family Group Name</span>
            <span className="family-group-view-value">{safeFamilyGroup.family_group_Name || '-'}</span>
          </div>
          <div className="family-group-view-field">
            <span className="family-group-view-label">Members Count</span>
            <span className="family-group-view-value">
              {safeFamilyGroup.family_group_Members_Count ?? members.length}
            </span>
          </div>
        </div>

        <div className="family-group-view-section">
          <h6>Family Address</h6>
          {!primaryAddress ? (
            <div className="family-group-view-empty">No address found.</div>
          ) : (
            <div className="family-group-view-address-item">
              <span>{getAddressText(primaryAddress)}</span>
              <span className="family-group-view-badge">Default</span>
            </div>
          )}
        </div>

        <div className="family-group-view-section">
          <h6>Head Members</h6>
          {headMembers.length === 0 ? (
            <div className="family-group-view-empty">No head members found.</div>
          ) : (
            <div className="family-group-view-member-list">
              {headMembers.map((member) => (
                <div
                  key={member.family_group_member_Id || `${member.contact_Id}-head`}
                  className="family-group-view-member-item"
                >
                  <span className="family-group-view-member-name">{getMemberName(member)}</span>
                  <div className="family-group-view-member-tags">
                    {member.isDuplicate === true && (
                      <span className="family-group-view-chip family-group-view-chip-danger">Duplicate</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="family-group-view-section">
          <h6>All Members</h6>
          {members.length === 0 ? (
            <div className="family-group-view-empty">No members found.</div>
          ) : (
            <div className="family-group-view-member-list">
              {members.map((member) => {
                const memberContactId = getMemberContactId(member);
                const isRemoving = removingSet.has(memberContactId);

                return (
                  <div
                    key={member.family_group_member_Id || `${member.contact_Id}-member`}
                    className="family-group-view-member-item"
                  >
                    <span className="family-group-view-member-name">{getMemberName(member)}</span>
                    <div className="family-group-view-member-tags">
                      {member.isDuplicate === true && (
                        <span className="family-group-view-chip family-group-view-chip-danger">Duplicate</span>
                      )}
                      {typeof onRemoveMember === 'function' && (
                        <button
                          type="button"
                          className="family-group-view-remove-btn"
                          onClick={() => openRemoveModal(member)}
                          disabled={!memberContactId || isRemoving}
                        >
                          {isRemoving ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ModalWrapper
        visible={removeModalVisible}
        onClose={closeRemoveModal}
        modalTitle="Remove Family Member"
        dialogClassName="family-group-remove-modal"
      >
        <div className="family-group-remove-content">
          <p className="family-group-remove-text">
            {pendingMemberName
              ? `Do you want to remove "${pendingMemberName}" from this family group?`
              : 'Do you want to remove this member from the family group?'}
          </p>
          <div className="family-group-remove-actions">
            <CustomButton
              title="Cancel"
              variant="secondary"
              onClick={closeRemoveModal}
              className="family-group-remove-btn"
              disabled={isPendingRemoving}
            />
            <CustomButton
              title={isPendingRemoving ? 'Removing...' : 'Remove'}
              variant="danger"
              onClick={handleConfirmRemove}
              className="family-group-remove-btn"
              disabled={isPendingRemoving}
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default FamilyGroupViewDetails;
