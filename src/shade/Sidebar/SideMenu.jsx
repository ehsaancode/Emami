import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { postReq } from '../../helpers/api';
import { baseApiUrl } from '../../helpers/constants';

const renderIcon = (IconComponent) => <IconComponent className="side-menu__icon" style={{ fontSize: '18px' }} />;
const SIDEBAR_MENU_ENDPOINTS = ['/permission/side-menu', '/permission//side-menu'];

export const getSidebarIcon = (name) => {
  const iconMap = {
    dashboard: DashboardOutlinedIcon,
    family: GroupsOutlinedIcon,
    contacts: PersonAddAltOutlinedIcon,
    import: FileUploadOutlinedIcon,
    events: EventOutlinedIcon,
    eventApproval: FactCheckOutlinedIcon,
    printApproval: LocalPrintshopOutlinedIcon,
    reports: AssessmentOutlinedIcon,
    userManagement: ManageAccountsOutlinedIcon,
  };

  return renderIcon(iconMap[name] || DashboardOutlinedIcon);
};

const DEFAULT_MENUITEMS = [
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/dashboard',
        iconName: 'dashboard',
        type: 'link',
        selected: false,
        active: false,
        title: 'Dashboard',
      },
    ],
  },
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/family-group',
        iconName: 'family',
        type: 'link',
        selected: false,
        active: false,
        title: 'Family Group',
      },
    ],
  },
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/contacts',
        iconName: 'contacts',
        type: 'link',
        selected: false,
        active: false,
        title: 'Contacts',
      },
    ],
  },
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/import-contacts',
        iconName: 'import',
        type: 'link',
        selected: false,
        active: false,
        title: 'Import',
      },
    ],
  },
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/event-management',
        iconName: 'events',
        type: 'link',
        selected: false,
        active: false,
        title: 'Events',
      },
    ],
  },
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/event-approvals',
        iconName: 'eventApproval',
        badge: 'nav-badge sidebar-count-badge',
        badgetxt: '03',
        type: 'link',
        selected: false,
        active: false,
        title: 'Event Approvals',
      },
    ],
  },
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/print-approvals',
        iconName: 'printApproval',
        badge: 'nav-badge sidebar-count-badge',
        badgetxt: '03',
        type: 'link',
        selected: false,
        active: false,
        title: 'Print Approvals',
      },
    ],
  },
  {
    // menutitle: "Outlet Details",
    Items: [
      {
        path: '/reports',
        iconName: 'reports',
        type: 'link',
        selected: false,
        active: false,
        title: 'Reports',
      },
    ],
  },

  {
    Items: [
      {
        title: 'User Management',
        iconName: 'userManagement',
        type: 'sub',
        selected: false,
        active: false,
        children: [
          {
            path: '/user',
            type: 'link',
            selected: false,
            active: false,
            title: 'User',
          },
          {
            path: '/user/role',
            type: 'link',
            selected: false,
            active: false,
            title: 'Role',
          },
        ],
      },
    ],
  },
];

const cloneMenu = (menu) => JSON.parse(JSON.stringify(menu || []));

const normalizeMenuItem = (item = {}) => {
  const normalizedChildren = Array.isArray(item.children)
    ? item.children.map(normalizeMenuItem).filter(Boolean)
    : [];

  const normalizedType = item.type || (normalizedChildren.length ? 'sub' : 'link');

  return {
    ...item,
    type: normalizedType,
    selected: false,
    active: false,
    ...(normalizedChildren.length ? { children: normalizedChildren } : {}),
  };
};

const normalizeMenuResponse = (menuData = []) => {
  if (!Array.isArray(menuData)) return [];

  return menuData
    .map((section) => {
      const items = Array.isArray(section?.Items)
        ? section.Items.map(normalizeMenuItem).filter(Boolean)
        : [];

      if (!items.length) return null;

      return {
        ...section,
        Items: items,
      };
    })
    .filter(Boolean);
};

let memoizedSidebarMenu = cloneMenu(DEFAULT_MENUITEMS);
let memoizedSidebarMenuKey = JSON.stringify(memoizedSidebarMenu);

export const getMenuItems = () => cloneMenu(DEFAULT_MENUITEMS);
export const getMemoizedSidebarMenu = () => cloneMenu(memoizedSidebarMenu);

export const memoizeSidebarMenu = (menuData = []) => {
  const normalizedMenu = normalizeMenuResponse(menuData);
  const nextMenu = normalizedMenu.length ? normalizedMenu : getMenuItems();
  const nextKey = JSON.stringify(nextMenu);

  if (nextKey === memoizedSidebarMenuKey) {
    return { changed: false, menu: getMemoizedSidebarMenu() };
  }

  memoizedSidebarMenu = cloneMenu(nextMenu);
  memoizedSidebarMenuKey = nextKey;
  return { changed: true, menu: getMemoizedSidebarMenu() };
};

export const fetchSidebarMenu = async () => {
  let lastError = null;

  for (const endpoint of SIDEBAR_MENU_ENDPOINTS) {
    try {
      const response = await postReq(`${baseApiUrl}${endpoint}`, { inputData: {} });
      const normalizedMenu = normalizeMenuResponse(response?.data);
      if (normalizedMenu.length) {
        return normalizedMenu;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return getMenuItems();
};

