import { fetchAuthUser } from "../redux/slices/AuthSlice";
import store from "../redux/store/store";

const extractPermissions = (payload) => {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.permissions)) return payload.permissions;
  if (Array.isArray(payload.data?.permissions)) return payload.data.permissions;
  return [];
};

export const fetchPermission = async () => {
  const action = await store.dispatch(fetchAuthUser());

  if (fetchAuthUser.fulfilled.match(action)) {
    const permissions = extractPermissions(action.payload);
    return permissions;
  }

  const error = action.payload || action.error || { msg: "Unable to fetch permissions" };
  throw error;
};

