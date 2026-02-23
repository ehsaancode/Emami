import FamilyGroup from '../pages/family-group/Index';
import Contacts from '../pages/contacts/Index';
import ImportContacts from '../pages/imports/Index';
import ImportList from '../pages/imports/List';
import EventManagement from '../pages/event-management/Index';
import EventApprovals from '../pages/event-approvals/Index';
import PrintApprovals from '../pages/print-approvals/Index';
import UserRole from '../pages/user-management/role/Index';
import User from '../pages/user-management/user/Index';
import CreateNewEvents from '../pages/event-management/nestedPages/createNewEvents/CreateNewEvents';
import CreateNewSubEvents from '../pages/event-management/nestedPages/createNewSubEvents/CreateNewSubEvents';
import Report from '../pages/reports/Index';
import Event from '../pages/event-new/Event';

const AsitRoutesConfig = {
  router_asit: [
    {
      path: 'family-group',
      component: FamilyGroup,
    },
    {
      path: 'contacts',
      component: Contacts,
    },
    {
      path: 'import-contacts',
      component: ImportContacts,
    },
    {
      path: 'import/list',
      component: ImportList,
    },
    {
      path: 'event-management',
      component: Event,
    },
    {
      path: 'event-management/new-event',
      component: CreateNewEvents,
    },
    {
      path: 'event-management/new-sub-event',
      component: CreateNewSubEvents,
    },
    {
      path: 'event-approvals',
      component: EventApprovals,
    },
    {
      path: 'print-approvals',
      component: PrintApprovals,
    },
    {
      path: 'reports',
      component: Report,
    },
    {
      path: 'user/role',
      component: UserRole,
    },
    {
      path: 'user',
      component: User,
    },
  ],
};

export default AsitRoutesConfig;

