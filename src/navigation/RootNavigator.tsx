// // src/navigation/RootNavigator.tsx
// import React, { useContext } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import LoginScreen from "../screens/LoginScreen";
// import DashboardScreen from "../screens/DashboardScreen";
// import MeetingFormScreen from "../screens/MeetingFormScreen";
// import { AuthContext } from "../contexts/AuthContext";

// const Stack = createStackNavigator();

// export default function RootNavigator() {
//   const { token } = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         {token ? (
//           <>
//             <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
//             <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
//           </>
//         ) : (
//           <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// // This navigator manages the app's navigation flow based on authentication status.
// // If the user is authenticated (token exists), it shows the Dashboard and MeetingForm screens.
// // Otherwise, it shows the Login screen.


// src/navigation/RootNavigation.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export function replace(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}
