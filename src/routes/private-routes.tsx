import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from '../layouts/layout';
import { useCommonData } from '../services/context/useContext';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  redirectPath: string;
  documentationNav: string;
  setActiveTitleMyaccount: (val: string) => void;
  setDocumentationNav: (val: string) => void;
}

const PrivateRoutes: React.FC<PrivateRouteProps> = ({
  redirectPath,
  setDocumentationNav,
  isAuthenticated,
  setActiveTitleMyaccount,
  documentationNav
}) => {
  const location = useLocation();
  const { currentLoggedUserData } = useCommonData();
  const isAdmin = currentLoggedUserData?.isAdmin === true;
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  // Non-admin user trying to access /users
  if (location.pathname === "/users" && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return isAuthenticated ?
    <Layout
      setActiveTitleMyaccount={setActiveTitleMyaccount}
      documentationNav={documentationNav}
      setDocumentationNav={setDocumentationNav}
    >
      <Outlet />
    </Layout>
    :
    <Navigate to={redirectPath} replace />;
};

export default PrivateRoutes;