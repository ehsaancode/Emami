
import { useMemo } from "react";
import { useSelector } from "react-redux";

const normalize = (value) => String(value || "").toLowerCase().trim();
const toBoolean = (value) => value === true || value === 1 || value === "1";

const selectPermissions = (state) => state?.authSlice?.permissions || [];

const resolvePermissions = (permissions, keys = [], options = {}) => {
  const mode = options.mode || "any";
  const defaultAllow = options.defaultAllow ?? false;
  const list = Array.isArray(keys) ? keys : [];
  const permissionList = Array.isArray(permissions) ? permissions : [];
  const normalizedList = list.map((key) => (key ? String(key).trim() : "")).filter(Boolean);

  if (!normalizedList.length) return defaultAllow;

  const wildcard = permissionList.find(
    (permission) => normalize(permission?.key) === "*"
  );
  const wildcardValue = wildcard ? toBoolean(wildcard.value) : false;

  const results = normalizedList.map((key) => {
    const normalizedKey = normalize(key);
    const exactMatch = permissionList.find(
      (permission) => normalize(permission?.key) === normalizedKey
    );

    if (exactMatch) return toBoolean(exactMatch.value);
    return wildcardValue;
  });

  return mode === "all" ? results.every(Boolean) : results.some(Boolean);
};

// Short documentation:
// - usePermissions(): returns the raw permissions array from Redux (state.authSlice.permissions).
// - usePermission(keys, options): returns boolean for an array of keys.
//   options.mode = "any" (default) or "all"; options.defaultAllow = false (default).
// - PermissionGate: wraps children; shows them only when allowed.
// - withPermission(Component, keys, options): HOC that renders Component only when allowed.

export const usePermissions = () => {
  return useSelector(selectPermissions);
};

export const usePermission = (permissionKeys = [], options = {}) => {
  const permissions = usePermissions();

  return useMemo(
    () => resolvePermissions(permissions, permissionKeys, options),
    [permissions, permissionKeys, options?.mode, options?.defaultAllow]
  );
};

export const PermissionGate = ({
  permissions = [],
  mode = "any",
  defaultAllow = false,
  fallback = null,
  children,
}) => {
  const allowed = usePermission(permissions, { mode, defaultAllow });
  if (!allowed) return fallback;
  return <>{children}</>;
};

export const withPermission = (WrappedComponent, permissionKeys, options = {}) => {
  const PermissionWrapper = (props) => {
    const allowed = usePermission(permissionKeys, options);
    if (!allowed) return null;
    return <WrappedComponent {...props} />;
  };

  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || "Component";
  PermissionWrapper.displayName = `withPermission(${wrappedName})`;

  return PermissionWrapper;
};

// Example usage:
// import { usePermission, PermissionGate, withPermission } from "../helpers/useSectionPermissions";
//
// Hook:
// const canCreateUser = usePermission(["user.create"]);
// return canCreateUser ? <Button>Create User</Button> : null;
//
// Hook (multiple permissions):
// const canManageUser = usePermission(["user.create", "user.update"], { mode: "any" });
// return canManageUser ? <Button>Manage User</Button> : null;
//
// Gate:
// <PermissionGate permissions={["user.create"]}>
//   <Button>Create User</Button>
// </PermissionGate>
//
// Gate (multiple permissions):
// <PermissionGate permissions={["user.create", "user.update"]} mode="any">
//   <Button>Create User</Button>
// </PermissionGate>
//
// HOC:
// const CreateUserButton = () => <Button>Create User</Button>;
// export default withPermission(CreateUserButton, ["user.create"]);
//
// HOC (multiple permissions):
// const ManageUserButton = () => <Button>Manage User</Button>;
// export default withPermission(ManageUserButton, ["user.create", "user.update"], { mode: "any" });



