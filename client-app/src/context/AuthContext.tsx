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
  userSite: number;
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
  userSite: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuth, setIsAuth] = useState<boolean>(
    //!!localStorage.getItem("accessToken")
    !!sessionStorage.getItem("accessToken")
  );

  const [userId, setUserId] = useState<number>(
    //Number(localStorage.getItem("userId")) || 0
    Number(sessionStorage.getItem("userId")) || 0
  );

  const [userRank, setUserRank] = useState<number>(
    //Number(localStorage.getItem("userRank")) || 0
    Number(sessionStorage.getItem("userRank")) || 0
  );

  const [userTeam, setUserTeam] = useState<number>(
    //Number(localStorage.getItem("userTeam")) || 0
    Number(sessionStorage.getItem("userTeam")) || 0
  );

  const [userName, setUserName] = useState<string>(
    //localStorage.getItem("userName") || ""
    sessionStorage.getItem("userName") || ""
  );

  const [userSite, setSite] = useState<number>(
    //localStorage.getItem("userName") || ""
    Number(sessionStorage.getItem("userSite")) || 0
  );

  const login = (token: string) => {
    //console.log("🔑 로그인 시도 - 받은 토큰:", token);

    //localStorage.setItem("accessToken", token);
    sessionStorage.setItem("accessToken", token);

    //console.log("📌 저장된 로컬 스토리지 값:");
    //console.log(" - accessToken:", sessionStorage.getItem("accessToken"));

    setIsAuth(true);

    //console.log("✅ 로그인 상태 업데이트: setIsAuth(true)");
  };

  const userUpdateData = (userData: User) => {
    //localStorage.setItem("userId", String(userData.id));
    //localStorage.setItem("userName", userData.username);
    //localStorage.setItem("userRank", String(userData.rank));
    //localStorage.setItem("userTeam", String(userData.team));

    sessionStorage.setItem("userId", String(userData.id));
    sessionStorage.setItem("userName", userData.username);
    sessionStorage.setItem("userRank", String(userData.rank));
    sessionStorage.setItem("userTeam", String(userData.team));
    sessionStorage.setItem("userSite", String(userData.site));
    setUserId(userData.id);
    setUserRank(userData.rank);
    setUserTeam(userData.team);
    setUserName(userData.username);
    setSite(userData.site);
  };

  const logout = () => {
    //localStorage.removeItem("accessToken");
    //localStorage.removeItem("userId");
    //localStorage.removeItem("userName");
    //localStorage.removeItem("userRank");
    //localStorage.removeItem("userTeam");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userRank");
    sessionStorage.removeItem("userTeam");
    sessionStorage.removeItem("userSite");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        login,
        logout,
        userUpdateData,
        userId,
        userRank,
        userTeam,
        userName,
        userSite,
      }}
    >
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
