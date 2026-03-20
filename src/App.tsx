import store from './redux/store';
import './styles/app.scss';
import { Provider } from 'react-redux';
import PageRoutes from './routes/page-routes';
import { createContext, useState, useEffect } from "react";
import { CommonData } from "./services/context/useContext";
import { getCookie } from "./services/utils/cookie-utils";
import NoInternetOverlay from './noInternetOverLay';

function App() {
  const [currentLoggedUserData, setCurrentLoggedUserData] = useState({
    email: "",
    userRole: getCookie("userRole") || "",
    userId: getCookie("userID") || "",
    userName: getCookie("userName") || "",
    profileUpdated: "",
    workspaceId: localStorage.getItem("workspaceId"),
    workspaceOptions: ""
  });

  return (
    <div className="App">
      <Provider store={store}>
        <CommonData.Provider value={{ setCurrentLoggedUserData, currentLoggedUserData }}>
          <PageRoutes />
          <NoInternetOverlay/>
        </CommonData.Provider>

      </Provider>
    </div>
  );
}


export default App;