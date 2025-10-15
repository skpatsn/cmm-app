
// // src/screens/DashboardScreen.tsx

// src/screens/DashboardScreen.tsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { FAB, Card, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';
import { getMeetingsForUser } from '../services/meetingsService';
import { roleQuickLinks } from '../constants/quickLinksConfig';
import { parseISO, isAfter, isBefore } from 'date-fns';

export default function DashboardScreen({ navigation }: any) {
  const { token, username, role, logout } = useContext(AuthContext);
  const [allMeetings, setAllMeetings] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'HISTORY'>('ALL');

  const fetchMeetings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMeetingsForUser(token);
      setAllMeetings(data);
      applyFilter(data, filter);
    } catch (err) {
      console.error(err);
      setAllMeetings([]);
      setMeetings([]);
      Alert.alert('Error', 'Failed to fetch meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  const applyFilter = (data: any[], filterType: 'ALL' | 'UPCOMING' | 'HISTORY') => {
    const now = new Date();
    let filtered: any[] = [];

    switch (filterType) {
      case 'ALL':
        filtered = data;
        break;
      case 'UPCOMING':
        filtered = data.filter((m) => {
          if (!m.date) return false;
          const meetingDate = parseISO(m.date);
          return isAfter(meetingDate, now) && m.status !== 'completed';
        });
        break;
      case 'HISTORY':
        filtered = data.filter((m) => {
          if (!m.date) return m.status === 'completed';
          const meetingDate = parseISO(m.date);
          return isBefore(meetingDate, now) || m.status === 'completed';
        });
        break;
    }

    setMeetings(filtered);
  };

  useEffect(() => {
    applyFilter(allMeetings, filter);
  }, [filter, allMeetings]);

  useEffect(() => {
    if (!token) return;
    fetchMeetings();
  }, [token, fetchMeetings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeetings();
    setRefreshing(false);
  };

  const quickLinks = roleQuickLinks[role || 'USER'];

  const renderMeetingCard = ({ item }: any) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate("MeetingDetail", { id: item.id })}
    >
      <Card.Title
        title={item.title?.trim() || "Untitled"}
        subtitle={`Date: ${item.date || "N/A"} | Status: ${item.status || "Pending"}`}
        left={(props) => (
          <Avatar.Text
            {...props}
            label={(item.title?.trim()[0]?.toUpperCase()) || "?"}
          />
        )}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard — {username || role}</Text>

      <Button mode="outlined" onPress={logout} style={{ marginBottom: 16 }}>
        Logout
      </Button>

      <View style={styles.quickLinksContainer}>
        {quickLinks.map((link) => (
          <TouchableOpacity
            key={link.label}
            style={styles.quickLink}
            onPress={() => navigation.navigate(link.route)}
          >
            <Avatar.Icon
              size={36}
              icon={link.icon}
              style={{ backgroundColor: '#6200ee', marginBottom: 6 }}
            />
            <Text style={styles.quickLinkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filtersContainer}>
        {['ALL', 'UPCOMING', 'HISTORY'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={{ color: filter === f ? '#fff' : '#6200ee', fontWeight: '600' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator animating color="#6200ee" size="large" style={{ marginTop: 20 }} />
      ) : meetings.length === 0 ? (
        <Text style={styles.emptyText}>No meetings found.</Text>
      ) : (
        <FlatList
          data={meetings}
          renderItem={renderMeetingCard}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Meeting"
        onPress={() => navigation.navigate('MeetingForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  quickLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'space-between'
  },
  quickLink: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 3
  },
  quickLinkText: { marginTop: 4, fontWeight: '600', textAlign: 'center' },
  filtersContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#6200ee' },
  activeFilter: { backgroundColor: '#6200ee' },
  card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
  emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#888' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});


// // src/screens/DashboardScreen.tsx
// import React, { useContext, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   RefreshControl,
// } from 'react-native';
// import { FAB, Card, Avatar, ActivityIndicator, Button } from 'react-native-paper';
// import { AuthContext } from '../contexts/AuthContext';
// import { getMeetingsForUser } from '../services/meetingsService';
// import { roleQuickLinks } from '../constants/quickLinksConfig';
// import { parseISO, isAfter, isBefore } from 'date-fns';

// export default function DashboardScreen({ navigation }: any) {
//   const { token, username, role, logout } = useContext(AuthContext);
//   const [allMeetings, setAllMeetings] = useState<any[]>([]);
//   const [meetings, setMeetings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'HISTORY'>('ALL');

//   // Fetch all meetings once
//   const fetchMeetings = useCallback(async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const data = await getMeetingsForUser(token);
//       setAllMeetings(data);
//       applyFilter(data, filter);
//     } catch (err) {
//       console.error(err);
//       setAllMeetings([]);
//       setMeetings([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, filter]);

//   // Apply filter
//   const applyFilter = (data: any[], filterType: 'ALL' | 'UPCOMING' | 'HISTORY') => {
//     const now = new Date();
//     let filtered: any[] = [];

//     switch (filterType) {
//       case 'ALL':
//         filtered = data;
//         break;
//       case 'UPCOMING':
//         filtered = data.filter((m) => {
//           if (!m.date) return false; // skip if date missing
//           const meetingDate = parseISO(m.date);
//           return isAfter(meetingDate, now) && m.status !== 'completed';
//         });
//         break;

//       case 'HISTORY':
//         filtered = data.filter((m) => {
//           if (!m.date) return m.status === 'completed'; // consider completed without date as history
//           const meetingDate = parseISO(m.date);
//           return isBefore(meetingDate, now) || m.status === 'completed';
//         });
//         break;
//           }

//     setMeetings(filtered);
//   };

//   // Refresh when filter changes
//   useEffect(() => {
//     applyFilter(allMeetings, filter);
//   }, [filter, allMeetings]);

//   useEffect(() => {
//     if (!token) return;
//     fetchMeetings();
//   }, [token, fetchMeetings]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchMeetings();
//     setRefreshing(false);
//   };

//   const quickLinks = roleQuickLinks[role || 'USER'];

//   const renderMeetingCard = ({ item }: any) => (
//     <Card
//       style={styles.card}
//       onPress={() => navigation.navigate("MeetingDetail", { id: item.id })}
//     >
//       <Card.Title
//         title={item.title || "Untitled"}
//         subtitle={`Date: ${item.date || "N/A"} | Status: ${item.status || "Pending"}`}
//         left={(props) => (
//           <Avatar.Text
//             {...props}
//             label={(item.title && item.title[0]) || "?"}
//           />
//         )}
//       />
//     </Card>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard — {username || role}</Text>

//       {/* Manual Logout */}
//       <Button mode="outlined" onPress={logout} style={{ marginBottom: 16 }}>
//         Logout
//       </Button>

//       {/* Quick Links */}
//       <View style={styles.quickLinksContainer}>
//         {quickLinks.map((link) => (
//           <TouchableOpacity
//             key={link.label}
//             style={styles.quickLink}
//             onPress={() => navigation.navigate(link.route)}
//           >
//             <Avatar.Icon
//               size={36}
//               icon={link.icon}
//               style={{ backgroundColor: '#6200ee', marginBottom: 6 }}
//             />
//             <Text style={styles.quickLinkText}>{link.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Filters */}
//       <View style={styles.filtersContainer}>
//         {['ALL', 'UPCOMING', 'HISTORY'].map((f) => (
//           <TouchableOpacity
//             key={f}
//             style={[styles.filterBtn, filter === f && styles.activeFilter]}
//             onPress={() => setFilter(f as any)}
//           >
//             <Text style={{ color: filter === f ? '#fff' : '#6200ee' }}>{f}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Meetings List */}
//       {loading ? (
//         <ActivityIndicator animating color="#6200ee" size="large" style={{ marginTop: 20 }} />
//       ) : meetings.length === 0 ? (
//         <Text style={styles.emptyText}>No meetings found.</Text>
//       ) : (
//         <FlatList
//           data={meetings}
//           renderItem={renderMeetingCard}
//           keyExtractor={(item) => String(item.id)}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         />
//       )}

//       <FAB
//         style={styles.fab}
//         icon="plus"
//         label="New Meeting"
//         onPress={() => navigation.navigate('MeetingForm')}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
//   title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
//   quickLinksContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//     justifyContent: 'space-between'
//   },
//   quickLink: {
//     width: '30%',
//     alignItems: 'center',
//     marginVertical: 10,
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 12,
//     elevation: 3
//   },
//   quickLinkText: { marginTop: 4, fontWeight: '600', textAlign: 'center' },
//   filtersContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
//   filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#6200ee' },
//   activeFilter: { backgroundColor: '#6200ee' },
//   card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
//   emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#888' },
//   fab: { position: 'absolute', right: 16, bottom: 16 },
// });




// // src/screens/DashboardScreen.tsx
// import React, { useContext, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   RefreshControl,
// } from 'react-native';
// import { FAB, Card, Avatar, ActivityIndicator, Button } from 'react-native-paper';
// import { AuthContext } from '../contexts/AuthContext';
// import {
//   getMeetingsForUser,
//   getUpcomingMeetings,
//   getCompletedMeetings,
// } from '../services/meetingsService';
// import { roleQuickLinks } from '../constants/quickLinksConfig';

// export default function DashboardScreen({ navigation }: any) {
//   const { token, username, role, logout } = useContext(AuthContext);
//   const [meetings, setMeetings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'HISTORY'>('ALL');

//   // Fetch meetings when token or filter changes
//   const fetchMeetings = useCallback(async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       let data: any[] = [];
//       if (filter === 'ALL') data = await getMeetingsForUser(token);
//       else if (filter === 'UPCOMING') data = await getUpcomingMeetings(token);
//       else if (filter === 'HISTORY') data = await getCompletedMeetings(token);
//       setMeetings(data);
//     } catch (err) {
//       console.error(err);
//       setMeetings([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, filter]);

//   useEffect(() => {
//     if (!token) return;
//     fetchMeetings();
//   }, [token, fetchMeetings]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchMeetings();
//     setRefreshing(false);
//   };

//   const quickLinks = roleQuickLinks[role || 'USER'];

//   const renderMeetingCard = ({ item }: any) => (
//     <Card
//       style={styles.card}
//       onPress={() => navigation.navigate("MeetingDetail", { id: item.id })}
//     >
//       <Card.Title
//         title={item.title || "Untitled"}
//         subtitle={`Date: ${item.date || "N/A"} | Status: ${item.status || "Pending"}`}
//         left={(props) => (
//           <Avatar.Text
//             {...props}
//             label={(item.title && item.title[0]) || "?"}
//           />
//         )}
//       />
//     </Card>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard — {username || role}</Text>

//       {/* Manual Logout */}
//       <Button mode="outlined" onPress={logout} style={{ marginBottom: 16 }}>
//         Logout
//       </Button>

//       {/* Quick Links */}
//       <View style={styles.quickLinksContainer}>
//         {quickLinks.map((link) => (
//           <TouchableOpacity
//             key={link.label}
//             style={styles.quickLink}
//             onPress={() => navigation.navigate(link.route)}
//           >
//             <Avatar.Icon
//               size={36}
//               icon={link.icon}
//               style={{ backgroundColor: '#6200ee', marginBottom: 6 }}
//             />
//             <Text style={styles.quickLinkText}>{link.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Filters */}
//       <View style={styles.filtersContainer}>
//         {['ALL', 'UPCOMING', 'HISTORY'].map((f) => (
//           <TouchableOpacity
//             key={f}
//             style={[styles.filterBtn, filter === f && styles.activeFilter]}
//             onPress={() => setFilter(f as any)}
//           >
//             <Text style={{ color: filter === f ? '#fff' : '#6200ee' }}>{f}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Meetings List */}
//       {loading ? (
//         <ActivityIndicator animating color="#6200ee" size="large" style={{ marginTop: 20 }} />
//       ) : meetings.length === 0 ? (
//         <Text style={styles.emptyText}>No meetings found.</Text>
//       ) : (
//         <FlatList
//           data={meetings}
//           renderItem={renderMeetingCard}
//           keyExtractor={(item) => String(item.id)}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         />
//       )}

//       <FAB
//         style={styles.fab}
//         icon="plus"
//         label="New Meeting"
//         onPress={() => navigation.navigate('MeetingForm')}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
//   title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
//   quickLinksContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//     justifyContent: 'space-between'
//   },
//   quickLink: {
//     width: '30%',
//     alignItems: 'center',
//     marginVertical: 10,
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 12,
//     elevation: 3
//   },
//   quickLinkText: { marginTop: 4, fontWeight: '600', textAlign: 'center' },
//   filtersContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
//   filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#6200ee' },
//   activeFilter: { backgroundColor: '#6200ee' },
//   card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
//   emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#888' },
//   fab: { position: 'absolute', right: 16, bottom: 16 },
// });


// // src/screens/DashboardScreen.tsx
// import React, { useContext, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   RefreshControl,
// } from 'react-native';
// import { FAB, Card, Avatar, ActivityIndicator } from 'react-native-paper';
// import { AuthContext } from '../contexts/AuthContext';
// import {
//   getMeetingsForUser,
//   getUpcomingMeetings,
//   getCompletedMeetings,
// } from '../services/meetingsService';
// import { roleQuickLinks } from '../constants/quickLinksConfig';


// export default function DashboardScreen({ navigation }: any) {
//   const { user } = useContext(AuthContext);
//   const [meetings, setMeetings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'HISTORY'>('ALL');

//   useEffect(() => {
//     if (!user?.token) { console.log("no token"); return; } // wait until token exists
//   fetchMeetings();
//   }, [user]);

//   const fetchMeetings = useCallback(async () => {
//     if (!user?.token) return;
//     setLoading(true);
//     try {
//       let data: any[] = [];
//       if (filter === 'ALL') data = await getMeetingsForUser();
//       else if (filter === 'UPCOMING') data = await getUpcomingMeetings();
//       else if (filter === 'HISTORY') data = await getCompletedMeetings();
//       setMeetings(data);
//     } catch (err) {
//       console.error(err);
//       setMeetings([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [user, filter]);

//   useEffect(() => {
//     fetchMeetings();
//   }, [fetchMeetings]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchMeetings();
//     setRefreshing(false);
//   };

//   const quickLinks = roleQuickLinks[user?.role || 'USER'];

//   const renderMeetingCard = ({ item }: any) => (
//   <Card
//     style={styles.card}
//     onPress={() => navigation.navigate("MeetingDetail", { id: item.id })}
//   >
//     <Card.Title
//       title={item.title || "Untitled"}
//       subtitle={`Date: ${item.date || "N/A"} | Status: ${item.status || "Pending"}`}
//       left={(props) => (
//         <Avatar.Text
//           {...props}
//           label={(item.title && item.title[0]) || "?"} // safe fallback
//         />
//       )}
//     />
//   </Card>
// );


//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard — {user?.username || user?.role}</Text>

//       {/* Quick Links */}
//       <View style={styles.quickLinksContainer}>
//         {quickLinks.map((link) => (
//           <TouchableOpacity
//             key={link.label}
//             style={styles.quickLink}
//             onPress={() => navigation.navigate(link.route)}
//           >
//             <Avatar.Icon size={36} icon={link.icon} style={{ backgroundColor: '#6200ee', marginBottom: 6 }} />
//             <Text style={styles.quickLinkText}>{link.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Filters */}
//       <View style={styles.filtersContainer}>
//         {['ALL', 'UPCOMING', 'HISTORY'].map((f) => (
//           <TouchableOpacity
//             key={f}
//             style={[styles.filterBtn, filter === f && styles.activeFilter]}
//             onPress={() => setFilter(f as any)}
//           >
//             <Text style={{ color: filter === f ? '#fff' : '#6200ee' }}>{f}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Meetings List */}
//       {loading ? (
//         <ActivityIndicator animating color="#6200ee" size="large" style={{ marginTop: 20 }} />
//       ) : meetings.length === 0 ? (
//         <Text style={styles.emptyText}>No meetings found.</Text>
//       ) : (
//         <FlatList
//           data={meetings}
//           renderItem={renderMeetingCard}
//           keyExtractor={(item) => String(item.id)}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         />
//       )}

//       <FAB
//         style={styles.fab}
//         icon="plus"
//         label="New Meeting"
//         onPress={() => navigation.navigate('MeetingForm')}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
//   title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
//   quickLinksContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, justifyContent: 'space-between' },
//   quickLink: { width: '30%', alignItems: 'center', marginVertical: 10, backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 3 },
//   quickLinkText: { marginTop: 4, fontWeight: '600', textAlign: 'center' },
//   filtersContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
//   filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#6200ee' },
//   activeFilter: { backgroundColor: '#6200ee' },
//   card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
//   emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#888' },
//   fab: { position: 'absolute', right: 16, bottom: 16 },
// });




















// import React, { useContext, useEffect, useState } from 'react';
// import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { FAB, Card, Avatar } from 'react-native-paper';
// import { AuthContext } from '../contexts/AuthContext';
// import axios from 'axios';

// export default function DashboardScreen({ navigation }: any) {
//   const { user } = useContext(AuthContext);
//   const [meetings, setMeetings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch meetings for dashboard
//     const fetchMeetings = async () => {
//       try {
//         // Replace with your API
//         const response = await axios.get(`https://api.example.com/meetings?role=${user?.role}`);
//         setMeetings(Array.isArray(response.data) ? response.data : []);
//       } catch (err) {
//         console.log('Error fetching meetings', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMeetings();
//   }, [user]);

//   const renderQuickLink = (label: string, icon: string, route: string) => (
//     <TouchableOpacity
//       style={styles.quickLink}
//       onPress={() => navigation.navigate(route)}
//     >
//       <Avatar.Icon size={36} icon={icon} style={{ backgroundColor: '#6200ee', marginBottom: 6 }} />
//       <Text style={styles.quickLinkText}>{label}</Text>
//     </TouchableOpacity>
//   );

//   const renderMeetingCard = ({ item }: any) => (
//     <Card style={styles.card} onPress={() => navigation.navigate('MeetingDetail', { id: item.id })}>
//       <Card.Title
//         title={item.title}
//         subtitle={`Date: ${item.date} | Status: ${item.status}`}
//         left={(props) => <Avatar.Text {...props} label={item.title[0]} />}
//       />
//     </Card>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard — {user?.role}</Text>

//       {/* Role-based quick links */}
//       <View style={styles.quickLinksContainer}>
//         {user?.role !== 'USER' && renderQuickLink('Approvals', 'check', 'Approvals')}
//         {renderQuickLink('Schedule Meeting', 'calendar-plus', 'MeetingForm')}
//         {renderQuickLink('Reports', 'file-chart', 'Reports')}
//         {user?.role === 'MGMT' && renderQuickLink('Analytics', 'chart-line', 'Analytics')}
//       </View>

//       {/* Meetings List */}
//       <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
//       <FlatList
//         data={meetings}
//         renderItem={renderMeetingCard}
//         keyExtractor={(item) => item.id}
//         ListEmptyComponent={
//           !loading ? <Text style={styles.emptyText}>No meetings scheduled.</Text> : <Text style={styles.emptyText}>Loading...</Text>
//         }
//       />

//       {/* FAB */}
//       <FAB
//         style={styles.fab}
//         icon="plus"
//         label="New Meeting"
//         onPress={() => navigation.navigate('MeetingForm')}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
//   title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
//   quickLinksContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, justifyContent: 'space-between' },
//   quickLink: {
//     width: '30%',
//     alignItems: 'center',
//     marginVertical: 10,
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   quickLinkText: { marginTop: 4, fontWeight: '600', textAlign: 'center' },
//   sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
//   card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
//   emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#888' },
//   fab: { position: 'absolute', right: 16, bottom: 16 },
// });
// // will show summary of meetings, quick links based on role (USER, HO, MGMT). Quick links for USER: Schedule meeting, Reports. For HO: Approvals, Schedule meeting, Reports. For MGMT: Analytics, Approvals, Schedule meeting, Reports.

// // src/screens/DashboardScreen.tsx
// import React, { useContext, useEffect, useState, useCallback } from "react";
// import { View, FlatList, Text, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
// import { FAB, Card, Avatar, ActivityIndicator } from "react-native-paper";
// import { AuthContext } from "../contexts/AuthContext";
// import { getMeetingsForUser } from "../services/meetingsService";
// import { roleQuickLinks } from "../constants/quickLinksConfig";

// export default function DashboardScreen({ navigation }: any) {
//   const { user } = useContext(AuthContext);
//   const [meetings, setMeetings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchMeetings = useCallback(async () => {
//     if (!user?.id || !user?.role) return;
//     setLoading(true);
//     const data = await getMeetingsForUser(user.id, user.role);
//     setMeetings(data);
//     setLoading(false);
//   }, [user]);

//   useEffect(() => {
//     fetchMeetings();
//   }, [fetchMeetings]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchMeetings();
//     setRefreshing(false);
//   };

//   const renderQuickLink = (label: string, icon: string, route: string) => (
//     <TouchableOpacity
//       key={label}
//       style={styles.quickLink}
//       onPress={() => navigation.navigate(route)}
//     >
//       <Avatar.Icon
//         size={36}
//         icon={icon}
//         style={{ backgroundColor: "#6200ee", marginBottom: 6 }}
//       />
//       <Text style={styles.quickLinkText}>{label}</Text>
//     </TouchableOpacity>
//   );

//   const renderMeetingCard = ({ item }: any) => (
//     <Card
//       style={styles.card}
//       onPress={() => navigation.navigate("MeetingDetail", { id: item.id })}
//     >
//       <Card.Title
//         title={item.title}
//         subtitle={`Date: ${item.date} | Status: ${item.status}`}
//         left={(props) => <Avatar.Text {...props} label={item.title[0]} />}
//       />
//     </Card>
//   );

//   const quickLinks = roleQuickLinks[user?.role || "USER"];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard — {user?.name || user?.role}</Text>

//       {/* Quick Links */}
//       <View style={styles.quickLinksContainer}>
//         {quickLinks.map((link) => renderQuickLink(link.label, link.icon, link.route))}
//       </View>

//       {/* Optional MGMT Analytics Snapshot */}
//       {user?.role === "MGMT" && (
//         <Card style={styles.analyticsCard}>
//           <Card.Content>
//             <Text>Total Meetings: {meetings.length}</Text>
//             <Text>Pending Approvals: 4</Text>
//           </Card.Content>
//         </Card>
//       )}

//       {/* Meetings Section */}
//       <Text style={styles.sectionTitle}>Your Upcoming Meetings</Text>

//       {loading ? (
//         <ActivityIndicator animating color="#6200ee" size="large" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={meetings}
//           renderItem={renderMeetingCard}
//           keyExtractor={(item) => String(item.id)}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No meetings scheduled.</Text>
//           }
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         />
//       )}

//       {/* FAB */}
//       <FAB
//         style={styles.fab}
//         icon="plus"
//         label="New Meeting"
//         onPress={() => navigation.navigate("MeetingForm")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
//   title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
//   quickLinksContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 20,
//     justifyContent: "space-between",
//   },
//   quickLink: {
//     width: "30%",
//     alignItems: "center",
//     marginVertical: 10,
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   quickLinkText: { marginTop: 4, fontWeight: "600", textAlign: "center" },
//   analyticsCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     paddingVertical: 8,
//     marginBottom: 16,
//     elevation: 2,
//   },
//   sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
//   card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 20,
//     fontStyle: "italic",
//     color: "#888",
//   },
//   fab: { position: "absolute", right: 16, bottom: 16 },
// });
//////////////////////////////////////////////////////////////////////////  ---> move to top::

// // src/screens/DashboardScreen.tsx
// import React, { useContext, useEffect, useState, useCallback } from "react";
// import { View, FlatList, Text, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
// import { FAB, Card, Avatar, ActivityIndicator, Button } from "react-native-paper";
// import { AuthContext } from "../contexts/AuthContext";
// // import { getMeetingsForUser } from "../services/meetingsService";
// import { roleQuickLinks } from "../constants/quickLinksConfig";
// import { getMeetingsForUser, getUpcomingMeetings, getCompletedMeetings } from "../services/meetingsService";

// type Meeting = {
//   id: string;
//   title: string;
//   date: string;
//   status: string;
// };

// export default function DashboardScreen({ navigation }: any) {
//   const { user } = useContext(AuthContext);
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "HISTORY">("ALL");

//   const fetchMeetings = useCallback(async () => {
//     if (!user?.id || !user?.role) return;
//     setLoading(true);
//     try {
//       const data = await getMeetingsForUser(user.id, user.role);
//       setMeetings(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   const filterMeetings = async () => {
//   setLoading(true);
//   try {
//     if (filter === "ALL") setFilteredMeetings(await getMeetingsForUser());
//     else if (filter === "UPCOMING") setFilteredMeetings(await getUpcomingMeetings());
//     else if (filter === "HISTORY") setFilteredMeetings(await getCompletedMeetings());
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setLoading(false);
//   }
//   } ;
//   useEffect(() => {
//     fetchMeetings();
//   }, [fetchMeetings]);

//   useEffect(() => {
//     filterMeetings();
//   }, [meetings, filter]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchMeetings();
//     setRefreshing(false);
//   };

//   // const filterMeetings = () => {
//   //   if (filter === "ALL") {
//   //     setFilteredMeetings(meetings);
//   //   } else if (filter === "UPCOMING") {
//   //     const now = new Date();
//   //     setFilteredMeetings(meetings.filter((m) => new Date(m.date) >= now));
//   //   } else if (filter === "HISTORY") {
//   //     const now = new Date();
//   //     setFilteredMeetings(meetings.filter((m) => new Date(m.date) < now));
//   //   }
//   // };

//   const renderQuickLink = (label: string, icon: string, route: string) => (
//     <TouchableOpacity
//       key={label}
//       style={styles.quickLink}
//       onPress={() => navigation.navigate(route)}
//     >
//       <Avatar.Icon
//         size={36}
//         icon={icon}
//         style={{ backgroundColor: "#6200ee", marginBottom: 6 }}
//       />
//       <Text style={styles.quickLinkText}>{label}</Text>
//     </TouchableOpacity>
//   );

//   const renderMeetingCard = ({ item }: { item: Meeting }) => (
//     <Card
//       style={styles.card}
//       onPress={() => navigation.navigate("MeetingDetail", { id: item.id })}
//     >
//       <Card.Title
//         title={item.title}
//         subtitle={`Date: ${item.date} | Status: ${item.status}`}
//         left={(props) => <Avatar.Text {...props} label={item.title[0]} />}
//       />
//     </Card>
//   );

//   const quickLinks = roleQuickLinks[user?.role || "USER"];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard — {user?.name || user?.role}</Text>

//       {/* Quick Links */}
//       <View style={styles.quickLinksContainer}>
//         {quickLinks.map((link) => renderQuickLink(link.label, link.icon, link.route))}
//       </View>

//       {/* Filter Buttons */}
//       <View style={styles.filterContainer}>
//         {(["ALL", "UPCOMING", "HISTORY"] as const).map((f) => (
//           <Button
//             key={f}
//             mode={filter === f ? "contained" : "outlined"}
//             onPress={() => setFilter(f)}
//             style={styles.filterButton}
//           >
//             {f}
//           </Button>
//         ))}
//       </View>

//       {/* Meetings Section */}
//       <Text style={styles.sectionTitle}>
//         {filter === "ALL" ? "All Meetings" : filter === "UPCOMING" ? "Upcoming Meetings" : "Meeting History"}
//       </Text>

//       {loading ? (
//         <ActivityIndicator animating color="#6200ee" size="large" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={filteredMeetings}
//           renderItem={renderMeetingCard}
//           keyExtractor={(item) => String(item.id)}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No meetings found.</Text>
//           }
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         />
//       )}

//       {/* FAB */}
//       <FAB
//         style={styles.fab}
//         icon="plus"
//         label="New Meeting"
//         onPress={() => navigation.navigate("MeetingForm")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
//   title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
//   quickLinksContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12, justifyContent: "space-between" },
//   quickLink: { width: "30%", alignItems: "center", marginVertical: 6, backgroundColor: "#fff", padding: 12, borderRadius: 12, elevation: 3 },
//   quickLinkText: { marginTop: 4, fontWeight: "600", textAlign: "center" },
//   filterContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
//   filterButton: { flex: 1, marginHorizontal: 4 },
//   sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
//   card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
//   emptyText: { textAlign: "center", marginTop: 20, fontStyle: "italic", color: "#888" },
//   fab: { position: "absolute", right: 16, bottom: 16 },
// });





// // src/screens/DashboardScreen.tsx
// import React, { useContext } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { AuthContext } from '../contexts/AuthContext';

// export default function DashboardScreen({ navigation }) {
//   const { user, logout } = useContext(AuthContext);
//   const role = user?.role || 'USER';

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome, {role}</Text>

//       <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MeetingForm')}>
//         <Text style={styles.cardText}>Schedule Meeting</Text>
//       </TouchableOpacity>

//       {role !== 'USER' && (
//         <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Approvals')}>
//           <Text style={styles.cardText}>View Approvals</Text>
//         </TouchableOpacity>
//       )}

//       <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Reports')}>
//         <Text style={styles.cardText}>Reports</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.logout} onPress={logout}>
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: '#F0F3F8' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   card: {
//     backgroundColor: '#007AFF',
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 15,
//   },
//   cardText: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: '600' },
//   logout: { marginTop: 40, alignSelf: 'center' },
//   logoutText: { color: '#FF3B30', fontWeight: 'bold' },
// });
// // will show summary of meetings, quick links based on role (USER, HO, MGMT). Quick links for USER: Schedule meeting, Reports. For HO: Approvals, Schedule meeting, Reports. For MGMT: Analytics, Approvals, Schedule meeting, Reports.


// // src/screens/DashboardScreen.tsx
// import React, { useContext, useEffect, useState } from "react";
// import { ScrollView, RefreshControl, View } from "react-native";
// import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
// import { AuthContext } from "../contexts/AuthContext";
// import api from "../utils/api";
// import { format } from "date-fns";

// export default function DashboardScreen({ navigation }: any) {
//   const { token, logout } = useContext(AuthContext);
//   const [meetings, setMeetings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchMeetings = async () => {
//     try {
//       const res = await api.get("/meetings/");
//       setMeetings(res.data as any[]);
//     } catch (e) {
//       console.log("Fetch meetings error:", e);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchMeetings();
//   }, []);

//   const groupByStatus = (status: string) =>
//     meetings.filter((m) => m.status?.toUpperCase() === status.toUpperCase());

//   const openMeetings = groupByStatus("OPEN");
//   const approvedMeetings = groupByStatus("APPROVED");
//   const historyMeetings = groupByStatus("HISTORICAL");

//   const onEdit = (meeting: any) => {
//     if (meeting.status === "HISTORICAL") return;
//     navigation.navigate("MeetingFormScreen", { meeting });
//   };

//   return (
//     <ScrollView
//       style={{ flex: 1, padding: 12 }}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMeetings} />}
//     >
//       <Button
//         icon="plus-circle"
//         mode="contained"
//         onPress={() => navigation.navigate("MeetingFormScreen")}
//         style={{ marginBottom: 20 }}
//       >
//         New Meeting
//       </Button>

//       {loading ? (
//         <ActivityIndicator animating size="large" style={{ marginTop: 30 }} />
//       ) : (
//         <>
//           <Section title="🟡 Open Meetings" data={openMeetings} onEdit={onEdit} />
//           <Section title="🟢 Approved Meetings" data={approvedMeetings} onEdit={onEdit} />
//           <Section title="📘 History" data={historyMeetings} onEdit={onEdit} editable={false} />
//         </>
//       )}

//       <Button
//         icon="logout"
//         mode="outlined"
//         onPress={logout}
//         style={{ marginTop: 30 }}
//         textColor="red"
//       >
//         Logout
//       </Button>
//     </ScrollView>
//   );
// }

// function Section({ title, data, onEdit, editable = true }: any) {
//   if (!data.length) return null;

//   return (
//     <View style={{ marginBottom: 24 }}>
//       <Text variant="titleMedium" style={{ marginBottom: 8 }}>
//         {title}
//       </Text>
//       {data.map((m) => (
//         <Card key={m.id} style={{ marginBottom: 10 }}>
//           <Card.Content>
//             <Text variant="titleSmall">
//               {m.client_name} — {m.contact_person}
//             </Text>
//             <Text>
//               {format(new Date(m.meeting_date), "PP")} ({m.status})
//             </Text>
//             <Text>Purpose: {m.meeting_purpose}</Text>
//           </Card.Content>
//           {editable && (
//             <Card.Actions>
//               <Button onPress={() => onEdit(m)}>Edit</Button>
//             </Card.Actions>
//           )}
//         </Card>
//       ))}
//     </View>
//   );
// }
// // This screen shows a dashboard with meetings grouped by status (Open, Approved, Historical).
// // Users can refresh the list, create new meetings, edit existing ones (if not historical), and logout.