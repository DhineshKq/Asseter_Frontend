import store from './redux/store';
import './styles/app.scss';
import { Provider } from 'react-redux';
import PageRoutes from './routes/page-routes';
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const disableAutofill = () => {
      document.querySelectorAll("form").forEach((form) => {
        form.setAttribute("autocomplete", "off");
      });

      document.querySelectorAll("input, textarea, select").forEach((field) => {
        const inputField = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const inputType = inputField instanceof HTMLInputElement ? inputField.type : "";

        if (inputType === "password") {
          inputField.setAttribute("autocomplete", "new-password");
        } else {
          inputField.setAttribute("autocomplete", "off");
        }

        inputField.setAttribute("autocorrect", "off");
        inputField.setAttribute("autocapitalize", "off");
        inputField.setAttribute("spellcheck", "false");
      });
    };

    disableAutofill();

    const observer = new MutationObserver(() => {
      disableAutofill();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

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
