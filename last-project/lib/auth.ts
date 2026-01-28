export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  return !!token;
};

export const isAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  const role = localStorage.getItem("userRole");
  return role === "admin";
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const getUserToken = (): number => {
  if (typeof window === "undefined") return 0;
  const token = localStorage.getItem("userToken");
  return token ? parseInt(token, 10) : 0;
};

export const getUserData = () => {
  if (typeof window === "undefined") return null;
  
  return {
    name: localStorage.getItem("userName"),
    email: localStorage.getItem("userEmail"),
    role: localStorage.getItem("userRole"),
    token: getUserToken(),
  };
};

export const logout = () => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("access_token");
  localStorage.removeItem("userToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  
  window.location.href = "/login";
};

export const checkAdminAccess = (): boolean => {
  if (!isAuthenticated()) {
    window.location.href = "/login";
    return false;
  }
  
  if (!isAdmin()) {
    window.location.href = "/login";
    return false;
  }
  
  return true;
};
