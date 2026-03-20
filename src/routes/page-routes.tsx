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
import Settings from '../pages/Settings/settings';

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
                    <Route path="/settings" element={<Settings />} />

                </Route>
            </Routes>
        </Router>
    )
}
export default PageRoutes;
