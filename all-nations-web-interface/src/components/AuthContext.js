import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("authToken");
    if (stored) {
      setAuthData(JSON.parse(stored));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("authToken", JSON.stringify(data));
    setAuthData(data);
    setIsAuthenticated(true);
  };

  // const logout = (navigate) => {
  //   localStorage.removeItem("authToken");
  //   setAuthData(null);
  //   setIsAuthenticated(false);
  //   navigate("/login", { replace: true });
  // };
  const logout = () => {
  localStorage.removeItem("authToken");
  setAuthData(null);
  setIsAuthenticated(false);
  }
  return (
    <AuthContext.Provider value={{ isAuthenticated, authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};