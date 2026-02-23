import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { checkEmpty, getStorage } from '../helpers/utility';
import { LOGIN_PAGE } from '../helpers/constants';

const AuthProtectedRoute = () => {
  const location = useLocation();
  const userid = getStorage('userid');
  const login_info = getStorage('login_info');
  const isLoggedIn = !checkEmpty(userid) && !checkEmpty(login_info);
  const publicUrl = process.env.PUBLIC_URL || '';

  if (!isLoggedIn) {
    return <Navigate to={`${publicUrl}${LOGIN_PAGE}`} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthProtectedRoute;
