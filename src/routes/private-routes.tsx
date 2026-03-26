import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from '../layouts/layout';

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
  useLocation();
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
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
