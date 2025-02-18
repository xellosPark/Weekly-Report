import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuth: boolean;
  login: (token: string) => void;
  logout: () => void;
  userUpdateData: (userData: User) => void;
  userId: number;
  userRank: number;
  userTeam: number;
  userName: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  rank: number;
  team: number;
  site: number;
  admin: number;
  state: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuth, setIsAuth] = useState<boolean>(
    !!localStorage.getItem("accessToken")
  );

  const [userId, setUserId] = useState<number>(
    Number(localStorage.getItem("userId")) || 0
  );

  const [userRank, setUserRank] = useState<number>(
    Number(localStorage.getItem("userRank")) || 0
  );

  const [userTeam, setUserTeam] = useState<number>(
    Number(localStorage.getItem("userTeam")) || 0
  );

  const [userName, setUserName] = useState<string>(
    localStorage.getItem("userName") || ""
  );

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    setIsAuth(true);
  };

  const userUpdateData = (userData: User) => {
    localStorage.setItem("userId", String(userData.id));
    localStorage.setItem("userName", userData.username);
    localStorage.setItem("userRank", String(userData.rank));
    localStorage.setItem("userTeam", String(userData.team));
    setUserId(userData.id);
    setUserRank(userData.rank);
    setUserTeam(userData.team);
    setUserName(userData.username);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRank");
    localStorage.removeItem("userTeam");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout, userUpdateData, userId, userRank, userTeam, userName }}>
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
