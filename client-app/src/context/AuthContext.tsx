import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuth: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuth, setIsAuth] = useState<boolean>(
    !!localStorage.getItem("accessToken")
  );

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
