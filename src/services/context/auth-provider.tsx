import { createContext, useState } from "react";
import { getCookie } from "../utils/cookie-utils";
interface AuthContextType {
  auth: any; // Update the 'any' type with the appropriate type for your 'auth' object
  setAuth: React.Dispatch<React.SetStateAction<any>>;
  user: any;
  updateUser: (updatedUser: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  auth: {},
  setAuth: () => { },
  user: {},
  updateUser: () => { },
});

interface Props {
  children?: React.ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const token = { token: getCookie("token") || "" };
  const [auth, setAuth] = useState<any>(token);
  const [user, setUser] = useState<any>({});

  const updateUser = (updatedUser: any) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, user, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;