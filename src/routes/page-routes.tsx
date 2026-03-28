import { useState } from 'react';
import useAuth from '../services/hooks/useauth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoutes from './private-routes';
import UsersLoginMain from '../pages/login-main/user-login-main';
import Dashboard from '../pages/dashboard/dashboard'
import Assets from '../pages/Assets/assets'
import AssetLocations from '../pages/asset-locations/asset-locations'
import Users from '../pages/user-management/user-management'
import AssetMapping from '../pages/asset-mapping/asset-mapping';
import IpMapping from '../pages/ip-mapping/ip-mapping';
import CredentialManager from '../pages/credential-manager/credential-manager';
import EbTrackerPage from '../pages/eb-tracker/eb-tracker';

function PageRoutes() {
    const { auth } = useAuth()
    const [, setActiveTitleMyaccount] = useState<string>("signinOptions")
    const [documentationNav, setDocumentationNav] = useState<any>("")

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<UsersLoginMain />} />
                <Route path="/" element={<UsersLoginMain />} />
                <Route element={
                    <PrivateRoutes
                        isAuthenticated={auth.token ? true : false}
                        redirectPath={"/"}
                        setActiveTitleMyaccount={(val: string) => { setActiveTitleMyaccount(val) }}
                        setDocumentationNav={(val: string) => { setDocumentationNav(val) }}
                        documentationNav={documentationNav}
                    />} >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/asset-locations" element={<AssetLocations />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/asset-mapping" element={<AssetMapping />} />
                    <Route path="/ip-mapping" element={<IpMapping />} />
                    <Route path="/credential-manager" element={<CredentialManager />} />
                    <Route path="/eb-tracker" element={<EbTrackerPage />} />

                </Route>
            </Routes>
        </Router>
    )
}
export default PageRoutes;
