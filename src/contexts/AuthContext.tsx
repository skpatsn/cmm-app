





// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAccessToken } from "../services/authService";

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  username: string | null;
  role: string | null;
  loading: boolean;
  login: (token: string, role: string, username: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  refreshToken: null,
  role: null,
  username: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.token) {
            setToken(parsed.token);
            setRefreshToken(parsed.refreshToken ?? null);
            setRole(parsed.role ?? null);
            setUsername(parsed.username ?? null);
          }
        }
      } catch (e) {
        console.error("Failed to load user:", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (newToken: string, newRole: string, newUsername: string, newRefreshToken: string) => {
    const userData = { token: newToken, refreshToken: newRefreshToken, role: newRole, username: newUsername };
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setRole(newRole);
    setUsername(newUsername);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    setUsername(null);
  };

  // Only render children once loading is done
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ token, refreshToken, role, username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};



// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AppState } from "react-native";
// import { refreshAccessToken } from "../services/authService";

// interface AuthContextType {
//   token: string | null;
//   refreshToken: string | null;
//   username: string | null;
//   role: string | null;
//   loading: boolean;
//   login: (token: string, role: string, username: string, refreshToken: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   refreshToken: null,
//   role: null,
//   username: null,
//   loading: true,
//   login: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [refreshToken, setRefreshToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [username, setUsername] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Load user session from storage
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem("user");
//         if (savedUser) {
//           const parsed = JSON.parse(savedUser);
//           if (parsed?.token && parsed.token.trim() !== "") {
//             setToken(parsed.token);
//             setRefreshToken(parsed.refreshToken ?? null);
//             setRole(parsed.role ?? null);
//             setUsername(parsed.username ?? null);
//           } else {
//             await AsyncStorage.removeItem("user");
//           }
//         }
//       } catch (e) {
//         console.error("Failed to load user:", e);
//         await AsyncStorage.removeItem("user");
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadUser();
//   }, []);

//   // Auto logout when app goes to background (if you still want this)
//   // useEffect(() => {
//   //   const subscription = AppState.addEventListener("change", async (state) => {
//   //     if (state === "background" || state === "inactive") {
//   //       await logout();
//   //     }
//   //   });
//   //   return () => subscription.remove();
//   // }, [token]);

//   // ✅ Updated login method with refresh token support
//   const login = async (newToken: string, newRole: string, newUsername: string, newRefreshToken: string) => {
//     try {
//       const userData = {
//         token: newToken,
//         refreshToken: newRefreshToken,
//         role: newRole,
//         username: newUsername,
//       };
//       await AsyncStorage.setItem("user", JSON.stringify(userData));
//       setToken(newToken);
//       setRefreshToken(newRefreshToken);
//       setRole(newRole);
//       setUsername(newUsername);
//     } catch (error) {
//       console.error("Login persistence error:", error);
//     }
//   };

//   // ✅ Auto-refresh example (future-ready)
//   const refreshTokenIfNeeded = async () => {
//     if (refreshToken && token) {
//       const newAccess = await refreshAccessToken(refreshToken);
//       if (newAccess) {
//         setToken(newAccess);
//         await AsyncStorage.mergeItem("user", JSON.stringify({ token: newAccess }));
//       }
//     }
//   };

//   // ✅ Logout method
//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem("user");
//       setToken(null);
//       setRefreshToken(null);
//       setRole(null);
//       setUsername(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         refreshToken,
//         role,
//         username,
//         loading,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };







// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AppState } from "react-native";

// // type AuthContextType = {
// //   token: string | null;
// //   role: string | null;
// //   username: string | null;
// //   loading: boolean;
// //   login: (token: string, role: string, username: string) => Promise<void>;
// //   logout: () => Promise<void>;
// // };
// interface AuthContextType {
//   token: string | null;
//   username: string | null;
//   role: string | null;
//   userLocation: string | null;
//   login: (token: string, role: string, username: string, location: string) => Promise<void>;
//   logout: () => Promise<void>;
// } 
// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   username: null,
//   userLocation: null,
//   loading: true,
//   login: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [username, setUsername] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Load user from storage
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem("user");
//         if (savedUser) {
//           const parsed = JSON.parse(savedUser);
//           if (parsed?.token && parsed.token.trim() !== "") {
//             setToken(parsed.token);
//             setRole(parsed.role ?? null);
//             setUsername(parsed.username ?? null);
//           } else {
//             await AsyncStorage.removeItem("user");
//           }
//         }
//       } catch (e) {
//         console.error("Failed to load user:", e);
//         await AsyncStorage.removeItem("user");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   // Auto logout on app background/close
//   useEffect(() => {
//     const subscription = AppState.addEventListener("change", async (state) => {
//       if (state === "background" || state === "inactive") {
//         await logout();
//       }
//     });
//     return () => subscription.remove();
//   }, [token]);

//   const login = async (newToken: string, newRole: string, newUsername: string) => {
//     try {
//       const userData = { token: newToken, role: newRole, username: newUsername };
//       await AsyncStorage.setItem("user", JSON.stringify(userData));
//       setToken(newToken);
//       setRole(newRole);
//       setUsername(newUsername);
//     } catch (error) {
//       console.error("Login persistence error:", error);
//     }
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem("user");
//       setToken(null);
//       setRole(null);
//       setUsername(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, username, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };




// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// type AuthContextType = {
//   token: string | null;
//   role: string | null;
//   username: string | null;
//   loading: boolean;
//   login: (token: string, role: string, username: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   username: null,
//   loading: true,
//   login: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [username, setUsername] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem("user");
//         if (savedUser) {
//           const parsed = JSON.parse(savedUser);

//           //  Validate the stored user before applying
//           if (parsed?.token && typeof parsed.token === "string" && parsed.token.trim() !== "") {
//             setToken(parsed.token);
//             setRole(parsed.role ?? null);
//             setUsername(parsed.username ?? null);
//           } else {
//             //  Invalid data → clear it out
//             await AsyncStorage.removeItem("user");
//           }
//         }
//       } catch (e) {
//         console.error("Failed to load user:", e);
//         await AsyncStorage.removeItem("user");
//       } finally {
//         setLoading(false); // Done loading
//       }
//     };

//     loadUser();
//   }, []);

//   const login = async (newToken: string, newRole: string, newUsername: string) => {
//     try {
//       const userData = { token: newToken, role: newRole, username: newUsername };
//       await AsyncStorage.setItem("user", JSON.stringify(userData));
//       setToken(newToken);
//       setRole(newRole);
//       setUsername(newUsername);
//     } catch (error) {
//       console.error("Login persistence error:", error);
//     }
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem("user");
//       setToken(null);
//       setRole(null);
//       setUsername(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, username, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// type AuthContextType = {
//   token: string | null;
//   role: string | null;
//   username: string | null;
//   login: (token: string, role: string, username: string) => void;
//   logout: () => void;
// };

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   username: null,
//   login: () => {},
//   logout: () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [username, setUsername] = useState<string | null>(null);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem("user");
//         if (savedUser) {
//           const { token, role, username } = JSON.parse(savedUser);
//           setToken(token);
//           setRole(role);
//           setUsername(username);
//         }
//       } catch (e) {
//         console.error("Failed to load user:", e);
//       }
//     };
//     loadUser();
//   }, []);

//   const login = (newToken: string, newRole: string, newUsername: string) => {
//     setToken(newToken);
//     setRole(newRole);
//     setUsername(newUsername);
//   };

//   const logout = async () => {
//     setToken(null);
//     setRole(null);
//     setUsername(null);
//     await AsyncStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, username, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// interface AuthContextType {
//   token: string | null;
//   username: string | null;
//   role: string | null;
//   login: (token: string, role: string, username: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   username: null,
//   role: null,
//   login: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [username, setUsername] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem("token");
//         const storedUsername = await AsyncStorage.getItem("username");
//         const storedRole = await AsyncStorage.getItem("role");
//         if (storedToken) {
//           setToken(storedToken);
//           setUsername(storedUsername);
//           setRole(storedRole);
//         }
//       } catch (e) {
//         console.warn("Session restore failed", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     restoreSession();
//   }, []);

// const login = async (newToken: string, newRole: string, newUsername: string) => {
//   try {
//     await AsyncStorage.multiSet([
//       ["token", newToken],
//       ["username", newUsername || ""],
//       ["role", newRole || ""],
//     ]);
//     setToken(newToken);
//     setUsername(newUsername || null);
//     setRole(newRole || null);
//   } catch (e) {
//     console.warn("Auth login store failed", e);
//   }
// };

//   const logout = async () => {
//     await AsyncStorage.multiRemove(["token", "username", "role"]);
//     setToken(null);
//     setUsername(null);
//     setRole(null);
//   };

//   return (
//     <AuthContext.Provider value={{ token, username, role, login, logout }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };



// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';


// type Role = 'USER' | 'HO' | 'MGMT';


// export const AuthContext = createContext<any>(null);


// export const AuthProvider: React.FC<any> = ({ children }) => {
// const [user, setUser] = useState<any>(null);


// useEffect(() => {
// (async () => {
// const raw = await AsyncStorage.getItem('@cmm_user');
// if (raw) setUser(JSON.parse(raw));
// })();
// }, []);


// async function loginAs(role: Role, name = 'Demo') {
// const u = { id: 'u1', name, role };
// setUser(u);
// await AsyncStorage.setItem('@cmm_user', JSON.stringify(u));
// }


// async function logout() {
// setUser(null);
// await AsyncStorage.removeItem('@cmm_user');
// }


// return <AuthContext.Provider value={{ user, loginAs, logout }}>{children}</AuthContext.Provider>;
// };



// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   const loginAs = async (role, token) => {
//     const userData = { role, token };
//     await AsyncStorage.setItem('user', JSON.stringify(userData));
//     setUser(userData);
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem('user');
//     setUser(null);
//   };

//   useEffect(() => {
//     const loadUser = async () => {
//       const stored = await AsyncStorage.getItem('user');
//       if (stored) setUser(JSON.parse(stored));
//     };
//     loadUser();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loginAs, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// export type AuthContextType = {
//   token: string | null;
//   role: string | null;
//   loginAs: (role: string, token: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   loginAs: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);

//   // Load token on app start
//   useEffect(() => {
//     const loadStoredToken = async () => {
//       const storedToken = await AsyncStorage.getItem("userToken");
//       const storedRole = await AsyncStorage.getItem("userRole");
//       if (storedToken) {
//         setToken(storedToken);
//         setRole(storedRole);
//         axios.defaults.headers.common["Authorization"] = `Token ${storedToken}`;
//       }
//     };
//     loadStoredToken();
//   }, []);

//   const loginAs = async (role: string, token: string) => {
//     await AsyncStorage.setItem("userToken", token);
//     await AsyncStorage.setItem("userRole", role);
//     setToken(token);
//     setRole(role);
//     axios.defaults.headers.common["Authorization"] = `Token ${token}`;
//   };

//   const logout = async () => {
//     await AsyncStorage.multiRemove(["userToken", "userRole"]);
//     setToken(null);
//     setRole(null);
//     delete axios.defaults.headers.common["Authorization"];
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, loginAs, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// export type AuthContextType = {
//   token: string | null;
//   user: any | null;
//   login: (username: string, password: string) => Promise<boolean>;
//   logout: () => void;
// };

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   user: null,
//   login: async () => false,
//   logout: () => {},
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<any | null>(null);

//   const API_BASE = "http://127.0.0.1:8000/api";

//   useEffect(() => {
//     const loadStoredAuth = async () => {
//       const storedToken = await AsyncStorage.getItem("token");
//       const storedUser = await AsyncStorage.getItem("user");
//       if (storedToken) setToken(storedToken);
//       if (storedUser) setUser(JSON.parse(storedUser));
//     };
//     loadStoredAuth();
//   }, []);

//   const login = async (username: string, password: string) => {
//     try {
//       const response = await axios.post(`${API_BASE}/accounts/login/`, { username, password });
//       const data = response.data as { token: string; user: any };
//       if (response.status === 200 && data.token) {
//         setToken(data.token);
//         setUser(data.user);
//         await AsyncStorage.setItem("token", data.token);
//         await AsyncStorage.setItem("user", JSON.stringify(data.user));
//         return true;
//       }
//     } catch (error) {
//       if (typeof error === "object" && error !== null && "response" in error) {
//         console.error("Login failed", (error as any).response);
//       } else {
//         console.error("Login failed", error);
//       }
//     }
//     return false;
//   };

//   const logout = async () => {
//     setToken(null);
//     setUser(null);
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ token, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// // This context manages authentication state, including login and logout functions.
// // It stores the auth token and user info in AsyncStorage for persistence.

// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect, ReactNode } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export type AuthContextType = {
//   token: string | null;
//   role: string | null;
//   login: (role: string, token: string) => Promise<void>;
//   logout: () => Promise<void>;
//   authFetch: (url: string, options?: RequestInit) => Promise<Response>;
// };

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   login: async () => {},
//   logout: async () => {},
//   authFetch: async () => new Response(),
// });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);

//   useEffect(() => {
//     (async () => {
//       const storedToken = await AsyncStorage.getItem('token');
//       const storedRole = await AsyncStorage.getItem('role');
//       if (storedToken) setToken(storedToken);
//       if (storedRole) setRole(storedRole);
//     })();
//   }, []);

//   const login = async (role: string, token: string) => {
//     setRole(role);
//     setToken(token);
//     await AsyncStorage.setItem('token', token);
//     await AsyncStorage.setItem('role', role);
//   };

//   const logout = async () => {
//     setRole(null);
//     setToken(null);
//     await AsyncStorage.multiRemove(['token', 'role']);
//   };

//   // 🔐 A secure fetch wrapper that includes Authorization automatically
//   const authFetch = async (url: string, options: RequestInit = {}) => {
//     if (!token) throw new Error('Not authenticated');
//     const headers = {
//       ...(options.headers || {}),
//       Authorization: `Token ${token}`,
//       'Content-Type': 'application/json',
//     };
//     return fetch(url, { ...options, headers });
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, login, logout, authFetch }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// // This context manages authentication state, including login and logout functions.
// // It stores the auth token and user role in AsyncStorage for persistence.
// // It also provides an authFetch function that automatically includes the auth token in request headers.

// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useEffect, ReactNode } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export type AuthContextType = {
//   token: string | null;
//   role: string | null;
//   loginAs: (role: string, token: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   loginAs: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);

//   useEffect(() => {
//     const loadStoredAuth = async () => {
//       const savedToken = await AsyncStorage.getItem("token");
//       const savedRole = await AsyncStorage.getItem("role");
//       if (savedToken) setToken(savedToken);
//       if (savedRole) setRole(savedRole);
//     };
//     loadStoredAuth();
//   }, []);

//   const loginAs = async (role: string, newToken: string) => {
//     setRole(role);
//     setToken(newToken);
//     await AsyncStorage.setItem("token", newToken);
//     await AsyncStorage.setItem("role", role);
//   };

//   const logout = async () => {
//     setToken(null);
//     setRole(null);
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("role");
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, loginAs, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// import React, { createContext, useState, useEffect, ReactNode } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export type AuthContextType = {
//   token: string | null;
//   role: string | null;
//   login: (token: string, role: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   login: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);

//   // Load token from storage when app starts
//   useEffect(() => {
//     const loadAuth = async () => {
//       const storedToken = await AsyncStorage.getItem("token");
//       const storedRole = await AsyncStorage.getItem("role");
//       if (storedToken) {
//         setToken(storedToken);
//         setRole(storedRole);
//       }
//     };
//     loadAuth();
//   }, []);

//   const login = async (newToken: string, newRole: string) => {
//     await AsyncStorage.setItem("token", newToken);
//     await AsyncStorage.setItem("role", newRole);
//     setToken(newToken);
//     setRole(newRole);
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("role");
//     setToken(null);
//     setRole(null);
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// // This context manages authentication state, including login and logout functions.
// // It stores the auth token and user role in AsyncStorage for persistence.



// import React, { createContext, useState, useEffect, ReactNode } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // ✅ Define full user structure
// export type UserType = {
//   id: string;
//   name: string;
//   role: "USER" | "HO" | "MGMT";
//   token: string;
// };

// // Define context shape
// export type AuthContextType = {
//   user: UserType | null;
//   login: (userData: UserType) => Promise<void>;
//   logout: () => Promise<void>;
//   updateUser: (updates: Partial<UserType>) => Promise<void>;
// };

// // Create context with defaults
// export const AuthContext = createContext<AuthContextType>({
//   user: null,
//   login: async () => {},
//   logout: async () => {},
//   updateUser: async () => {},
// });

// // Provider component
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<UserType | null>(null);

//   // Load stored user when app starts
//   useEffect(() => {
//     const loadAuth = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem("user");
//         if (storedUser) {
//           setUser(JSON.parse(storedUser));
//         }
//       } catch (err) {
//         console.error("Error loading user:", err);
//       }
//     };
//     loadAuth();
//   }, []);

//   // Save full user object on login
//   const login = async (userData: UserType) => {
//     try {
//       await AsyncStorage.setItem("user", JSON.stringify(userData));
//       setUser(userData);
//     } catch (err) {
//       console.error("Error saving user:", err);
//     }
//   };

//   // Update selected fields (like role or name)
//   const updateUser = async (updates: Partial<UserType>) => {
//     if (!user) return;
//     const updated = { ...user, ...updates };
//     await AsyncStorage.setItem("user", JSON.stringify(updated));
//     setUser(updated);
//   };

//   // Clear everything on logout
//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem("user");
//       setUser(null);
//     } catch (err) {
//       console.error("Error logging out:", err);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, updateUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, ReactNode } from 'react';

// type AuthContextType = {
//   user: { token: string; role: string; username: string } | null;
//   login: (token: string, role: string, username: string) => void;
//   logout: () => void;
// };

// export const AuthContext = createContext<AuthContextType>({
//   user: null,
//   login: () => {},
//   logout: () => {},
// });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<{ token: string; role: string; username: string } | null>(null);

//   const login = (token: string, role: string, username: string) => {
//     setUser({ token, role, username });
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, ReactNode, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// type UserType = { token: string; role: string; username: string };

// type AuthContextType = {
//   user: UserType | null;
//   login: (token: string, role: string, username: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// export const AuthContext = createContext<AuthContextType>({
//   user: null,
//   login: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<UserType | null>(null);

//   // Load token from storage on mount
//   useEffect(() => {
//     const loadUser = async () => {
//       const storedUser = await AsyncStorage.getItem('user');
//       if (storedUser) setUser(JSON.parse(storedUser));
//     };
//     loadUser();
//   }, []);

//   const login = async (token: string, role: string, username: string) => {
//   const userObj = { token, role, username };
//   setUser(userObj);
//   await AsyncStorage.setItem("user", JSON.stringify(userObj));
//   };


//   const logout = async () => {
//     setUser(null);
//     await AsyncStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
