

// App.tsx
import * as React from "react";
import { View, ActivityIndicator } from "react-native";
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, AuthContext } from "./src/contexts/AuthContext";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import MeetingFormScreen from "./src/screens/MeetingFormScreen";
import ApprovalsScreen from "./src/screens/ApprovalsScreen";
import ReportsScreen from "./src/screens/ReportsScreen";

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#007AFF",
    secondary: "#03DAC6",
  },
};

function MainNavigator() {
  const { token, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
          <Stack.Screen name="Approvals" component={ApprovalsScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}





// // // App.tsx
// // App.tsx
// import * as React from "react";
// import { View, ActivityIndicator } from "react-native";
// import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { AuthProvider, AuthContext } from "./src/contexts/AuthContext";

// // Screens
// import LoginScreen from "./src/screens/LoginScreen";
// import DashboardScreen from "./src/screens/DashboardScreen";
// import MeetingFormScreen from "./src/screens/MeetingFormScreen";
// import ApprovalsScreen from "./src/screens/ApprovalsScreen";
// import ReportsScreen from "./src/screens/ReportsScreen";

// const Stack = createStackNavigator();

// const theme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: "#007AFF",
//     secondary: "#03DAC6",
//   },
// };

// function MainNavigator() {
//   const { token, loading } = React.useContext(AuthContext);

//   // Wait for AuthContext to finish reading AsyncStorage
//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {!token ? (
//         // No token → show Login
//         <Stack.Screen name="Login" component={LoginScreen} />
//       ) : (
//         // Logged in → show Dashboard flow
//         <>
//           <Stack.Screen name="Dashboard" component={DashboardScreen} />
//           <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
//           <Stack.Screen name="Approvals" component={ApprovalsScreen} />
//           <Stack.Screen name="Reports" component={ReportsScreen} />
//         </>
//       )}
//     </Stack.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <PaperProvider theme={theme}>
//       <AuthProvider>
//         <NavigationContainer>
//           <MainNavigator />
//         </NavigationContainer>
//       </AuthProvider>
//     </PaperProvider>
//   );
// }


// // App.tsx
// import * as React from "react";
// import { View, ActivityIndicator } from "react-native";
// import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { AuthProvider, AuthContext } from "./src/contexts/AuthContext";

// // Screens
// import LoginScreen from "./src/screens/LoginScreen";
// import DashboardScreen from "./src/screens/DashboardScreen";
// import MeetingFormScreen from "./src/screens/MeetingFormScreen";
// import ApprovalsScreen from "./src/screens/ApprovalsScreen";
// import ReportsScreen from "./src/screens/ReportsScreen";

// const Stack = createStackNavigator();

// const theme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: "#007AFF",
//     accent: "#03DAC6",
//   },
// };

// //  Inner App that reacts to AuthContext
// function MainNavigator() {
//   const { token } = React.useContext(AuthContext);
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     // Give a small delay for AuthContext to load from AsyncStorage
//     const timer = setTimeout(() => setLoading(false), 800);
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {!token ? (
//         //  User not logged in → show Login
//         <Stack.Screen name="Login" component={LoginScreen} />
//       ) : (
//         //  User logged in → show Dashboard flow
//         <>
//           <Stack.Screen name="Dashboard" component={DashboardScreen} />
//           <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
//           <Stack.Screen name="Approvals" component={ApprovalsScreen} />
//           <Stack.Screen name="Reports" component={ReportsScreen} />
//         </>
//       )}
//     </Stack.Navigator>
//   );
// }

// //  Wrap entire app in providers
// export default function App() {
//   return (
//     <PaperProvider theme={theme}>
//       <AuthProvider>
//         <NavigationContainer>
//           <MainNavigator />
//         </NavigationContainer>
//       </AuthProvider>
//     </PaperProvider>
//   );
// }











// // App.tsx
// import * as React from "react";
// import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { useContext } from "react";
// import { AuthProvider, AuthContext } from "./src/contexts/AuthContext";

// // Screens
// import LoginScreen from "./src/screens/LoginScreen";
// import DashboardScreen from "./src/screens/DashboardScreen";
// import MeetingFormScreen from "./src/screens/MeetingFormScreen";
// import ApprovalsScreen from "./src/screens/ApprovalsScreen";
// import ReportsScreen from "./src/screens/ReportsScreen";

// const Stack = createStackNavigator();

// const theme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: "#007AFF",
//     accent: "#03DAC6",
//   },
// };

// // 🔹 Handles navigation based on login status
// function RootNavigator() {
//   const { token } = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {token ? (
//           <>
//             <Stack.Screen name="Dashboard" component={DashboardScreen} />
//             <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
//             <Stack.Screen name="Approvals" component={ApprovalsScreen} />
//             <Stack.Screen name="Reports" component={ReportsScreen} />
//           </>
//         ) : (
//           <Stack.Screen name="Login" component={LoginScreen} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default function App() {
//   return (
//     <PaperProvider theme={theme}>
//       <AuthProvider>
//         <RootNavigator />
//       </AuthProvider>
//     </PaperProvider>
//   );
// }





// // App.tsx
// import * as React from "react";
// import { Provider as PaperProvider } from "react-native-paper";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { AuthProvider } from "./src/contexts/AuthContext";
// import LoginScreen from "./src/screens/LoginScreen";
// import DashboardScreen from "./src/screens/DashboardScreen";
// import MeetingFormScreen from "./src/screens/MeetingFormScreen";

// // Optional: define a simple paper theme
// import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// const theme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: "#007AFF",
//     accent: "#03DAC6",
//   },
// };

// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <AuthProvider>
//       <PaperProvider theme={theme}>
//         <NavigationContainer>
//           <Stack.Navigator screenOptions={{ headerShown: false }}>
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="Dashboard" component={DashboardScreen} />
//             <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </PaperProvider>
//     </AuthProvider>
//   );
// }

 
// import React from 'react';
// import { Provider as PaperProvider } from 'react-native-paper';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import LoginScreen from './src/screens/LoginScreen';
// import DashboardScreen from './src/screens/DashboardScreen';
// import MeetingFormScreen from './src/screens/MeetingFormScreen';
// import MeetingDetailScreen from './src/screens/MeetingDetailScreen';
// import ApprovalsScreen from './src/screens/ApprovalsScreen';
// import { AuthProvider } from './src/contexts/AuthContext';


// const Stack = createNativeStackNavigator();


// export default function App() {
// return (
// <AuthProvider>
// <PaperProvider>
// <NavigationContainer>
// <Stack.Navigator screenOptions={{ headerShown: false }}>
// <Stack.Screen name="Login" component={LoginScreen} />
// <Stack.Screen name="Dashboard" component={DashboardScreen} />
// <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
// <Stack.Screen name="MeetingDetail" component={MeetingDetailScreen} />
// <Stack.Screen name="Approvals" component={ApprovalsScreen} />
// </Stack.Navigator>
// </NavigationContainer>
// </PaperProvider>
// </AuthProvider>
// );
// }



// // // App.tsx


// import React, { useContext } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { AuthContext, AuthProvider } from "./src/contexts/AuthContext";

// import LoginScreen from "./src/screens/LoginScreen";
// import Dashboard from "./src/screens/DashboardScreen";
// import DashboardScreen from "./src/screens/DashboardScreen";

// const Stack = createStackNavigator();

// function AppNavigator() {
//   const { token } = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {token ? (
//           <Stack.Screen name="Dashboard" component={DashboardScreen} />
//         ) : (
//           <Stack.Screen name="Login" component={LoginScreen} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <AppNavigator />
//     </AuthProvider>
//   );
// }



// import React, { useContext } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { AuthContext, AuthProvider } from "./src/contexts/AuthContext";

// import LoginScreen from "./src/screens/LoginScreen";
// import DashboardScreen from "./src/screens/DashboardScreen"; // Only one import

// const Stack = createStackNavigator();

// function AppNavigator() {
//   const { token } = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {token ? (
//           <Stack.Screen name="Dashboard" component={DashboardScreen} />
//         ) : (
//           <Stack.Screen name="Login" component={LoginScreen} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <AppNavigator />
//     </AuthProvider>
//   );
// }


// App.tsx
// App.tsx
// import React from 'react';
// import AppNavigator from './src/navigation/AppNavigator';
// import { AuthProvider } from './src/contexts/AuthContext';

// export default function App() {
//   return (
//     <AuthProvider>
//       <AppNavigator />
//     </AuthProvider>
//   );
// }

