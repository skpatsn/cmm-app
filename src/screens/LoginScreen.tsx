
// src/screens/LoginScreen.tsx
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { loginUser } from "../services/authService";
import { replace } from "../navigation/RootNavigator";

type LoginResponse = {
  token?: string;
  username?: string;
  message?: string;
  [key: string]: any;
};

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter username and password.");
      return;
    }

    setLoading(true);
    try {
      const data = (await loginUser(username.trim(), password, role)) as LoginResponse;

      if (data?.token) {
        // ✅ Save user in AuthContext (handles AsyncStorage)
        await login(data.token, role, data.username ?? username);

        // ✅ Navigate to Dashboard safely
        replace("Dashboard");
      } else {
        Alert.alert("Login Failed", data?.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>CMM System Login</Text>

          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
          />

          <TextInput
            placeholder="Role (ADMIN / MANAGER / USER)"
            style={styles.input}
            value={role}
            onChangeText={(text) => setRole(text.toUpperCase())}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>© 2025 CMM System</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 12,
    color: "#888",
  },
});















// src/screens/LoginScreen.tsx
// import React, { useState, useContext } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
// import { AuthContext } from "../contexts/AuthContext";
// import { loginUser } from "../services/authService";
// import { replace } from "../navigation/RootNavigator";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function LoginScreen() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("USER");
//   const [loading, setLoading] = useState(false);

//   const { login } = useContext(AuthContext);

//   // const handleLogin = async () => {
//   //   if (!username || !password) {
//   //     Alert.alert("Missing Fields", "Please enter username and password.");
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     const data = await loginUser(username, password, role);

//   //     if (data?.token) {
//   //       login(data.token, role, data.username);
//   //       replace("Dashboard"); // ✅ safe for mobile + web
//   //     } else {
//   //       Alert.alert("Login Failed", data?.message || "Invalid credentials");
//   //     }
//   //   } catch (err: any) {
//   //     Alert.alert("Network Error", "Unable to connect to server.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// type LoginResponse = {
//   token?: string;
//   username?: string;
//   message?: string;
//   [key: string]: any;
// };



// const handleLogin = async () => {
//   if (!username || !password) {
//     Alert.alert("Missing Fields", "Please enter username and password.");
//     return;
//   }

//   setLoading(true);
//   try {

//     // const login = async (newToken: string, newRole: string, newUsername: string) => {
//     //   setToken(newToken);
//     //   setRole(newRole);
//     //   setUsername(newUsername);
//     //   await AsyncStorage.setItem("user", JSON.stringify({ token: newToken, role: newRole, username: newUsername }));
//     // };
//     const data = await loginUser(username, password, role) as LoginResponse;

//     if (data?.token) {
//       // save in context
//       login(data.token, role, data.username ?? "");

//       // save in AsyncStorage for API calls
//       await AsyncStorage.setItem(
//         "user",
//         JSON.stringify({ token: data.token, role, username: data.username ?? "" })
//       );

//       // navigate to Dashboard
//       replace("Dashboard");
//     } else {
//       Alert.alert("Login Failed", data?.message || "Invalid credentials");
//     }
//   } catch (err: any) {
//     Alert.alert("Network Error", "Unable to connect to server.");
//     console.error("Login error:", err);
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={username}
//         onChangeText={setUsername}
//         autoCapitalize="none"
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="Role (ADMIN / MANAGER / USER)"
//         style={styles.input}
//         value={role}
//         onChangeText={setRole}
//         autoCapitalize="characters"
//       />

//       <TouchableOpacity
//         style={[styles.button, loading && { opacity: 0.6 }]}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Login</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F7F8FA" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#333" },
//   input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#ccc" },
//   button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" },
// });




// // import React, { useContext } from 'react';
// // import { View, Text } from 'react-native';
// // import { Button, TextInput } from 'react-native-paper';
// // import { AuthContext } from '../contexts/AuthContext';


// // export default function LoginScreen({ navigation }: any) {
// // const { loginAs } = useContext(AuthContext);


// // return (
// // <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F3F4F6' }}>
// // <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>CMM — Login (choose role)</Text>


// // <Button mode="contained" onPress={() => { loginAs('USER'); navigation.replace('Dashboard'); }} style={{ marginBottom: 12 }}>
// // Login as User
// // </Button>


// // <Button mode="contained" onPress={() => { loginAs('HO'); navigation.replace('Dashboard'); }} style={{ marginBottom: 12 }}>
// // Login as HO Account
// // </Button>


// // <Button mode="contained" onPress={() => { loginAs('MGMT'); navigation.replace('Dashboard'); }}>
// // Login as Management
// // </Button>
// // </View>
// // );
// // }

// import React, { useState, useContext } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { Button, TextInput, Card } from 'react-native-paper';
// import { AuthContext } from '../contexts/AuthContext';
// import axios from 'axios';

// export default function LoginScreen({ navigation }: any) {
//   const { loginAs } = useContext(AuthContext);
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState<'USER' | 'HO' | 'MGMT' | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!username || !password || !role) {
//       Alert.alert('Error', 'Please enter all fields and select a role.');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Replace with your actual API endpoint
//       const response = await axios.post('http://127.0.0.1:8000/api/accounts/login/', {
//         username,
//         password,
//         role,
//       });

//       type LoginResponse = { success: boolean; token?: string; message?: string };
//       const data = response.data as LoginResponse;

//       console.log('Login API Response:', data);

//       if (data.success && data.token) {
//         loginAs(role, data.token); // save token in context
//         // navigation.replace('Dashboard');
//         navigation.navigate('Dashboard');
//       } else {
//         Alert.alert('Login Failed', data.message || 'Invalid credentials');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Network error or server down.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Card style={styles.card}>
//         <Card.Content>
//           <Text style={styles.title}>CMM — Login</Text>

//           <TextInput
//             label="Username"
//             value={username}
//             onChangeText={setUsername}
//             mode="outlined"
//             style={styles.input}
//           />
//           <TextInput
//             label="Password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//             mode="outlined"
//             style={styles.input}
//           />

//           <Text style={styles.roleLabel}>Select Role:</Text>
//           <View style={styles.roleButtons}>
//             {['USER', 'HO', 'MGMT'].map((r) => (
//               <Button
//                 key={r}
//                 mode={role === r ? 'contained' : 'outlined'}
//                 onPress={() => setRole(r as any)}
//                 style={styles.roleButton}
//               >
//                 {r}
//               </Button>
//             ))}
//           </View>

//           <Button
//             mode="contained"
//             onPress={handleLogin}
//             style={styles.loginButton}
//             disabled={loading}
//           >
//             {loading ? <ActivityIndicator color="#fff" /> : 'Login'}
//           </Button>
//         </Card.Content>
//       </Card>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F3F4F6' },
//   card: { borderRadius: 15, padding: 20, elevation: 5 },
//   title: { fontSize: 24, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
//   input: { marginBottom: 15 },
//   roleLabel: { fontSize: 16, marginBottom: 10, fontWeight: '600' },
//   roleButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
//   roleButton: { flex: 1, marginHorizontal: 5 },
//   loginButton: { marginTop: 10, paddingVertical: 5 },
// });


// // src/screens/LoginScreen.tsx
// import React, { useState, useContext } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
// import { AuthContext, AuthContextType } from '../contexts/AuthContext';

// import { StackNavigationProp } from '@react-navigation/stack';

// type LoginScreenProps = {
//   navigation: StackNavigationProp<any>;
// };

// export default function LoginScreen({ navigation }: LoginScreenProps) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('USER');
//   const { loginAs } = useContext(AuthContext as React.Context<AuthContextType>);

//   const handleLogin = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/accounts/login/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password, role }),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         loginAs(role, data.token);
//         navigation.replace('Dashboard');
//       } else {
//         Alert.alert('Login Failed', data.message || 'Invalid credentials');
//       }
//     } catch (err) {
//       Alert.alert('Network Error', 'Unable to connect to server.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={username}
//         onChangeText={setUsername}
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="Role (ADMIN / MANAGER / USER)"
//         style={styles.input}
//         value={role}
//         onChangeText={setRole}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F7F8FA' },
//   title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
//   input: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ccc',
//   },
//   button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
//   buttonText: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
// });


// import React, { useState, useContext } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AuthContext, AuthContextType } from "../contexts/AuthContext";
// import { StackNavigationProp } from "@react-navigation/stack";

// type LoginScreenProps = {
//   navigation: StackNavigationProp<any>;
// };

// export default function LoginScreen({ navigation }: LoginScreenProps) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("USER");
//   const { loginAs } = useContext(AuthContext as React.Context<AuthContextType>);

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Alert.alert("Missing Info", "Please enter username and password.");
//       return;
//     }

//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password, role }),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         await loginAs(role, data.token);
//         Alert.alert("Welcome", `Logged in as ${username}`);
//         navigation.replace("Dashboard");
//       } else {
//         Alert.alert("Login Failed", data.message || "Invalid credentials");
//       }
//     } catch (err) {
//       Alert.alert("Network Error", "Unable to connect to server.");
//       console.error("Login Error:", err);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={username}
//         onChangeText={setUsername}
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="Role (HO / MANAGER / USER)"
//         style={styles.input}
//         value={role}
//         onChangeText={setRole}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F7F8FA" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" },
// });


// // src/screens/LoginScreen.tsx
// import React, { useState, useContext } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
// import { AuthContext } from '../contexts/AuthContext';
// import { StackNavigationProp } from '@react-navigation/stack';

// type LoginScreenProps = {
//   navigation: StackNavigationProp<any>;
// };

// export default function LoginScreen({ navigation }: LoginScreenProps) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('USER');
//   const { login } = useContext(AuthContext);

//   const handleLogin = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/accounts/login/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password, role }),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         await login(role, data.token);
//         navigation.replace('Dashboard');
//       } else {
//         Alert.alert('Login Failed', data.message || 'Invalid credentials');
//       }
//     } catch (err) {
//       console.error('Login Error:', err);
//       Alert.alert('Network Error', 'Unable to connect to the server.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={username}
//         onChangeText={setUsername}
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="Role (ADMIN / MANAGER / USER)"
//         style={styles.input}
//         value={role}
//         onChangeText={setRole}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F7F8FA' },
//   title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
//   input: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ccc',
//   },
//   button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
//   buttonText: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
// });
// // This screen provides a login interface where users can enter their credentials and role.
// // It authenticates against the backend API and stores the auth token in context for subsequent requests.



// import React, { useState, useContext } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
// import { AuthContext } from "../contexts/AuthContext";

// export default function LoginScreen({ navigation }: any) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("USER");
//   const { login } = useContext(AuthContext);

//   const handleLogin = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password, role }),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         await login(data.token, role);
//         navigation.replace("Dashboard");
//       } else {
//         Alert.alert("Login Failed", data.message || "Invalid credentials");
//       }
//     } catch (err) {
//       Alert.alert("Network Error", "Unable to connect to server.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput placeholder="Username" style={styles.input} value={username} onChangeText={setUsername} />
//       <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
//       <TextInput placeholder="Role (ADMIN / MANAGER / USER)" style={styles.input} value={role} onChangeText={setRole} />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F7F8FA" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" },
// });


// import React, { useState, useContext } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { AuthContext } from "../contexts/AuthContext";
// import { loginUser } from "../services/authService";

// export default function LoginScreen({ navigation }: any) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("USER");
//   const [loading, setLoading] = useState(false);

//   const { login } = useContext(AuthContext);

//   // const handleLogin = async () => {
//   //   if (!username || !password) {
//   //     Alert.alert("Missing Fields", "Please enter username and password.");
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     const data = await loginUser(username, password, role);

//   //     if (data?.token) {
//   //       await login(data.token, role, data.username);
//   //       navigation.replace("Dashboard");
//   //     } else {
//   //       Alert.alert("Login Failed", data?.message || "Invalid credentials");
//   //     }
//   //   } catch (err: any) {
//   //     Alert.alert("Network Error", "Unable to connect to server.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleLogin = async () => {
//     if (!username || !password) {
//       Alert.alert("Missing Fields", "Please enter username and password.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await loginUser(username, password, role);

//       if (data?.token) {
//         await login(data.token, role, data.username);

//         // ✅ Safe navigation: Dashboard is always registered
//         navigation.replace("Dashboard");
//       } else {
//         Alert.alert("Login Failed", data?.message || "Invalid credentials");
//       }
//     } catch (err: any) {
//       Alert.alert("Network Error", "Unable to connect to server.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={username}
//         onChangeText={setUsername}
//         autoCapitalize="none"
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="Role (ADMIN / MANAGER / USER)"
//         style={styles.input}
//         value={role}
//         onChangeText={setRole}
//         autoCapitalize="characters"
//       />

//       <TouchableOpacity
//         style={[styles.button, loading && { opacity: 0.6 }]}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Login</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 20,
//     backgroundColor: "#F7F8FA",
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 30,
//     textAlign: "center",
//     color: "#333",
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   button: {
//     backgroundColor: "#007AFF",
//     padding: 15,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     fontWeight: "bold",
//   },
// });



// import React, { useState, useContext, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
// import { AuthContext } from "../contexts/AuthContext";
// import { loginUser } from "../services/authService";

// export default function LoginScreen({ navigation }: any) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("USER");
//   const [loading, setLoading] = useState(false);

//   const { login, user } = useContext(AuthContext);

//   // ✅ If user already logged in, redirect automatically
//   useEffect(() => {
//     if (user) {
//       navigation.navigate("Dashboard");
//     }
//   }, [user]);

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Alert.alert("Missing Fields", "Please enter username and password.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await loginUser(username, password, role);

//       if (data?.token) {
//         await login(data.token, role, data.username);
//         // ✅ navigation.replace now safe because Dashboard always registered
//         navigation.navigate("Dashboard");
//       } else {
//         Alert.alert("Login Failed", data?.message || "Invalid credentials");
//       }
//     } catch (err: any) {
//       Alert.alert("Network Error", "Unable to connect to server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={username}
//         onChangeText={setUsername}
//         autoCapitalize="none"
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="Role (ADMIN / MANAGER / USER)"
//         style={styles.input}
//         value={role}
//         onChangeText={setRole}
//         autoCapitalize="characters"
//       />

//       <TouchableOpacity
//         style={[styles.button, loading && { opacity: 0.6 }]}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Login</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F7F8FA" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#333" },
//   input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#ccc" },
//   button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" },
// });



// src/screens/LoginScreen.tsx
// import React, { useState, useContext } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
// import { AuthContext } from "../contexts/AuthContext";
// import { loginUser } from "../services/authService";
// import { replace } from "../navigation/RootNavigation";

// export default function LoginScreen() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("USER");
//   const [loading, setLoading] = useState(false);

//   const { login } = useContext(AuthContext);

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Alert.alert("Missing Fields", "Please enter username and password.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await loginUser(username, password, role);

//       if (data?.token) {
//         await login(data.token, role, data.username);

//         // ✅ Safe navigation to Dashboard (works on web & mobile)
//         replace("Dashboard");
//       } else {
//         Alert.alert("Login Failed", data?.message || "Invalid credentials");
//       }
//     } catch (err: any) {
//       Alert.alert("Network Error", "Unable to connect to server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>CMM System Login</Text>

//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={username}
//         onChangeText={setUsername}
//         autoCapitalize="none"
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="Role (ADMIN / MANAGER / USER)"
//         style={styles.input}
//         value={role}
//         onChangeText={setRole}
//         autoCapitalize="characters"
//       />

//       <TouchableOpacity
//         style={[styles.button, loading && { opacity: 0.6 }]}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Login</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F7F8FA" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#333" },
//   input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#ccc" },
//   button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" },
// });
// // This screen provides a login interface where users can enter their credentials and role.
// // It authenticates against the backend API and stores the auth token in context for subsequent requests.
// // Navigation to Dashboard is handled via a centralized navigation service for consistency across platforms.  

