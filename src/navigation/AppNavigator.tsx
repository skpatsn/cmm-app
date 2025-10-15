// // // src/navigation/AppNavigator.tsx
// // import React, { useContext } from 'react';
// // import { NavigationContainer } from '@react-navigation/native';
// // import { createStackNavigator } from '@react-navigation/stack';

// // import LoginScreen from '../screens/LoginScreen';
// // import DashboardScreen from '../screens/DashboardScreen';
// // import MeetingFormScreen from '../screens/MeetingFormScreen';
// // import ApprovalsScreen from '../screens/ApprovalsScreen';
// // // import ReportsScreen from '../screens/ReportsScreen';

// // import { AuthContext } from '../contexts/AuthContext';

// // const Stack = createStackNavigator();

// // export default function AppNavigator() {
// //   const { user } = useContext(AuthContext);

// //   return (
// //     <NavigationContainer>
// //       <Stack.Navigator screenOptions={{ headerShown: true }}>
// //         {!user ? (
// //           // --- Public routes ---
// //           <Stack.Screen
// //             name="Login"
// //             component={LoginScreen}
// //             options={{ title: 'CMM Login' }}
// //           />
// //         ) : (
// //           // --- Authenticated routes ---
// //           <>
// //             <Stack.Screen
// //               name="Dashboard"
// //               component={DashboardScreen}
// //               options={{ title: 'Dashboard' }}
// //             />
// //             <Stack.Screen
// //               name="MeetingForm"
// //               component={MeetingFormScreen}
// //               options={{ title: 'Schedule Meeting' }}
// //             />
// //             <Stack.Screen
// //               name="Approvals"
// //               component={ApprovalsScreen}
// //               options={{ title: 'Approvals' }}
// //             />
// //             <Stack.Screen
// //               name="Reports"
// //               component={ReportsScreen}
// //               options={{ title: 'Reports' }}
// //             />
// //           </>
// //         )}
// //       </Stack.Navigator>
// //     </NavigationContainer>
// //   );
// // }


// // src/navigation/AppNavigator.tsx
// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';

// import { AuthContext } from '../contexts/AuthContext';
// import LoginScreen from '../screens/LoginScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import MeetingFormScreen from '../screens/MeetingFormScreen';
// import ApprovalsScreen from '../screens/ApprovalsScreen';
// // import ReportsScreen from '../screens/ReportsScreen';

// const Stack = createStackNavigator();

// export default function AppNavigator() {
//   const { user } = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: true }}>
//         {!user ? (
//           <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CMM Login' }} />
//         ) : (
//           <>
//             <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
//             <Stack.Screen name="MeetingForm" component={MeetingFormScreen} options={{ title: 'Schedule Meeting' }} />
//             <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
//             {/* <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} /> */}
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


// // src/navigation/AppNavigator.tsx
// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { AuthContext } from '../contexts/AuthContext';

// import LoginScreen from '../screens/LoginScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import MeetingFormScreen from '../screens/MeetingFormScreen';
// import ApprovalsScreen from '../screens/ApprovalsScreen';
// import ReportsScreen from '../screens/ReportsScreen';

// const Stack = createStackNavigator();

// const linking = {
//   prefixes: ['http://localhost:19006', 'https://cmm.localhost'],
//   config: {
//     screens: {
//       Login: 'login',
//       Dashboard: 'dashboard',
//       MeetingForm: 'meeting',
//       Approvals: 'approvals',
//       Reports: 'reports',
//     },
//   },
// };

// export default function AppNavigator() {
//   const { user } = useContext(AuthContext);

//   return (
//     <NavigationContainer linking={linking}>
//       <Stack.Navigator
//         screenOptions={{
//           headerShown: true,
//           headerBackTitleVisible: true,
//           gestureEnabled: true,
//         }}
//       >
//         {!user ? (
//           <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CMM Login' }} />
//         ) : (
//           <>
//             <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
//             <Stack.Screen name="MeetingForm" component={MeetingFormScreen} options={{ title: 'Schedule Meeting' }} />
//             <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
//             <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


// // src/navigation/AppNavigator.tsx
// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { AuthContext } from '../contexts/AuthContext';

// import LoginScreen from '../screens/LoginScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import MeetingFormScreen from '../screens/MeetingFormScreen';
// import ApprovalsScreen from '../screens/ApprovalsScreen';
// import ReportsScreen from '../screens/ReportsScreen';

// const Stack = createStackNavigator();

// const linking = {
//   prefixes: ['http://localhost:19006', 'https://cmm.localhost'],
//   config: {
//     screens: {
//       Login: 'login',
//       Dashboard: 'dashboard',
//       MeetingForm: 'meeting',
//       Approvals: 'approvals',
//       Reports: 'reports',
//     },
//   },
// };

// export default function AppNavigator() {
//   const { user } = useContext(AuthContext);

//   return (
//     <NavigationContainer linking={linking}>
//       <Stack.Navigator
//         screenOptions={{
//           headerShown: true,
//           headerBackTitleVisible: true,
//           gestureEnabled: true,
//         }}
//       >
//         {!user ? (
//           <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CMM Login' }} />
//         ) : (
//           <>
//             <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
//             <Stack.Screen name="MeetingForm" component={MeetingFormScreen} options={{ title: 'Schedule Meeting' }} />
//             <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
//             <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }



// // src/navigation/AppNavigator.tsx
// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { AuthContext } from '../contexts/AuthContext';

// import LoginScreen from '../screens/LoginScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import MeetingFormScreen from '../screens/MeetingFormScreen';
// import ApprovalsScreen from '../screens/ApprovalsScreen';
// import ReportsScreen from '../screens/ReportsScreen';

// const Stack = createStackNavigator();

// const linking = {
//   prefixes: ['http://localhost:19006', 'https://cmm.localhost'],
//   config: {
//     screens: {
//       Login: 'login',
//       Dashboard: 'dashboard',
//       MeetingForm: 'meeting',
//       Approvals: 'approvals',
//       Reports: 'reports',
//     },
//   },
// };

// export default function AppNavigator() {
//   const { user } = useContext(AuthContext);

//   return (
//     <NavigationContainer linking={linking}>
//       <Stack.Navigator
//         initialRouteName={user ? 'Dashboard' : 'Login'}
//         screenOptions={{
//           headerShown: true,
//           headerBackTitleVisible: true,
//           gestureEnabled: true,
//         }}
//       >
//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//           options={{ title: 'CMM Login' }}
//         />
//         <Stack.Screen
//           name="Dashboard"
//           component={DashboardScreen}
//           options={{ title: 'Dashboard' }}
//         />
//         <Stack.Screen
//           name="MeetingForm"
//           component={MeetingFormScreen}
//           options={{ title: 'Schedule Meeting' }}
//         />
//         <Stack.Screen
//           name="Approvals"
//           component={ApprovalsScreen}
//           options={{ title: 'Approvals' }}
//         />
//         <Stack.Screen
//           name="Reports"
//           component={ReportsScreen}
//           options={{ title: 'Reports' }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


// // src/navigation/AppNavigator.tsx
// import React, { useContext, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { AuthContext } from '../contexts/AuthContext';

// import LoginScreen from '../screens/LoginScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import MeetingFormScreen from '../screens/MeetingFormScreen';
// import ApprovalsScreen from '../screens/ApprovalsScreen';
// import ReportsScreen from '../screens/ReportsScreen';

// const Stack = createStackNavigator();

// export default function AppNavigator() {
//   const { user } = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName="Login"
//         screenOptions={{ headerShown: true }}
//       >
//         {/* All screens registered unconditionally */}
//         <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CMM Login' }} />
//         <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
//         <Stack.Screen name="MeetingForm" component={MeetingFormScreen} options={{ title: 'Schedule Meeting' }} />
//         <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
//         <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// // Note: Access control is now handled within individual screens based on user role.



// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';

// import LoginScreen from '../screens/LoginScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import MeetingFormScreen from '../screens/MeetingFormScreen';
// import ApprovalsScreen from '../screens/ApprovalsScreen';
// import ReportsScreen from '../screens/ReportsScreen';

// const Stack = createStackNavigator();

// export default function AppNavigator() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName="Login"
//         screenOptions={{ headerShown: true }}
//       >
//         {/* All screens always registered */}
//         <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CMM Login' }} />
//         <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
//         <Stack.Screen name="MeetingForm" component={MeetingFormScreen} options={{ title: 'Schedule Meeting' }} />
//         <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
//         <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// // Note: Access control is now managed within individual screens based on user role.



// src/navigation/AppNavigator.tsx
// src/navigation/AppNavigator.tsx
// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import { NavigationContainer } from '@react-navigation/native';
// import { navigationRef } from './RootNavigator';

// import LoginScreen from '../screens/LoginScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import MeetingFormScreen from '../screens/MeetingFormScreen';
// import ApprovalsScreen from '../screens/ApprovalsScreen';
// import ReportsScreen from '../screens/ReportsScreen';

// const Stack = createStackNavigator();

// export default function AppNavigator() {
//   return (
//     <NavigationContainer ref={navigationRef}>
//       <Stack.Navigator
//         initialRouteName="Login"
//         screenOptions={{ headerShown: true }}
//       >
//         <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CMM Login' }} />
//         <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
//         <Stack.Screen name="MeetingForm" component={MeetingFormScreen} options={{ title: 'Schedule Meeting' }} />
//         <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
//         <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

