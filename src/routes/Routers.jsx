import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Loader from '../shade/Loaders/Loaders';
import AuthProtectedRoute from './AuthProtectedRoute';
import asitRouteConfig from './AsitRoutesConfig';
import { checkEmpty, getStorage } from '../helpers/utility';
import { LOGIN_PAGE } from '../helpers/constants';
const App = React.lazy(() => import('../shade/layouts/App'));
const Custompages = React.lazy(() => import('../shade/layouts/custompages'));

const Dashboard = React.lazy(() => import('../pages/dashboard/Index'));
const AuthLogin = React.lazy(() => import('../pages/auth/Login'));

const SignUp = React.lazy(() => import('../pages/Authentication/SignUp/SignUp'));
const SignIn = React.lazy(() => import('../pages/Authentication/SignIn/SignIn'));
const ForgotPassword = React.lazy(() => import('../pages/Authentication/ForgotPassword/ForgotPassword'));
const Lockscreen = React.lazy(() => import('../pages/Authentication/Lockscreen/Lockscreen'));
const ResetPassword = React.lazy(() => import('../pages/Authentication/ResetPassword/ResetPassword'));
const UnderConstruction = React.lazy(() => import('../pages/Authentication/UnderConstruction/UnderConstruction'));
const Error404 = React.lazy(() => import('../pages/Authentication/404Error/404Error'));
const Error500 = React.lazy(() => import('../pages/Authentication/500Error/500Error'));

const publicUrl = process.env.PUBLIC_URL || '';
const stripLeadingSlash = (value = '') => String(value || '').replace(/^\//, '');

const RootEntryRedirect = () => {
  const userId = getStorage('userid');
  const loginInfo = getStorage('login_info');
  const isLoggedIn = !checkEmpty(userId) && !checkEmpty(loginInfo);

  const targetPath = isLoggedIn ? `${publicUrl}/dashboard` : `${publicUrl}${LOGIN_PAGE}`;

  return <Navigate to={targetPath} replace />;
};

const RootLayout = () => <Outlet />;

const Routers = () => {
  const generateAsitRoutes = (developer) => {
    return asitRouteConfig[developer].map((route, index) => (
      <Route key={`${route.path}-${index}`} path={route.path} element={<route.component />} />
    ));
  };

  return (
    <BrowserRouter>
      <React.Suspense fallback={<Loader />}>
        <Routes>
          <Route path={`${publicUrl}/`} element={<RootLayout />}>
            <Route index element={<RootEntryRedirect />} />
            <Route path={stripLeadingSlash(LOGIN_PAGE)} element={<AuthLogin />} />

            <Route element={<AuthProtectedRoute />}>
              <Route element={<App />}>
                <Route index element={<Navigate to={`${publicUrl}/dashboard`} replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* {generatePabitraRoutes('router_pabitra')} */}
                {generateAsitRoutes('router_asit')}
              </Route>
            </Route>

            <Route path="pages/Authentication" element={<Custompages />}>
              <Route path="sigin" element={<SignIn />} />
              <Route path="sigup" element={<SignUp />} />
              <Route path="forgotpassword" element={<ForgotPassword />} />
              <Route path="resetpassword" element={<ResetPassword />} />
              <Route path="lockscreen" element={<Lockscreen />} />
              <Route path="underconstruction" element={<UnderConstruction />} />
              <Route path="404error" element={<Error404 />} />
              <Route path="500error" element={<Error500 />} />
            </Route>

            <Route path="*" element={<Navigate to={`${publicUrl}/pages/Authentication/404error`} replace />} />
          </Route>
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default Routers;

