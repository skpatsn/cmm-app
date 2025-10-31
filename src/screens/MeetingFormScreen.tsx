// covers Step 1 - Step 16)
// This file implements a grouped stepper form (fields grouped into logical sections). 
// It enforces the no-backdate rule and required fields, calculates travel cost from distance and per-km rate, and saves the meeting locally with a pending HO approval state.

// // // src/screens/MeetingFormScreen.tsx


import React, { useState, useContext, useEffect } from "react";
import {
  ScrollView,
  Alert,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Text, Menu } from "react-native-paper";
import { format } from "date-fns";
import { AuthContext } from "../contexts/AuthContext";
import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
import api from "../api/axiosConfig";

type MeetingStatus = "draft" | "pending" | "approved" | "rejected" | "completed";

type Meeting = {
  id: number;
  client_name: string;
  contact_person: string;
  designation: string;
  email: string;
  contact_number: string;
  location: string;
  meeting_purpose: string;
  discussion_summary?: string;
  visit_place?: string;
  path_of_travel?: string;
  distance_km?: number;
  expenses?: number;
  remarks?: string;
  start_time?: string;
  end_time?: string;
  status: "draft" | "pending" | "approved" | "rejected" | "completed";
  [key: string]: any; // fallback for any extra fields
};

export default function MeetingFormScreen({ navigation, route }: any) {
  const { token, logout, userLocation, user } = useContext(AuthContext);

  const editingMeeting = route.params?.meeting || null;
  const onSuccess = route.params?.onSuccess || null;

  const [loading, setLoading] = useState(false);

  // ---------- FORM STATES ----------
  const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
  const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
  const [designation, setDesignation] = useState(editingMeeting?.designation || "");
  const [email, setEmail] = useState(editingMeeting?.email || "");
  const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
  const [meetingLocation, setMeetingLocation] = useState(editingMeeting?.location || userLocation || "");
  const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
  const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
  const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
  const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
  const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
  const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
  const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");
  const [status, setStatus] = useState<MeetingStatus>(editingMeeting?.status || "draft");

  const [meetingDate, setMeetingDate] = useState<Date>(
    editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
  );
  const [startTime, setStartTime] = useState<Date>(
    editingMeeting?.start_time
      ? new Date(`1970-01-01T${editingMeeting.start_time}`)
      : new Date()
  );
  const [endTime, setEndTime] = useState<Date>(
    editingMeeting?.end_time
      ? new Date(`1970-01-01T${editingMeeting.end_time}`)
      : new Date(new Date().getTime() + 30 * 60000)
  );

  const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
  const [travelMenuVisible, setTravelMenuVisible] = useState(false);

  const RATE_PER_KM: Record<string, number> = {
    Car: 10,
    Bike: 5,
    Cab: 15,
    "Public Transport": 3,
    Walk: 0,
  };

  // ---------- Derived UI rules ----------
  const isNew = !editingMeeting;
  const canSeeAdvanced = status === "approved";
  const canEditAll = canSeeAdvanced;
  const canSubmitForApproval = isNew || (editingMeeting && status === "draft");

  // ---------- AUTO CALC EXPENSE ----------
  useEffect(() => {
    if (canEditAll) {
      const km = Number(distanceKm) || 0;
      const rate = RATE_PER_KM[pathOfTravel] || 0;
      setExpenses((km * rate).toFixed(2));
    }
  }, [distanceKm, pathOfTravel]);

  // ---------- LOAD MEETING (EDIT MODE OR via meetingId) ----------
  useEffect(() => {
    if (route.params?.meetingId && !editingMeeting) {
      (async () => {
        try {
          setLoading(true);
          const res = await api.get(`/meetings/${route.params.meetingId}/`, {
            headers: { Authorization: `Token ${token}` },
          });
          const m = res.data;
          setClientName(m.client_name || "");
          setPersonName(m.contact_person || "");
          setDesignation(m.designation || "");
          setEmail(m.email || "");
          setPhone(m.contact_number || "");
          setMeetingLocation(m.location || userLocation || "");
          setPlace(m.visit_place || "Office");
          setPurpose(m.meeting_purpose || "");
          setDiscussion(m.discussion_summary || "");
          setPathOfTravel(m.path_of_travel || "Car");
          setDistanceKm(m.distance_km?.toString() || "0");
          setExpenses(m.expenses?.toString() || "0");
          setRemarks(m.remarks || "");
          setMeetingDate(m.meeting_date ? new Date(m.meeting_date) : new Date());
          setStartTime(m.start_time ? new Date(`1970-01-01T${m.start_time}`) : new Date());
          setEndTime(m.end_time ? new Date(`1970-01-01T${m.end_time}`) : new Date(new Date().getTime() + 30 * 60000));
          setStatus(m.status || "draft");
        } catch (err) {
          Alert.alert("Error", "Failed to load meeting details.");
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [route.params?.meetingId]);

  // ---------- Helpers ----------
  const isPastMeeting = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const md = new Date(meetingDate);
    md.setHours(0, 0, 0, 0);
    return md < t;
  };

  // ---------- VALIDATION ----------
  const validateInitial = () => {
    if (!personName.trim()) return "Person name is required.";
    if (!designation.trim()) return "Designation is required.";
    if (!phone.trim()) return "Contact number is required.";
    if (!purpose.trim()) return "Meeting purpose is required.";
    if (!meetingLocation.trim()) return "Meeting location is required.";
    if (!email.trim()) return "Email is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format.";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const meetingDay = new Date(meetingDate);
    meetingDay.setHours(0, 0, 0, 0);
    if (meetingDay < today) return "Cannot select a past meeting date.";

    return null;
  };

  const validateAdvanced = () => {
    if (startTime >= endTime) return "Start time must be before end time.";
    return null;
  };

  // ---------- NOTIFICATIONS ----------
  const notifyApprovers = async (meetingData: any) => {
    try {
      await api.post(
        "/notifications/notify/",
        {
          roles: ["HO", "MGMT"],
          title: "Meeting Approval Requested",
          message: `Approval requested for meeting with ${meetingData.contact_person || meetingData.client_name}`,
          payload: { meeting_id: meetingData.id },
        },
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (err) {
      console.log("notifyApprovers error:", err?.response?.data || err);
    }
  };

  // ---------- SUBMIT ----------
  const submitMeeting = async () => {
    if (loading) return;

    if (!canEditAll) {
      const err = validateInitial();
      if (err) return Alert.alert("Validation Error", err);
    } else {
      const err = validateInitial() || validateAdvanced();
      if (err) return Alert.alert("Validation Error", err);
    }

    setLoading(true);

    const payload: any = {
      client_name: clientName || null,
      contact_person: personName,
      designation,
      email,
      contact_number: phone,
      location: meetingLocation,
      meeting_purpose: purpose,
      meeting_date: format(meetingDate, "yyyy-MM-dd"),
    };

    if (canEditAll) {
      payload.visit_place = place;
      payload.discussion_summary = discussion;
      payload.path_of_travel = pathOfTravel;
      payload.distance_km = parseFloat(distanceKm) || 0;
      payload.expenses = parseFloat(expenses) || 0;
      payload.remarks = remarks;
      payload.start_time = format(startTime, "HH:mm:ss");
      payload.end_time = format(endTime, "HH:mm:ss");
      payload.status = status || "approved";
    } else {
      payload.status = "pending";
    }

    try {
      const headers = { "Content-Type": "application/json", Authorization: `Token ${token}` };

      const res = editingMeeting
          ? await api.put(`/meetings/${editingMeeting.id}/`, payload, { headers })
          : await api.post("/meetings/", payload, { headers });

      const created = res.data;

      if (!editingMeeting && created.id && created.status === "pending") {
        await notifyApprovers(created);
      }

      Alert.alert(
        "Success",
        editingMeeting ? "Meeting updated successfully!" : "Meeting submitted for approval!"
      );

      setStatus(created.status || payload.status);

      if (onSuccess) onSuccess(res.data);
      navigation.navigate("Dashboard", { refresh: true });

      if (!editingMeeting) resetForm();
    } catch (error: any) {
      // console.log("Submit error:", error.response?.data
      console.log("Submit error:", error.response?.data || error);
      const msg =
        error?.response?.data?.detail ||
        (error?.response?.data ? Object.values(error.response.data).flat().join("\n") : null) ||
        "Network error";
      Alert.alert("Error", msg);

      // Handle 401 Unauthorized by logging out
      // if (error.response?.status === 401) {
      //   await logout();
      //   navigation.replace("Login");
      // }
      // ✅ Prevent forced logout on temporary 401
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Token may be expired — stay on screen.");
        // We no longer auto-logout; user can continue editing or retry
        return;
    }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClientName("");
    setPersonName("");
    setDesignation("");
    setEmail("");
    setPhone("");
    setMeetingLocation(userLocation || "");
    setPlace("Office");
    setPurpose("");
    setDiscussion("");
    setPathOfTravel("Car");
    setDistanceKm("0");
    setExpenses("0");
    setRemarks("");
    setMeetingDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date(new Date().getTime() + 30 * 60000));
    setStatus("draft");
  };

  // ---------- RENDER ----------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          {editingMeeting ? (status === "approved" ? "Edit Meeting" : "Meeting Request") : "Schedule Meeting"}
        </Text>

        {/* Status / Info */}
        {editingMeeting && (
          <Text style={{ textAlign: "center", marginBottom: 8 }}>
            Status: {status.toUpperCase()} {isPastMeeting() ? " • Past meeting (history)" : ""}
          </Text>
        )}

        {/* ---------- FIRST SET (Approval request set) ---------- */}
        <TextInput
          label="User Location (default)"
          value={meetingLocation}
          onChangeText={setMeetingLocation}
          style={styles.input}
          right={<TextInput.Icon icon="pencil" />}
          editable={!editingMeeting || (editingMeeting && status === "draft")}
        />

        <CrossPlatformDateTimePicker
          label="Meeting Date"
          value={meetingDate}
          onChange={setMeetingDate}
          mode="date"
          disabled={!!(editingMeeting && status !== "draft")}
        />

        <TextInput
          label="Client / Organization"
          value={clientName}
          onChangeText={setClientName}
          style={styles.input}
          editable={!editingMeeting || (editingMeeting && status === "draft")}
        />
        <TextInput
          label="Person to meet *"
          value={personName}
          onChangeText={setPersonName}
          style={styles.input}
          editable={!editingMeeting || (editingMeeting && status === "draft")}
        />
        <TextInput
          label="Designation *"
          value={designation}
          onChangeText={setDesignation}
          style={styles.input}
          editable={!editingMeeting || (editingMeeting && status === "draft")}
        />
        <TextInput
          label="Email ID"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
          editable={!editingMeeting || (editingMeeting && status === "draft")}
        />
        <TextInput
          label="Contact Number *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          editable={!editingMeeting || (editingMeeting && status === "draft")}
        />

        <TextInput
          label="Meeting Purpose *"
          value={purpose}
          onChangeText={setPurpose}
          style={styles.input}
          editable={!editingMeeting || (editingMeeting && status === "draft")}
        />

        {/* ---------- ADVANCED FIELDS — VISIBLE ONLY WHEN APPROVED ---------- */}
        {!canSeeAdvanced ? (
          <Text style={{ marginVertical: 8, fontStyle: "italic", textAlign: "center" }}>
            Additional meeting details will be available after approval.
          </Text>
        ) : (
          <>
            <TextInput
              label="Discussion / Outcome"
              value={discussion}
              onChangeText={setDiscussion}
              multiline
              style={styles.input}
            />

            {/* Visit Place Menu */}
            <Menu
              visible={placeMenuVisible}
              onDismiss={() => setPlaceMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={styles.input}>
                  Visit Place: {place}
                </Button>
              }
            >
              {["Office", "Client Site", "Other"].map((p) => (
                <Menu.Item
                  key={p}
                  title={p}
                  onPress={() => {
                    setPlace(p);
                    setPlaceMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            {/* Times */}
            <View style={styles.row}>
              <CrossPlatformDateTimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                mode="time"
              />
              <CrossPlatformDateTimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                mode="time"
              />
            </View>

            {/* Travel Menu */}
            <Menu
              visible={travelMenuVisible}
              onDismiss={() => setTravelMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={styles.input}>
                  Path of Travel: {pathOfTravel}
                </Button>
              }
            >
              {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
                <Menu.Item
                  key={t}
                  title={t}
                  onPress={() => {
                    setPathOfTravel(t);
                    setTravelMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <TextInput
              label="Distance (km)"
              value={distanceKm}
              onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
            <TextInput
              label="Remarks / Feedback"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              style={styles.input}
            />
          </>
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          loading={loading}
          onPress={submitMeeting}
          disabled={loading}
          style={styles.submitButton}
        >
          {editingMeeting
            ? editingMeeting.status === "pending"
              ? "Update Request (Pending Approval)"
              : "Update Meeting"
            : "Submit for Approval"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  input: { marginBottom: 10 },
  submitButton: { marginTop: 12, paddingVertical: 6 },
  sectionHeader: { fontSize: 16, fontWeight: "600", marginVertical: 10, color: "#333" },
});




// src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect } from "react";
// import {
//   ScrollView,
//   Alert,
//   View,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { TextInput, Button, Text, Menu } from "react-native-paper";
// import { format } from "date-fns";
// import { AuthContext } from "../contexts/AuthContext";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// import api from "../api/axiosConfig";

// type MeetingStatus = "draft" | "pending" | "approved" | "rejected" | "completed";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout, userLocation, user } = useContext(AuthContext);

//   const editingMeeting = route.params?.meeting || null;
//   const onSuccess = route.params?.onSuccess || null;

//   const [loading, setLoading] = useState(false);

//   // ---------- FORM STATES ----------
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [meetingLocation, setMeetingLocation] = useState(editingMeeting?.location || userLocation || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");
//   const [status, setStatus] = useState<MeetingStatus>(editingMeeting?.status || "draft");

//   const [meetingDate, setMeetingDate] = useState<Date>(
//     editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
//   );
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time
//       ? new Date(`1970-01-01T${editingMeeting.start_time}`)
//       : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time
//       ? new Date(`1970-01-01T${editingMeeting.end_time}`)
//       : new Date(new Date().getTime() + 30 * 60000)
//   );

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10,
//     Bike: 5,
//     Cab: 15,
//     "Public Transport": 3,
//     Walk: 0,
//   };

//   // ---------- Derived UI rules ----------
//   // When creating a meeting (no editingMeeting) we show ONLY the first approval fields.
//   // After creation, status becomes "pending" and HO/managers will approve/reject.
//   // Only when status === "approved" the "advanced" fields become visible/editable.
//   const isNew = !editingMeeting;
//   const canSeeAdvanced = status === "approved";
//   const canEditAll = canSeeAdvanced;
//   const canSubmitForApproval = isNew || (editingMeeting && status === "draft");

//   // ---------- AUTO CALC EXPENSE ----------
//   useEffect(() => {
//     // only auto-calc when not locked (i.e., after approve user can update these fields)
//     if (canEditAll) {
//       const km = Number(distanceKm) || 0;
//       const rate = RATE_PER_KM[pathOfTravel] || 0;
//       setExpenses((km * rate).toFixed(2));
//     }
//   }, [distanceKm, pathOfTravel]);

//   // ---------- LOAD MEETING (EDIT MODE OR via meetingId) ----------
//   useEffect(() => {
//     if (route.params?.meetingId && !editingMeeting) {
//       (async () => {
//         try {
//           setLoading(true);
//           const res = await api.get(`/meetings/${route.params.meetingId}/`, {
//             headers: { Authorization: `Token ${token}` },
//           });
//           const m = res.data;
//           setClientName(m.client_name || "");
//           setPersonName(m.contact_person || "");
//           setDesignation(m.designation || "");
//           setEmail(m.email || "");
//           setPhone(m.contact_number || "");
//           setMeetingLocation(m.location || userLocation || "");
//           setPlace(m.visit_place || "Office");
//           setPurpose(m.meeting_purpose || "");
//           setDiscussion(m.discussion_summary || "");
//           setPathOfTravel(m.path_of_travel || "Car");
//           setDistanceKm(m.distance_km?.toString() || "0");
//           setExpenses(m.expenses?.toString() || "0");
//           setRemarks(m.remarks || "");
//           setMeetingDate(m.meeting_date ? new Date(m.meeting_date) : new Date());
//           setStartTime(m.start_time ? new Date(`1970-01-01T${m.start_time}`) : new Date());
//           setEndTime(m.end_time ? new Date(`1970-01-01T${m.end_time}`) : new Date(new Date().getTime() + 30 * 60000));
//           setStatus(m.status || "draft");
//         } catch (err) {
//           Alert.alert("Error", "Failed to load meeting details.");
//           navigation.goBack();
//         } finally {
//           setLoading(false);
//         }
//       })();
//     }
//   }, [route.params?.meetingId]);

//   // ---------- Helpers ----------
//   const isPastMeeting = () => {
//     const t = new Date();
//     t.setHours(0, 0, 0, 0);
//     const md = new Date(meetingDate);
//     md.setHours(0, 0, 0, 0);
//     return md < t;
//   };

//   // ---------- VALIDATION ----------
//   const validateInitial = () => {
//     // validation for the first approval set only
//     if (!personName.trim()) return "Person name is required.";
//     if (!designation.trim()) return "Designation is required.";
//     if (!phone.trim()) return "Contact number is required.";
//     if (!purpose.trim()) return "Meeting purpose is required.";
//     if (!meetingLocation.trim()) return "Meeting location is required.";
//     if (!email.trim()) return "Email is required.";

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return "Invalid email format.";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date.";

//     return null;
//   };

//   const validateAdvanced = () => {
//     // validation for advanced fields (once visible)
//     if (startTime >= endTime) return "Start time must be before end time.";
//     return null;
//   };

//   // ---------- NOTIFICATIONS helper ----------
//   // This calls a backend endpoint to create/send notifications.
//   // Backend must implement /notifications/notify/ to accept { recipients: [...], title, message, payload }
//   const notifyApprovers = async (meetingData: any) => {
//     try {
//       await api.post(
//         "/notifications/notify/",
//         {
//           // server: decide recipients by role filter ("HO","manager") OR accept explicit recipient ids
//           roles: ["HO", "Manager"],
//           title: "Meeting Approval Requested",
//           message: `Approval requested for meeting with ${meetingData.contact_person || meetingData.client_name}`,
//           payload: { meeting_id: meetingData.id },
//         },
//         { headers: { Authorization: `Token ${token}` } }
//       );
//     } catch (err) {
//       // non-fatal if notify fails — still proceed, but log
//       console.log("notifyApprovers error:", err?.response?.data || err);
//     }
//   };

//   // ---------- SUBMIT ----------
//   const submitMeeting = async () => {
//     if (loading) return;

//     // If creating / submitting for approval => validate initial set only.
//     if (!canEditAll) {
//       const err = validateInitial();
//       if (err) return Alert.alert("Validation Error", err);
//     } else {
//       // if editing after approval, validate advanced fields too
//       const err = validateInitial() || validateAdvanced();
//       if (err) return Alert.alert("Validation Error", err);
//     }

//     setLoading(true);

//     const payload: any = {
//       client_name: clientName || null,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       location: meetingLocation,
//       meeting_purpose: purpose,
//       meeting_date: format(meetingDate, "yyyy-MM-dd"),
//       // advanced fields only send if allowed / present
//     };

//     if (canEditAll) {
//       payload.visit_place = place;
//       payload.discussion_summary = discussion;
//       payload.path_of_travel = pathOfTravel;
//       payload.distance_km = parseFloat(distanceKm) || 0;
//       payload.expenses = parseFloat(expenses) || 0;
//       payload.remarks = remarks;
//       payload.start_time = format(startTime, "HH:mm:ss");
//       payload.end_time = format(endTime, "HH:mm:ss");
//       // keep status if already set
//       payload.status = status || "approved";
//     } else {
//       // when submitting the initial request, set status to pending
//       payload.status = "pending";
//     }

//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         Authorization: `Token ${token}`,
//       };

//       const res = editingMeeting
//         ? await api.put(`/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await api.post("/meetings/create/", payload, { headers });

//       const created = res.data;

//       // Notify approvers only when a new pending request is created
//       if (!editingMeeting && created.id && created.status === "pending") {
//         await notifyApprovers(created);
//       }

//       Alert.alert("Success", editingMeeting ? "Meeting updated successfully!" : "Meeting submitted for approval!");

//       // Update local status if created or updated so UI can reflect new state
//       setStatus(created.status || payload.status);

//       if (onSuccess) onSuccess(res.data);
//       navigation.navigate("Dashboard", { refresh: true });

//       if (!editingMeeting) resetForm();
//     } catch (error: any) {
//       console.log("Submit error:", error.response?.data || error);
//       const msg =
//         error?.response?.data?.detail ||
//         (error?.response?.data ? Object.values(error.response.data).flat().join("\n") : null) ||
//         "Network error";
//       Alert.alert("Error", msg);

//       if (error.response?.status === 401) {
//         await logout();
//         navigation.replace("Login");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setClientName("");
//     setPersonName("");
//     setDesignation("");
//     setEmail("");
//     setPhone("");
//     setMeetingLocation(userLocation || "");
//     setPlace("Office");
//     setPurpose("");
//     setDiscussion("");
//     setPathOfTravel("Car");
//     setDistanceKm("0");
//     setExpenses("0");
//     setRemarks("");
//     setMeetingDate(new Date());
//     setStartTime(new Date());
//     setEndTime(new Date(new Date().getTime() + 30 * 60000));
//     setStatus("draft");
//   };

//   // ---------- RENDER ----------
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//         <Text variant="headlineMedium" style={styles.title}>
//           {editingMeeting ? (status === "approved" ? "Edit Meeting" : "Meeting Request") : "Schedule Meeting"}
//         </Text>

//         {/* Status / Info */}
//         {editingMeeting && (
//           <Text style={{ textAlign: "center", marginBottom: 8 }}>
//             Status: {status.toUpperCase()} {isPastMeeting() ? " • Past meeting (history)" : ""}
//           </Text>
//         )}

//         {/* ---------- FIRST SET (Approval request set) ---------- */}
//         <TextInput
//           label="User Location (default)"
//           value={meetingLocation}
//           onChangeText={setMeetingLocation}
//           style={styles.input}
//           right={<TextInput.Icon icon="pencil" />}
//           editable={!editingMeeting || (editingMeeting && status === "draft")}
//         />

//         <CrossPlatformDateTimePicker
//           label="Meeting Date"
//           value={meetingDate}
//           onChange={setMeetingDate}
//           mode="date"
//           disabled={!!(editingMeeting && status !== "draft")}
//         />

//         <TextInput
//           label="Client / Organization"
//           value={clientName}
//           onChangeText={setClientName}
//           style={styles.input}
//           editable={!editingMeeting || (editingMeeting && status === "draft")}
//         />
//         <TextInput
//           label="Person to meet *"
//           value={personName}
//           onChangeText={setPersonName}
//           style={styles.input}
//           editable={!editingMeeting || (editingMeeting && status === "draft")}
//         />
//         <TextInput
//           label="Designation *"
//           value={designation}
//           onChangeText={setDesignation}
//           style={styles.input}
//           editable={!editingMeeting || (editingMeeting && status === "draft")}
//         />
//         <TextInput
//           label="Email ID"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           style={styles.input}
//           editable={!editingMeeting || (editingMeeting && status === "draft")}
//         />
//         <TextInput
//           label="Contact Number *"
//           value={phone}
//           onChangeText={setPhone}
//           keyboardType="phone-pad"
//           style={styles.input}
//           editable={!editingMeeting || (editingMeeting && status === "draft")}
//         />

//         <TextInput
//           label="Meeting Purpose *"
//           value={purpose}
//           onChangeText={setPurpose}
//           style={styles.input}
//           editable={!editingMeeting || (editingMeeting && status === "draft")}
//         />

//         {/* ---------- ADVANCED FIELDS — VISIBLE ONLY WHEN APPROVED ---------- */}
//                 {/* ---------- ADVANCED FIELDS — VISIBLE ONLY WHEN APPROVED ---------- */}
//         {!canSeeAdvanced ? (
//           <Text style={{ marginVertical: 8, fontStyle: "italic", textAlign: "center" }}>
//             Additional meeting details will be available after approval.
//           </Text>
//         ) : (
//           <>
//             <TextInput
//               label="Discussion / Outcome"
//               value={discussion}
//               onChangeText={setDiscussion}
//               multiline
//               style={styles.input}
//             />

//             {/* Visit Place Menu */}
//             <Menu
//               visible={placeMenuVisible}
//               onDismiss={() => setPlaceMenuVisible(false)}
//               anchor={
//                 <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={styles.input}>
//                   Visit Place: {place}
//                 </Button>
//               }
//             >
//               {["Office", "Client Site", "Other"].map((p) => (
//                 <Menu.Item
//                   key={p}
//                   title={p}
//                   onPress={() => {
//                     setPlace(p);
//                     setPlaceMenuVisible(false);
//                   }}
//                 />
//               ))}
//             </Menu>

//             {/* Times */}
//             <View style={styles.row}>
//               <CrossPlatformDateTimePicker
//                 label="Start Time"
//                 value={startTime}
//                 onChange={setStartTime}
//                 mode="time"
//               />
//               <CrossPlatformDateTimePicker
//                 label="End Time"
//                 value={endTime}
//                 onChange={setEndTime}
//                 mode="time"
//               />
//             </View>

//             {/* Travel Menu */}
//             <Menu
//               visible={travelMenuVisible}
//               onDismiss={() => setTravelMenuVisible(false)}
//               anchor={
//                 <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={styles.input}>
//                   Path of Travel: {pathOfTravel}
//                 </Button>
//               }
//             >
//               {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//                 <Menu.Item
//                   key={t}
//                   title={t}
//                   onPress={() => {
//                     setPathOfTravel(t);
//                     setTravelMenuVisible(false);
//                   }}
//                 />
//               ))}
//             </Menu>

//             <TextInput
//               label="Distance (km)"
//               value={distanceKm}
//               onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//               keyboardType="numeric"
//               style={styles.input}
//             />
//             <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//             <TextInput
//               label="Remarks / Feedback"
//               value={remarks}
//               onChangeText={setRemarks}
//               multiline
//               style={styles.input}
//             />
//           </>
//         )}

//         {/* Submit Button */}
//         <Button
//           mode="contained"
//           loading={loading}
//           onPress={submitMeeting}
//           disabled={loading}
//           style={styles.submitButton}
//         >
//           {editingMeeting
//             ? editingMeeting.status === "pending"
//               ? "Update Request (Pending Approval)"
//               : "Update Meeting"
//             : "Submit for Approval"}
//         </Button>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }


// {/* 
//   const styles = StyleSheet.create({
//   container: { padding: 16 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 12, paddingVertical: 6 },
// }); */}
//     const styles = StyleSheet.create({
//       container: { padding: 16 },
//       title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//       row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//       input: { marginBottom: 10 },
//       submitButton: { marginTop: 12, paddingVertical: 6 },
//       sectionHeader: {
//         fontSize: 16,
//         fontWeight: "600",
//         marginVertical: 10,
//         color: "#333",
//       },
//     });




// import React, { useState, useContext, useEffect } from "react";
// import {
//   ScrollView,
//   Alert,
//   View,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { TextInput, Button, Text, Menu } from "react-native-paper";
// import { format } from "date-fns";
// import { AuthContext } from "../contexts/AuthContext";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// import api from "../api/axiosConfig";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout, userLocation } = useContext(AuthContext);

//   const editingMeeting = route.params?.meeting || null;
//   const onSuccess = route.params?.onSuccess || null;

//   const [loading, setLoading] = useState(false);

//   // ---------- FORM STATES ----------
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [meetingLocation, setMeetingLocation] = useState(editingMeeting?.location || userLocation || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");

//   const [meetingDate, setMeetingDate] = useState<Date>(
//     editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
//   );
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time
//       ? new Date(`1970-01-01T${editingMeeting.start_time}`)
//       : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time
//       ? new Date(`1970-01-01T${editingMeeting.end_time}`)
//       : new Date(new Date().getTime() + 30 * 60000)
//   );

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10,
//     Bike: 5,
//     Cab: 15,
//     "Public Transport": 3,
//     Walk: 0,
//   };

//   // ---------- AUTO CALC EXPENSE ----------
//   useEffect(() => {
//     if (!editingMeeting || editingMeeting.status !== "completed") {
//       const km = Number(distanceKm) || 0;
//       const rate = RATE_PER_KM[pathOfTravel] || 0;
//       setExpenses((km * rate).toFixed(2));
//     }
//   }, [distanceKm, pathOfTravel]);

//   // ---------- LOAD MEETING (EDIT MODE) ----------
//   useEffect(() => {
//     if (route.params?.meetingId) {
//       (async () => {
//         try {
//           setLoading(true);
//           const res = await api.get(`/meetings/${route.params.meetingId}/`, {
//             headers: { Authorization: `Token ${token}` },
//           });
//           const m = res.data;
//           setClientName(m.client_name || "");
//           setPersonName(m.contact_person || "");
//           setDesignation(m.designation || "");
//           setEmail(m.email || "");
//           setPhone(m.contact_number || "");
//           setMeetingLocation(m.location || userLocation || "");
//           setPlace(m.visit_place || "Office");
//           setPurpose(m.meeting_purpose || "");
//           setDiscussion(m.discussion_summary || "");
//           setPathOfTravel(m.path_of_travel || "Car");
//           setDistanceKm(m.distance_km?.toString() || "0");
//           setExpenses(m.expenses?.toString() || "0");
//           setRemarks(m.remarks || "");
//           setMeetingDate(m.meeting_date ? new Date(m.meeting_date) : new Date());
//           setStartTime(m.start_time ? new Date(`1970-01-01T${m.start_time}`) : new Date());
//           setEndTime(m.end_time ? new Date(`1970-01-01T${m.end_time}`) : new Date(new Date().getTime() + 30 * 60000));
//         } catch (err) {
//           Alert.alert("Error", "Failed to load meeting details.");
//           navigation.goBack();
//         } finally {
//           setLoading(false);
//         }
//       })();
//     }
//   }, [route.params?.meetingId]);

//   // ---------- VALIDATION ----------
//   const validate = () => {
//     if (!personName.trim()) return "Person name is required.";
//     if (!designation.trim()) return "Designation is required.";
//     if (!phone.trim()) return "Contact number is required.";
//     if (!purpose.trim()) return "Meeting purpose is required.";
//     if (!meetingLocation.trim()) return "Meeting location is required.";
//     if (!email.trim()) return "Email is required.";

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return "Invalid email format.";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date.";
//     if (startTime >= endTime) return "Start time must be before end time.";

//     return null;
//   };

//   // ---------- SUBMIT ----------
//   const submitMeeting = async () => {
//     if (loading) return;
//     const err = validate();
//     if (err) return Alert.alert("Validation Error", err);

//     setLoading(true);

//     const payload = {
//       client_name: clientName || null,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       location: meetingLocation,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: format(meetingDate, "yyyy-MM-dd"),
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//     };

//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         Authorization: `Token ${token}`,
//       };

//       const res = editingMeeting
//         ? await api.put(`/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await api.post("/meetings/create/", payload, { headers });

//       Alert.alert("Success", editingMeeting ? "Meeting updated successfully!" : "Meeting created successfully!");

//       // ✅ Notify dashboard and navigate back
//       if (onSuccess) onSuccess(res.data);
//       navigation.navigate("Dashboard", { refresh: true });

//       // ✅ Reset form (only for create)
//       if (!editingMeeting) {
//         resetForm();
//       }
//     } catch (error: any) {
//       console.log("Submit error:", error.response?.data);
//       const msg =
//         error?.response?.data?.detail ||
//         Object.values(error?.response?.data || {}).flat().join("\n") ||
//         "Network error";
//       Alert.alert("Error", msg);

//       if (error.response?.status === 401) {
//         await logout();
//         navigation.replace("Login");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setClientName("");
//     setPersonName("");
//     setDesignation("");
//     setEmail("");
//     setPhone("");
//     setMeetingLocation(userLocation || "");
//     setPlace("Office");
//     setPurpose("");
//     setDiscussion("");
//     setPathOfTravel("Car");
//     setDistanceKm("0");
//     setExpenses("0");
//     setRemarks("");
//     setMeetingDate(new Date());
//     setStartTime(new Date());
//     setEndTime(new Date(new Date().getTime() + 30 * 60000));
//   };

//   // ---------- RENDER ----------
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//         <Text variant="headlineMedium" style={styles.title}>
//           {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//         </Text>

//         <TextInput
//           label="User Location (default)"
//           value={meetingLocation}
//           onChangeText={setMeetingLocation}
//           style={styles.input}
//           right={<TextInput.Icon icon="pencil" />}
//         />

//         <CrossPlatformDateTimePicker
//           label="Meeting Date"
//           value={meetingDate}
//           onChange={setMeetingDate}
//           mode="date"
//         />

//         <View style={styles.row}>
//           <CrossPlatformDateTimePicker
//             label="Start Time"
//             value={startTime}
//             onChange={setStartTime}
//             mode="time"
//           />
//           <CrossPlatformDateTimePicker
//             label="End Time"
//             value={endTime}
//             onChange={setEndTime}
//             mode="time"
//           />
//         </View>

//         <TextInput
//           label="Client / Organization"
//           value={clientName}
//           onChangeText={setClientName}
//           style={styles.input}
//         />
//         <TextInput
//           label="Person to meet *"
//           value={personName}
//           onChangeText={setPersonName}
//           style={styles.input}
//         />
//         <TextInput
//           label="Designation *"
//           value={designation}
//           onChangeText={setDesignation}
//           style={styles.input}
//         />
//         <TextInput
//           label="Email ID"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           style={styles.input}
//         />
//         <TextInput
//           label="Contact Number *"
//           value={phone}
//           onChangeText={setPhone}
//           keyboardType="phone-pad"
//           style={styles.input}
//         />

//         {/* Visit Place Menu */}
//         <Menu
//           visible={placeMenuVisible}
//           onDismiss={() => setPlaceMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={styles.input}>
//               Visit Place: {place}
//             </Button>
//           }
//         >
//           {["Office", "Client Site", "Other"].map((p) => (
//             <Menu.Item
//               key={p}
//               title={p}
//               onPress={() => {
//                 setPlace(p);
//                 setPlaceMenuVisible(false);
//               }}
//             />
//           ))}
//         </Menu>

//         <TextInput
//           label="Meeting Purpose *"
//           value={purpose}
//           onChangeText={setPurpose}
//           style={styles.input}
//         />
//         <TextInput
//           label="Discussion / Outcome"
//           value={discussion}
//           onChangeText={setDiscussion}
//           multiline
//           style={styles.input}
//         />

//         {/* Travel Menu */}
//         <Menu
//           visible={travelMenuVisible}
//           onDismiss={() => setTravelMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={styles.input}>
//               Path of Travel: {pathOfTravel}
//             </Button>
//           }
//         >
//           {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//             <Menu.Item
//               key={t}
//               title={t}
//               onPress={() => {
//                 setPathOfTravel(t);
//                 setTravelMenuVisible(false);
//               }}
//             />
//           ))}
//         </Menu>

//         <TextInput
//           label="Distance (km)"
//           value={distanceKm}
//           onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//           keyboardType="numeric"
//           style={styles.input}
//         />
//         <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//         <TextInput
//           label="Remarks / Feedback"
//           value={remarks}
//           onChangeText={setRemarks}
//           multiline
//           style={styles.input}
//         />

//         <Button
//           mode="contained"
//           loading={loading}
//           onPress={submitMeeting}
//           disabled={loading}
//           style={styles.submitButton}
//         >
//           {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//         </Button>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 12, paddingVertical: 6 },
// });






// import React, { useState, useContext, useEffect } from "react";
// import {
//   ScrollView,
//   Alert,
//   View,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { TextInput, Button, Text, Menu } from "react-native-paper";
// import { format } from "date-fns";
// import { AuthContext } from "../contexts/AuthContext";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// import api from "../api/axiosConfig";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout, userLocation } = useContext(AuthContext);
//   const editingMeeting = route.params?.meeting || null;
//   const onSuccess = route.params?.onSuccess || null;

//   const [loading, setLoading] = useState(false);

//   // --- Form fields ---
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [meetingLocation, setMeetingLocation] = useState(editingMeeting?.location || userLocation || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");

//   const [meetingDate, setMeetingDate] = useState<Date>(
//     editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
//   );
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30 * 60000)
//   );

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const RATE_PER_KM: Record<string, number> = { Car: 10, Bike: 5, Cab: 15, "Public Transport": 3, Walk: 0 };

//   // --- Auto-calc expenses ---
//   // useEffect(() => {
//   //   const km = Number(distanceKm) || 0;
//   //   const rate = RATE_PER_KM[pathOfTravel] || 0;
//   //   setExpenses((km * rate).toFixed(2));
//   // }, [distanceKm, pathOfTravel]);

//  useEffect(() => {
//   if (!editingMeeting || editingMeeting.status !== "completed") {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] || 0;
//     setExpenses((km * rate).toFixed(2));
//   }
// }, [distanceKm, pathOfTravel]);
//   useEffect(() => {
//     if (route.params?.meetingId) {
//       (async () => {
//         try {
//           setLoading(true);
//           const res = await api.get(`/meetings/${route.params.meetingId}/`, {
//             headers: { Authorization: `Token ${token}` }
//           });
//           const m = res.data;
//           setClientName(m.client_name || "");
//           setPersonName(m.contact_person || "");
//           setDesignation(m.designation || "");
//           setEmail(m.email || "");
//           setPhone(m.contact_number || "");
//           setMeetingLocation(m.location || userLocation || "");
//           setPlace(m.visit_place || "Office");
//           setPurpose(m.meeting_purpose || "");
//           setDiscussion(m.discussion_summary || "");
//           setPathOfTravel(m.path_of_travel || "Car");
//           setDistanceKm(m.distance_km?.toString() || "0");
//           setExpenses(m.expenses?.toString() || "0");
//           setRemarks(m.remarks || "");
//           setMeetingDate(m.meeting_date ? new Date(m.meeting_date) : new Date());
//           setStartTime(m.start_time ? new Date(`1970-01-01T${m.start_time}`) : new Date());
//           setEndTime(m.end_time ? new Date(`1970-01-01T${m.end_time}`) : new Date(new Date().getTime() + 30*60000));
//         } catch (err) {
//           Alert.alert("Error", "Failed to load meeting details");
//           navigation.goBack();
//         } finally {
//           setLoading(false);
//         }
//       })();
//     }
//   }, [route.params?.meetingId]);

//   // --- Validation ---
//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";
//     if (!meetingLocation.trim()) return "Meeting location is required";
//     if (!email.trim()) return "Email is required";
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return "Email format is invalid";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";
//     if (startTime >= endTime) return "Start time must be before end time";

//     return null;
//   };

//   // --- Submit handler ---
//   const submitMeeting = async () => {
//     if (loading) return;

//     const err = validate();
//     if (err) return Alert.alert("Validation Error", err);

//     setLoading(true);

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       location: meetingLocation,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//     };

//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         Authorization: token ? `Token ${token}` : "",
//       };

//       const res = editingMeeting
//         ? await api.put(`/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await api.post("/meetings/create/", payload, { headers });

//       Alert.alert(
//         "Success",
//         editingMeeting ? "Meeting updated successfully!" : "Meeting created successfully!"
//       );

//       // Call dashboard refresh if provided
//       if (onSuccess) onSuccess(res.data);

//       // Reset form only in create mode
//       if (!editingMeeting) {
//         setClientName("");
//         setPersonName("");
//         setDesignation("");
//         setEmail("");
//         setPhone("");
//         setMeetingLocation(userLocation || "");
//         setPlace("Office");
//         setPurpose("");
//         setDiscussion("");
//         setPathOfTravel("Car");
//         setDistanceKm("0");
//         setExpenses("0");
//         setRemarks("");
//         setMeetingDate(new Date());
//         setStartTime(new Date());
//         setEndTime(new Date(new Date().getTime() + 30 * 60000));
//       } else {
//         navigation.goBack();
//       }
//     } catch (error: any) {
//       const msg = error?.response?.data?.detail || error?.message || "Network error";
//       Alert.alert("Error", msg);
//       if (error.response?.status === 401) {
//         await logout();
//         navigation.replace("Login");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//         <Text variant="headlineMedium" style={styles.title}>
//           {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//         </Text>

//         <TextInput
//           label="User Location (default)"
//           value={meetingLocation}
//           onChangeText={setMeetingLocation}
//           style={styles.input}
//           right={<TextInput.Icon icon="pencil" />}
//         />

//         <CrossPlatformDateTimePicker label="Meeting Date" value={meetingDate} onChange={setMeetingDate} mode="date" />

//         <View style={styles.row}>
//           <CrossPlatformDateTimePicker label="Start Time" value={startTime} onChange={setStartTime} mode="time" />
//           <CrossPlatformDateTimePicker label="End Time" value={endTime} onChange={setEndTime} mode="time" />
//         </View>

//         <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={styles.input} />
//         <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={styles.input} />
//         <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={styles.input} />
//         <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
//         <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

//         {/* Visit Place Menu */}
//         <Menu
//           visible={placeMenuVisible}
//           onDismiss={() => setPlaceMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={styles.input}>
//               Visit Place: {place}
//             </Button>
//           }
//         >
//           {["Office", "Client Site", "Other"].map((p) => (
//             <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//           ))}
//         </Menu>

//         <TextInput label="Meeting Purpose *" value={purpose} onChangeText={setPurpose} style={styles.input} />
//         <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={styles.input} />

//         {/* Travel Menu */}
//         <Menu
//           visible={travelMenuVisible}
//           onDismiss={() => setTravelMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={styles.input}>
//               Path of Travel: {pathOfTravel}
//             </Button>
//           }
//         >
//           {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//             <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//           ))}
//         </Menu>

//         <TextInput
//           label="Distance (km)"
//           value={distanceKm}
//           onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//           keyboardType="numeric"
//           style={styles.input}
//         />
//         <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//         <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={styles.input} />

//         <Button mode="contained" loading={loading} onPress={submitMeeting} disabled={loading} style={styles.submitButton}>
//           {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//         </Button>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 12, paddingVertical: 6 },
// });



// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect } from "react";
// import {
//   ScrollView,
//   Alert,
//   View,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { TextInput, Button, Text, Menu } from "react-native-paper";
// import { format } from "date-fns";
// import uuid from "react-native-uuid";
// import { AuthContext } from "../contexts/AuthContext";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// import api from "../api/axiosConfig";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout, username, userLocation } = useContext(AuthContext);
//   const editingMeeting = route.params?.meeting || null;

//   const [loading, setLoading] = useState(false);

//   // --- Default or existing field values ---
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [meetingLocation, setMeetingLocation] = useState(
//     editingMeeting?.location || userLocation || ""
//   );
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");

//   const [meetingDate, setMeetingDate] = useState<Date>(
//     editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
//   );
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time
//       ? new Date(`1970-01-01T${editingMeeting.start_time}`)
//       : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time
//       ? new Date(`1970-01-01T${editingMeeting.end_time}`)
//       : new Date(new Date().getTime() + 30 * 60000)
//   );

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10,
//     Bike: 5,
//     Cab: 15,
//     "Public Transport": 3,
//     Walk: 0,
//   };

//   // --- Auto calc expense ---
//   useEffect(() => {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] ?? 0;
//     setExpenses((km * rate).toFixed(2));
//   }, [distanceKm, pathOfTravel]);

//   // const validate = () => {
//   //   if (!personName.trim()) return "Person name is required";
//   //   if (!designation.trim()) return "Designation is required";
//   //   if (!phone.trim()) return "Contact number is required";
//   //   if (!purpose.trim()) return "Meeting purpose is required";
//   //   if (!meetingLocation.trim()) return "Meeting location is required";
//   //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   //   if (!emailRegex.test(email)) return "Invalid email format";

//   //   const today = new Date();
//   //   today.setHours(0, 0, 0, 0);
//   //   const meetingDay = new Date(meetingDate);
//   //   meetingDay.setHours(0, 0, 0, 0);
//   //   if (meetingDay < today) return "Cannot select a past meeting date";
//   //   if (startTime >= endTime) return "Start time must be before end time";
//   //   return null;
//   // };
//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";
//     if (!meetingLocation.trim()) return "Meeting location is required";
//     if (!email.trim()) return "Email is required"; 
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return "Email format is invalid";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";
//     if (startTime >= endTime) return "Start time must be before end time";
//     return null;
//   };

//   const submitMeeting = async () => {
//     console.log("Submit pressed ✅");
//     if (loading) return;

//     const err = validate();
//     if (err) {
//       Alert.alert("Validation Error", err);
//       return;
//     }

//     setLoading(true);
//     const requestId = uuid.v4().toString();

//     // const payload = {
//     //   client_name: clientName,
//     //   contact_person: personName,
//     //   designation,
//     //   email,
//     //   contact_number: phone,
//     //   location: meetingLocation,
//     //   visit_place: place,
//     //   meeting_purpose: purpose,
//     //   meeting_date: meetingDate.toISOString().split("T")[0],
//     //   start_time: format(startTime, "HH:mm:ss"),
//     //   end_time: format(endTime, "HH:mm:ss"),
//     //   discussion_summary: discussion,
//     //   path_of_travel: pathOfTravel,
//     //   distance_km: parseFloat(distanceKm) || 0,
//     //   expenses: parseFloat(expenses) || 0,
//     //   remarks,
//     //   // request_id: requestId,
//     // };
//     const payload = {
//     client_name: clientName || "",
//     contact_person: personName || "",
//     designation: designation || "",
//     email: email || "", // <--- ensure string
//     contact_number: phone || "",
//     location: meetingLocation || "",
//     visit_place: place || "",
//     meeting_purpose: purpose || "",
//     meeting_date: meetingDate.toISOString().split("T")[0],
//     start_time: format(startTime, "HH:mm:ss"),
//     end_time: format(endTime, "HH:mm:ss"),
//     discussion_summary: discussion || "",
//     path_of_travel: pathOfTravel || "",
//     distance_km: parseFloat(distanceKm) || 0,
//     expenses: parseFloat(expenses) || 0,
//     remarks: remarks || "",
//   };

//     // send request_id only if backend expects it
//     if (false) {
//       payload.request_id = uuid.v4().toString();
//     }
//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         Authorization: token ? `Token ${token}` : "",
//       };

//       console.log("Payload =>", payload);

//       const res = editingMeeting
//         ? await api.put(`/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await api.post("/meetings/create/", payload, { headers });

//       console.log("Response ✅", res.data);

//       Alert.alert(
//         "Success",
//         editingMeeting ? "Meeting updated successfully!" : "Meeting created successfully!",
//         [{ text: "OK", onPress: () => navigation.goBack() }]
//       );
//     } catch (error: any) {
//       console.log("Submit error ❌", error.response || error.message);
//       const msg = error?.response?.data?.detail || error?.message || "Network error";
//       Alert.alert("Error", msg);
//       if (error.response?.status === 401) {
//         await logout();
//         navigation.replace("Login");
//       }
//     } finally {
//       setTimeout(() => setLoading(false), 500);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//         <Text variant="headlineMedium" style={styles.title}>
//           {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//         </Text>

//         <TextInput
//           label="User Location (default)"
//           value={meetingLocation}
//           onChangeText={setMeetingLocation}
//           style={styles.input}
//           right={<TextInput.Icon icon="pencil" />}
//         />

//         <CrossPlatformDateTimePicker
//           label="Meeting Date"
//           value={meetingDate}
//           onChange={setMeetingDate} mode={"date"}        />

//         <View style={styles.row}>
//           <CrossPlatformDateTimePicker
//             label="Start Time"
//             value={startTime}
//             onChange={setStartTime} mode={"time"}          />
//           <CrossPlatformDateTimePicker
//             label="End Time"
//             value={endTime}
//             onChange={setEndTime} mode={"time"}          />
//         </View>

//         <TextInput
//           label="Client / Organization"
//           value={clientName}
//           onChangeText={setClientName}
//           style={styles.input}
//         />
//         <TextInput
//           label="Person to meet *"
//           value={personName}
//           onChangeText={setPersonName}
//           style={styles.input}
//         />
//         <TextInput
//           label="Designation *"
//           value={designation}
//           onChangeText={setDesignation}
//           style={styles.input}
//         />
//         <TextInput
//           label="Email ID"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           style={styles.input}
//         />
//         <TextInput
//           label="Contact Number *"
//           value={phone}
//           onChangeText={setPhone}
//           keyboardType="phone-pad"
//           style={styles.input}
//         />

//         {/* Visit Place Menu */}
//         <Menu
//           visible={placeMenuVisible}
//           onDismiss={() => setPlaceMenuVisible(false)}
//           anchor={
//             <Button
//               mode="outlined"
//               onPress={() => setPlaceMenuVisible(true)}
//               style={styles.input}
//             >
//               Visit Place: {place}
//             </Button>
//           }
//         >
//           {["Office", "Client Site", "Other"].map((p) => (
//             <Menu.Item
//               key={p}
//               title={p}
//               onPress={() => {
//                 setPlace(p);
//                 setPlaceMenuVisible(false);
//               }}
//             />
//           ))}
//         </Menu>

//         <TextInput
//           label="Meeting Purpose *"
//           value={purpose}
//           onChangeText={setPurpose}
//           style={styles.input}
//         />
//         <TextInput
//           label="Discussion / Outcome"
//           value={discussion}
//           onChangeText={setDiscussion}
//           multiline
//           style={styles.input}
//         />

//         {/* Travel Menu */}
//         <Menu
//           visible={travelMenuVisible}
//           onDismiss={() => setTravelMenuVisible(false)}
//           anchor={
//             <Button
//               mode="outlined"
//               onPress={() => setTravelMenuVisible(true)}
//               style={styles.input}
//             >
//               Path of Travel: {pathOfTravel}
//             </Button>
//           }
//         >
//           {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//             <Menu.Item
//               key={t}
//               title={t}
//               onPress={() => {
//                 setPathOfTravel(t);
//                 setTravelMenuVisible(false);
//               }}
//             />
//           ))}
//         </Menu>

//         <TextInput
//           label="Distance (km)"
//           value={distanceKm}
//           onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//           keyboardType="numeric"
//           style={styles.input}
//         />
//         <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//         <TextInput
//           label="Remarks / Feedback"
//           value={remarks}
//           onChangeText={setRemarks}
//           multiline
//           style={styles.input}
//         />

//         <Button
//           mode="contained"
//           loading={loading}
//           onPress={submitMeeting}
//           disabled={loading}
//           style={styles.submitButton}
//         >
//           {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//         </Button>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 12, paddingVertical: 6 },
// });




// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect } from "react";
// import { ScrollView, Alert, View, StyleSheet } from "react-native";
// import { TextInput, Button, Text, Menu, Portal } from "react-native-paper";
// import { format } from "date-fns";
// import uuid from "react-native-uuid";
// import { AuthContext } from "../contexts/AuthContext";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// import api from "../api/axiosConfig";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout, username, userLocation } = useContext(AuthContext);
//   const editingMeeting = route.params?.meeting || null;

//   const [loading, setLoading] = useState(false);

//   // --- Default or existing field values ---
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [meetingLocation, setMeetingLocation] = useState(
//     editingMeeting?.location || userLocation || ""
//   );
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");

//   const [meetingDate, setMeetingDate] = useState<Date>(
//     editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
//   );
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time
//       ? new Date(`1970-01-01T${editingMeeting.start_time}`)
//       : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time
//       ? new Date(`1970-01-01T${editingMeeting.end_time}`)
//       : new Date(new Date().getTime() + 30 * 60000)
//   );

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10,
//     Bike: 5,
//     Cab: 15,
//     "Public Transport": 3,
//     Walk: 0,
//   };

//   // --- Auto calc expense ---
//   useEffect(() => {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] ?? 0;
//     setExpenses((km * rate).toFixed(2));
//   }, [distanceKm, pathOfTravel]);

//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";
//     if (!meetingLocation.trim()) return "Meeting location is required";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";
//     if (startTime >= endTime) return "Start time must be before end time";
//     return null;
//   };

//   const submitMeeting = async () => {
//     if (loading) return;

//     const err = validate();
//     if (err) {
//       Alert.alert("Validation Error", err);
//       return;
//     }

//     setLoading(true);
//     const requestId = uuid.v4().toString();

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       location: meetingLocation, // new field
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//       request_id: requestId,
//     };

//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         Authorization: token ? `Token ${token}` : "",
//       };

//       const res = editingMeeting
//         ? await api.put(`/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await api.post("/meetings/create/", payload, { headers });

//       Alert.alert(
//         "Success",
//         editingMeeting ? "Meeting updated" : "Meeting created",
//         [{ text: "OK", onPress: () => navigation.goBack() }]
//       );
//     } catch (error: any) {
//       const msg = error?.response?.data?.detail || error?.message || "Network error";
//       Alert.alert("Error", msg);
//       if (error.response?.status === 401) {
//         await logout();
//         navigation.replace("Login");
//       }
//     } finally {
//       setTimeout(() => setLoading(false), 500);
//     }
//   };

//   return (
//     <Portal>
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//         <Text variant="headlineMedium" style={styles.title}>
//           {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//         </Text>

//         {/* Read-only location (defaults to user) */}
//         <TextInput
//           label="User Location (default)"
//           value={meetingLocation}
//           onChangeText={setMeetingLocation}
//           style={styles.input}
//           right={<TextInput.Icon icon="pencil" />}
//           placeholder="Enter or confirm location"
//         />

//         <CrossPlatformDateTimePicker
//           label="Meeting Date"
//           value={meetingDate}
//           mode="date"
//           onChange={setMeetingDate}
//         />

//         <View style={styles.row}>
//           <CrossPlatformDateTimePicker
//             label="Start Time"
//             value={startTime}
//             mode="time"
//             onChange={setStartTime}
//           />
//           <CrossPlatformDateTimePicker
//             label="End Time"
//             value={endTime}
//             mode="time"
//             onChange={setEndTime}
//           />
//         </View>

//         <TextInput
//           label="Client / Organization"
//           value={clientName}
//           onChangeText={setClientName}
//           style={styles.input}
//         />
//         <TextInput
//           label="Person to meet *"
//           value={personName}
//           onChangeText={setPersonName}
//           style={styles.input}
//         />
//         <TextInput
//           label="Designation *"
//           value={designation}
//           onChangeText={setDesignation}
//           style={styles.input}
//         />
//         <TextInput
//           label="Email ID"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           style={styles.input}
//         />
//         <TextInput
//           label="Contact Number *"
//           value={phone}
//           onChangeText={setPhone}
//           keyboardType="phone-pad"
//           style={styles.input}
//         />

//         {/* Visit Place Menu */}
//         <Menu
//           visible={placeMenuVisible}
//           onDismiss={() => setPlaceMenuVisible(false)}
//           anchor={
//             <Button
//               mode="outlined"
//               onPress={() => setPlaceMenuVisible(true)}
//               style={[styles.input, { zIndex: 1000 }]}
//             >
//               Visit Place: {place}
//             </Button>
//           }
//         >
//           {["Office", "Client Site", "Other"].map((p) => (
//             <Menu.Item
//               key={p}
//               title={p}
//               onPress={() => {
//                 setPlace(p);
//                 setPlaceMenuVisible(false);
//               }}
//             />
//           ))}
//         </Menu>

//         <TextInput
//           label="Meeting Purpose *"
//           value={purpose}
//           onChangeText={setPurpose}
//           style={styles.input}
//         />
//         <TextInput
//           label="Discussion / Outcome"
//           value={discussion}
//           onChangeText={setDiscussion}
//           multiline
//           style={styles.input}
//         />

//         {/* Travel Menu */}
//         <Menu
//           visible={travelMenuVisible}
//           onDismiss={() => setTravelMenuVisible(false)}
//           anchor={
//             <Button
//               mode="outlined"
//               onPress={() => setTravelMenuVisible(true)}
//               style={[styles.input, { zIndex: 1000 }]}
//             >
//               Path of Travel: {pathOfTravel}
//             </Button>
//           }
//         >
//           {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//             <Menu.Item
//               key={t}
//               title={t}
//               onPress={() => {
//                 setPathOfTravel(t);
//                 setTravelMenuVisible(false);
//               }}
//             />
//           ))}
//         </Menu>

//         <TextInput
//           label="Distance (km)"
//           value={distanceKm}
//           onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//           keyboardType="numeric"
//           style={styles.input}
//         />
//         <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//         <TextInput
//           label="Remarks / Feedback"
//           value={remarks}
//           onChangeText={setRemarks}
//           multiline
//           style={styles.input}
//         />

//         <Button
//           mode="contained"
//           loading={loading}
//           onPress={submitMeeting}
//           disabled={loading}
//           style={styles.submitButton}
//         >
//           {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//         </Button>
//       </ScrollView>
//     </Portal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff", flex: 1 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 8 },
// });





// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect, useRef } from "react";
// import { ScrollView, Alert, View, StyleSheet } from "react-native";
// import { TextInput, Button, Text, Menu, Portal } from "react-native-paper";
// import { format } from "date-fns";
// import uuid from "react-native-uuid";
// import { AuthContext } from "../contexts/AuthContext";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// import api from "../api/axiosConfig"; // preconfigured axios instance with baseURL & token injection

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout } = useContext(AuthContext);
//   const editingMeeting = route.params?.meeting || null;

//   const [loading, setLoading] = useState(false);
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");
//   const [meetingDate, setMeetingDate] = useState<Date>(editingMeeting ? new Date(editingMeeting.meeting_date) : new Date());
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30 * 60000)
//   );

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10, Bike: 5, Cab: 15, "Public Transport": 3, Walk: 0,
//   };

//   // Auto-calc expenses
//   useEffect(() => {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] ?? 0;
//     setExpenses((km * rate).toFixed(2));
//   }, [distanceKm, pathOfTravel]);

//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";
//     if (startTime >= endTime) return "Start time must be before end time";
//     return null;
//   };

//   const submitMeeting = async () => {
//     if (loading) return;

//     const err = validate();
//     if (err) { Alert.alert("Validation Error", err); return; }

//     setLoading(true);
//     const requestId = uuid.v4().toString();

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//       request_id: requestId,
//     };

//     try {
//       const headers = { "Content-Type": "application/json", Authorization: token ? `Token ${token}` : "" };
//       const res = editingMeeting
//         ? await api.put(`/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await api.post("/meetings/create/", payload, { headers });

//       Alert.alert("Success", editingMeeting ? "Meeting updated" : "Meeting created", [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (error: any) {
//       const msg = error?.response?.data?.detail || error?.message || "Network error";
//       Alert.alert("Error", msg);
//       if (error.response?.status === 401) {
//         await logout();
//         navigation.replace("Login");
//       }
//     } finally {
//       setTimeout(() => setLoading(false), 500);
//     }
//   };

//   return (
//     <Portal>
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//         <Text variant="headlineMedium" style={styles.title}>
//           {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//         </Text>

//         <CrossPlatformDateTimePicker label="Meeting Date" value={meetingDate} mode="date" onChange={setMeetingDate} />

//         <View style={styles.row}>
//           <CrossPlatformDateTimePicker label="Start Time" value={startTime} mode="time" onChange={setStartTime} />
//           <CrossPlatformDateTimePicker label="End Time" value={endTime} mode="time" onChange={setEndTime} />
//         </View>

//         <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={styles.input} />
//         <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={styles.input} />
//         <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={styles.input} />
//         <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
//         <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

//         {/* Visit Place Menu */}
//         <Menu
//           visible={placeMenuVisible}
//           onDismiss={() => setPlaceMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={[styles.input, { zIndex: 1000 }]}>
//               Visit Place: {place}
//             </Button>
//           }
//         >
//           {["Office", "Client Site", "Other"].map((p) => (
//             <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//           ))}
//         </Menu>

//         <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={styles.input} />
//         <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={styles.input} />

//         {/* Travel Menu */}
//         <Menu
//           visible={travelMenuVisible}
//           onDismiss={() => setTravelMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={[styles.input, { zIndex: 1000 }]}>
//               Path of Travel: {pathOfTravel}
//             </Button>
//           }
//         >
//           {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//             <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//           ))}
//         </Menu>

//         <TextInput label="Distance (km)" value={distanceKm} onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric" style={styles.input} />
//         <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//         <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={styles.input} />

//         <Button mode="contained" loading={loading} onPress={submitMeeting} disabled={loading} style={styles.submitButton}>
//           {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//         </Button>
//       </ScrollView>
//     </Portal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff", flex: 1 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 8 },
// });





























// import React, { useState, useContext } from "react";
// import { ScrollView, View, Alert } from "react-native";
// import { TextInput, Button, Text } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { format } from "date-fns";
// import { AuthContext } from "../contexts/AuthContext";

// const STORAGE_KEY = "@cmm_meetings_v1";

// export default function MeetingFormScreen({ navigation }: any) {
//   const { user } = useContext(AuthContext);

//   const [meetingDate, setMeetingDate] = useState<Date>(new Date());
//   const [showDate, setShowDate] = useState(false);
//   const [clientName, setClientName] = useState("");
//   const [personName, setPersonName] = useState("");
//   const [designation, setDesignation] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [place, setPlace] = useState("Office");
//   const [purpose, setPurpose] = useState("");
//   const [durationMins, setDurationMins] = useState("30");
//   const [discussion, setDiscussion] = useState("");
//   const [pathOfTravel, setPathOfTravel] = useState("Car");
//   const [distanceKm, setDistanceKm] = useState("0");
//   const [expenses, setExpenses] = useState("0");
//   const [remarks, setRemarks] = useState("");

//   function validate() {
//     if (!personName.trim()) return "Person name required";
//     if (!designation.trim()) return "Designation required";
//     if (!phone.trim()) return "Contact number required";
//     if (!purpose.trim()) return "Meeting purpose required";

//     // No back dates allowed
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     if (meetingDate < today) {
//       return "Cannot select a past date";
//     }

//     return null;
//   }

//   async function submit() {
//     const err = validate();
//     if (err) return Alert.alert("Validation", err);

//     const item = {
//       id: Date.now().toString(),
//       createdBy: user?.id || "u-demo",
//       clientName,
//       personName,
//       designation,
//       email,
//       phone,
//       place,
//       purpose,
//       meetingDate: meetingDate.toISOString(),
//       durationMins: Number(durationMins),
//       discussion,
//       pathOfTravel,
//       distanceKm: Number(distanceKm),
//       expenses: Number(expenses),
//       remarks,
//       status: "PENDING",
//       hoApproval: "IDLE",
//     };

//     try {
//       const raw = await AsyncStorage.getItem(STORAGE_KEY);
//       const arr = raw ? JSON.parse(raw) : [];
//       arr.unshift(item);
//       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
//       Alert.alert("Saved", "Meeting saved and sent for HO review (if enabled).", [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (e) {
//       console.warn(e);
//       Alert.alert("Error", "Failed to save meeting");
//     }
//   }

//   return (
//     <ScrollView style={{ padding: 16, backgroundColor: "#fff" }}>
//       <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
//         Schedule Meeting
//       </Text>

//       <Button
//         mode="outlined"
//         onPress={() => setShowDate(true)}
//         style={{ marginBottom: 12 }}
//       >
//         {`Meeting time: ${format(meetingDate, "PPpp")}`}
//       </Button>

//       {showDate && (
//         <DateTimePicker
//           value={meetingDate}
//           mode="datetime"
//           onChange={(e, d) => {
//             setShowDate(false);
//             if (d) setMeetingDate(d);
//           }}
//         />
//       )}

//       <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={{ marginBottom: 10 }} />
//       <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={{ marginBottom: 10 }} />
//       <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={{ marginBottom: 10 }} />
//       <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={{ marginBottom: 10 }} />
//       <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginBottom: 10 }} />
//       <TextInput label="Visit place (Office / Outside)" value={place} onChangeText={setPlace} style={{ marginBottom: 10 }} />
//       <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={{ marginBottom: 10 }} />
//       <TextInput label="Duration (minutes)" value={durationMins} onChangeText={setDurationMins} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={{ marginBottom: 10 }} />
//       <TextInput label="Path of travel" value={pathOfTravel} onChangeText={setPathOfTravel} style={{ marginBottom: 10 }} />
//       <TextInput label="Distance (km)" value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Expenses (₹)" value={expenses} onChangeText={setExpenses} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={{ marginBottom: 16 }} />

//       <Button mode="contained" onPress={submit}>
//         Submit for Approval
//       </Button>
//     </ScrollView>
//   );
// }


// covers Step 1 - Step 16)
// This file implements a grouped stepper form (fields grouped into logical sections). 
// It enforces the no-backdate rule and required fields, calculates travel cost from distance and per-km rate, and saves the meeting locally with a pending HO approval state.


// import React, { useState, useContext } from "react";
// import { ScrollView, View, Alert } from "react-native";
// import { TextInput, Button, Text } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { format } from "date-fns";
// import { AuthContext } from "../contexts/AuthContext";

// const STORAGE_KEY = "@cmm_meetings_v1";

// export default function MeetingFormScreen({ navigation }: any) {
//   const { user } = useContext(AuthContext);

//   const [meetingDate, setMeetingDate] = useState<Date>(new Date());
//   const [showDate, setShowDate] = useState(false);
//   const [clientName, setClientName] = useState("");
//   const [personName, setPersonName] = useState("");
//   const [designation, setDesignation] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [place, setPlace] = useState("Office");
//   const [purpose, setPurpose] = useState("");
//   const [durationMins, setDurationMins] = useState("30");
//   const [discussion, setDiscussion] = useState("");
//   const [pathOfTravel, setPathOfTravel] = useState("Car");
//   const [distanceKm, setDistanceKm] = useState("0");
//   const [expenses, setExpenses] = useState("0");
//   const [remarks, setRemarks] = useState("");

//   function validate() {
//     if (!personName.trim()) return "Person name required";
//     if (!designation.trim()) return "Designation required";
//     if (!phone.trim()) return "Contact number required";
//     if (!purpose.trim()) return "Meeting purpose required";

//     // No back dates allowed
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     if (meetingDate < today) {
//       return "Cannot select a past date";
//     }

//     return null;
//   }

//   async function submit() {
//     const err = validate();
//     if (err) return Alert.alert("Validation", err);

//     const item = {
//       id: Date.now().toString(),
//       createdBy: user?.id || "u-demo",
//       clientName,
//       personName,
//       designation,
//       email,
//       phone,
//       place,
//       purpose,
//       meetingDate: meetingDate.toISOString(),
//       durationMins: Number(durationMins),
//       discussion,
//       pathOfTravel,
//       distanceKm: Number(distanceKm),
//       expenses: Number(expenses),
//       remarks,
//       status: "PENDING",
//       hoApproval: "IDLE",
//     };

//     try {
//       const raw = await AsyncStorage.getItem(STORAGE_KEY);
//       const arr = raw ? JSON.parse(raw) : [];
//       arr.unshift(item);
//       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
//       Alert.alert("Saved", "Meeting saved and sent for HO review (if enabled).", [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (e) {
//       console.warn(e);
//       Alert.alert("Error", "Failed to save meeting");
//     }
//   }

//   return (
//     <ScrollView style={{ padding: 16, backgroundColor: "#fff" }}>
//       <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
//         Schedule Meeting
//       </Text>

//       <Button
//         mode="outlined"
//         onPress={() => setShowDate(true)}
//         style={{ marginBottom: 12 }}
//       >
//         {`Meeting time: ${format(meetingDate, "PPpp")}`}
//       </Button>

//       {showDate && (
//         <DateTimePicker
//           value={meetingDate}
//           mode="datetime"
//           onChange={(e, d) => {
//             setShowDate(false);
//             if (d) setMeetingDate(d);
//           }}
//         />
//       )}

//       <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={{ marginBottom: 10 }} />
//       <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={{ marginBottom: 10 }} />
//       <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={{ marginBottom: 10 }} />
//       <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={{ marginBottom: 10 }} />
//       <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginBottom: 10 }} />
//       <TextInput label="Visit place (Office / Outside)" value={place} onChangeText={setPlace} style={{ marginBottom: 10 }} />
//       <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={{ marginBottom: 10 }} />
//       <TextInput label="Duration (minutes)" value={durationMins} onChangeText={setDurationMins} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={{ marginBottom: 10 }} />
//       <TextInput label="Path of travel" value={pathOfTravel} onChangeText={setPathOfTravel} style={{ marginBottom: 10 }} />
//       <TextInput label="Distance (km)" value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Expenses (₹)" value={expenses} onChangeText={setExpenses} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={{ marginBottom: 16 }} />

//       <Button mode="contained" onPress={submit}>
//         Submit for Approval
//       </Button>
//     </ScrollView>
//   );
// }


// import React, { useState, useContext, useEffect } from "react";
// import { ScrollView, Alert, View } from "react-native";
// import { TextInput, Button, Text, HelperText, Menu, Divider } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { format } from "date-fns";
// import axios from "axios";
// import { AuthContext } from "../contexts/AuthContext";

// // API base URL
// const API_BASE = "http://127.0.0.1:8000/api"; // change to your server

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { user, token } = useContext(AuthContext); // JWT or token for headers
//   const editingMeeting = route.params?.meeting || null; // for update

//   // State for meeting fields
//   const [meetingDate, setMeetingDate] = useState<Date>(editingMeeting ? new Date(editingMeeting.meeting_date) : new Date());
//   const [showDate, setShowDate] = useState(false);

//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [startTime, setStartTime] = useState(editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date());
//   const [endTime, setEndTime] = useState(editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30*60000));

//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");

//   const [loading, setLoading] = useState(false);
//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";

//     // date validation
//     const today = new Date(); today.setHours(0,0,0,0);
//     if (meetingDate < today) return "Cannot select a past date";

//     if (startTime >= endTime) return "Start time must be before end time";

//     return null;
//   };

//   const submitMeeting = async () => {
//     const err = validate();
//     if (err) return Alert.alert("Validation Error", err);

//     setLoading(true);

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm),
//       expenses: parseFloat(expenses),
//       remarks,
//     };

//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       let response;
//       if (editingMeeting) {
//         // Update existing meeting
//         response = await axios.put(`${API_BASE}/meetings/${editingMeeting.id}/`, payload, { headers });
//       } else {
//         // Create new meeting
//         response = await axios.post(`${API_BASE}/meetings/create/`, payload, { headers });
//       }

//       Alert.alert("Success", `Meeting ${editingMeeting ? "updated" : "created"} successfully!`, [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (err: any) {
//       console.error(err.response || err);
//       Alert.alert("Error", "Failed to save meeting. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={{ padding: 16, backgroundColor: "#fff" }}>
//       <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
//         {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//       </Text>

//       {/* Date Picker */}
//       <Button mode="outlined" onPress={() => setShowDate(true)} style={{ marginBottom: 12 }}>
//         {`Meeting Date: ${format(meetingDate, "PP")}`}
//       </Button>
//       {showDate && (
//         <DateTimePicker
//           value={meetingDate}
//           mode="date"
//           onChange={(e, d) => { setShowDate(false); if(d) setMeetingDate(d); }}
//         />
//       )}

//       {/* Start & End Time */}
//       <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
//         <Button mode="outlined" onPress={() => setShowDate(true)}>
//           Start: {format(startTime, "HH:mm")}
//         </Button>
//         <Button mode="outlined" onPress={() => setShowDate(true)}>
//           End: {format(endTime, "HH:mm")}
//         </Button>
//       </View>

//       <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={{ marginBottom: 10 }} />
//       <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={{ marginBottom: 10 }} />
//       <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={{ marginBottom: 10 }} />
//       <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={{ marginBottom: 10 }} />
//       <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginBottom: 10 }} />

//       {/* Place Dropdown */}
//       <Menu
//         visible={placeMenuVisible}
//         onDismiss={() => setPlaceMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={{ marginBottom: 10 }}>
//             Visit Place: {place}
//           </Button>
//         }
//       >
//         {["Office", "Client Site", "Other"].map((p) => (
//           <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={{ marginBottom: 10 }} />
//       <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={{ marginBottom: 10 }} />

//       {/* Travel Dropdown */}
//       <Menu
//         visible={travelMenuVisible}
//         onDismiss={() => setTravelMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={{ marginBottom: 10 }}>
//             Path of Travel: {pathOfTravel}
//           </Button>
//         }
//       >
//         {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//           <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput label="Distance (km)" value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Expenses (₹)" value={expenses} onChangeText={setExpenses} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={{ marginBottom: 16 }} />

//       <Button mode="contained" loading={loading} onPress={submitMeeting}>
//         {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//       </Button>
//     </ScrollView>
//   );
// }


// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext } from "react";
// import { ScrollView, Alert, View } from "react-native";
// import { TextInput, Button, Text, Menu } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { format } from "date-fns";
// import axios from "axios";
// import { AuthContext } from "../contexts/AuthContext";

// const API_BASE = "http://127.0.0.1:8000/api";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token } = useContext(AuthContext);
//   const editingMeeting = route.params?.meeting || null;

//   const [meetingDate, setMeetingDate] = useState(editingMeeting ? new Date(editingMeeting.meeting_date) : new Date());
//   const [showDate, setShowDate] = useState(false);
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [startTime, setStartTime] = useState(editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date());
//   const [endTime, setEndTime] = useState(editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30 * 60000));
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");
//   const [loading, setLoading] = useState(false);
//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";
//     if (startTime >= endTime) return "Start time must be before end time";
//     return null;
//   };

//   const submitMeeting = async () => {
//     const err = validate();
//     if (err) return Alert.alert("Validation Error", err);
//     setLoading(true);

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm),
//       expenses: parseFloat(expenses),
//       remarks,
//     };

//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       let response;
//       if (editingMeeting) {
//         response = await axios.put(`${API_BASE}/meetings/${editingMeeting.id}/`, payload, { headers });
//       } else {
//         response = await axios.post(`${API_BASE}/meetings/create/`, payload, { headers });
//       }

//       Alert.alert("Success", `Meeting ${editingMeeting ? "updated" : "created"} successfully!`);
//       navigation.goBack();
//     } catch (err: any) {
//       console.error(err.response || err);
//       Alert.alert("Error", "Failed to save meeting. Please check your login or token.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={{ padding: 16, backgroundColor: "#fff" }}>
//       <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
//         {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//       </Text>

//       <Button mode="outlined" onPress={() => setShowDate(true)} style={{ marginBottom: 12 }}>
//         Meeting Date: {format(meetingDate, "PP")}
//       </Button>

//       {showDate && (
//         <DateTimePicker value={meetingDate} mode="date" onChange={(e, d) => { setShowDate(false); if (d) setMeetingDate(d); }} />
//       )}

//       <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={{ marginBottom: 10 }} />
//       <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={{ marginBottom: 10 }} />
//       <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={{ marginBottom: 10 }} />
//       <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={{ marginBottom: 10 }} />
//       <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginBottom: 10 }} />

//       <Menu visible={placeMenuVisible} onDismiss={() => setPlaceMenuVisible(false)}
//         anchor={<Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={{ marginBottom: 10 }}>Visit Place: {place}</Button>}>
//         {["Office", "Client Site", "Other"].map(p => (
//           <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={{ marginBottom: 10 }} />
//       <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={{ marginBottom: 10 }} />

//       <Menu visible={travelMenuVisible} onDismiss={() => setTravelMenuVisible(false)}
//         anchor={<Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={{ marginBottom: 10 }}>Path of Travel: {pathOfTravel}</Button>}>
//         {["Car", "Bike", "Cab", "Public Transport", "Walk"].map(t => (
//           <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput label="Distance (km)" value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Expenses (₹)" value={expenses} onChangeText={setExpenses} keyboardType="numeric" style={{ marginBottom: 10 }} />
//       <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={{ marginBottom: 16 }} />

//       <Button mode="contained" loading={loading} onPress={submitMeeting}>
//         {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//       </Button>
//     </ScrollView>
//   );
// }
// This screen allows users to create or edit meetings, enforcing validation rules and submitting data to the backend 
// API with authentication.

// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect } from "react";
// import { ScrollView, Alert, View, StyleSheet } from "react-native";
// import { TextInput, Button, Text, Menu } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { format } from "date-fns";
// import axios from "axios";
// import { AuthContext } from "../contexts/AuthContext";

// const API_BASE = "http://127.0.0.1:8000/api"; // change to your server if needed

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout } = useContext(AuthContext as any);
//   const editingMeeting = route.params?.meeting || null;

//   // Date / time pickers
//   const [meetingDate, setMeetingDate] = useState<Date>(
//     editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
//   );
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30 * 60000)
//   );
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   // form fields
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");

//   // UI state
//   const [loading, setLoading] = useState(false);
//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   // Rate map for expenses calculation — tweak as needed
//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10,
//     Bike: 5,
//     Cab: 15,
//     "Public Transport": 3,
//     Walk: 0,
//   };

//   // recalc expenses whenever distance or travel mode changes
//   useEffect(() => {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] ?? 0;
//     const calc = +(km * rate).toFixed(2);
//     setExpenses(calc.toString());
//   }, [distanceKm, pathOfTravel]);

//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";

//     // No backdates
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";

//     // times
//     if (startTime >= endTime) return "Start time must be before end time";

//     return null;
//   };

//   const getAuthHeaders = () => {
//     // DRF TokenAuth expects "Authorization: Token <key>"
//     if (!token) return {};
//     return { Authorization: `Token ${token}` };
//   };

//   const submitMeeting = async () => {
//     const err = validate();
//     if (err) {
//       Alert.alert("Validation", err);
//       return;
//     }

//     setLoading(true);

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0], // YYYY-MM-DD
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//     };

//     try {
//       const headers = { "Content-Type": "application/json", ...getAuthHeaders() };

//       let res;
//       if (editingMeeting) {
//         // update
//         res = await axios.put(`${API_BASE}/meetings/${editingMeeting.id}/`, payload, { headers });
//       } else {
//         // create
//         res = await axios.post(`${API_BASE}/meetings/create/`, payload, { headers });
//       }

//       // success
//       Alert.alert("Success", editingMeeting ? "Meeting updated" : "Meeting created", [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (error: any) {
//       // if server responded with JSON message, show it
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
//         console.error("Meeting API error:", status, data);

//         if (status === 401) {
//           Alert.alert("Session expired", "Please login again.", [
//             { text: "OK", onPress: async () => { await logout?.(); navigation.replace("Login"); } },
//           ]);
//         } else {
//           // try to get message from response
//           const msg = data?.detail || data?.message || JSON.stringify(data);
//           Alert.alert("Save failed", msg);
//         }
//       } else {
//         console.error("Meeting API error (no response):", error);
//         Alert.alert("Error", "Network or server error. Check console for details.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // date/time pickers handlers
//   const onChangeMeetingDate = (event: any, selected?: Date) => {
//     setShowDatePicker(false);
//     if (selected) setMeetingDate(selected);
//   };

//   const onChangeStartTime = (event: any, selected?: Date) => {
//     setShowStartPicker(false);
//     if (selected) setStartTime(selected);
//   };

//   const onChangeEndTime = (event: any, selected?: Date) => {
//     setShowEndPicker(false);
//     if (selected) setEndTime(selected);
//   };

//   return (
//     <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//       <Text variant="headlineMedium" style={styles.title}>
//         {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//       </Text>

//       {/* Meeting Date */}
//       <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.fieldButton}>
//         Meeting Date: {format(meetingDate, "PP")}
//       </Button>
//       {showDatePicker && (
//         <DateTimePicker value={meetingDate} mode="date" display="default" onChange={onChangeMeetingDate} />
//       )}

//       {/* Start / End Time */}
//       <View style={styles.row}>
//         <Button mode="outlined" onPress={() => setShowStartPicker(true)} style={styles.timeButton}>
//           Start: {format(startTime, "HH:mm")}
//         </Button>
//         <Button mode="outlined" onPress={() => setShowEndPicker(true)} style={styles.timeButton}>
//           End: {format(endTime, "HH:mm")}
//         </Button>
//       </View>
//       {showStartPicker && <DateTimePicker value={startTime} mode="time" display="default" onChange={onChangeStartTime} />}
//       {showEndPicker && <DateTimePicker value={endTime} mode="time" display="default" onChange={onChangeEndTime} />}

//       {/* Basic fields */}
//       <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={styles.input} />
//       <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={styles.input} />
//       <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={styles.input} />
//       <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
//       <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

//       {/* Place menu */}
//       <Menu
//         visible={placeMenuVisible}
//         onDismiss={() => setPlaceMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={styles.input}>
//             Visit Place: {place}
//           </Button>
//         }
//       >
//         {["Office", "Client Site", "Other"].map((p) => (
//           <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={styles.input} />
//       <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={styles.input} />

//       {/* Travel menu */}
//       <Menu
//         visible={travelMenuVisible}
//         onDismiss={() => setTravelMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={styles.input}>
//             Path of Travel: {pathOfTravel}
//           </Button>
//         }
//       >
//         {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//           <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput
//         label="Distance (km)"
//         value={distanceKm}
//         onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//         keyboardType="numeric"
//         style={styles.input}
//       />

//       <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//       <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={styles.input} />

//       <Button mode="contained" loading={loading} onPress={submitMeeting} disabled={loading} style={styles.submitButton}>
//         {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//       </Button>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff", flex: 1 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   fieldButton: { marginBottom: 12 },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   timeButton: { flex: 1, marginHorizontal: 6 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 8 },
// });
// // This screen allows users to create or edit meetings, enforcing validation rules and submitting data to the backend
// // API with authentication.


// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect, useRef } from "react";
// import { ScrollView, Alert, View, StyleSheet, Platform } from "react-native";
// import { TextInput, Button, Text, Menu, Portal } from "react-native-paper";
// import { format } from "date-fns";
// import axios from "axios";
// import { AuthContext } from "../contexts/AuthContext";
// import uuid from "react-native-uuid";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// import api from "../api/axiosConfig";

// const API_BASE = "http://127.0.0.1:8000/api";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout } = useContext(AuthContext as any);
//   const editingMeeting = route.params?.meeting || null;

//   // States
//   const [loading, setLoading] = useState(false);
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");
//   const [meetingDate, setMeetingDate] = useState<Date>(editingMeeting ? new Date(editingMeeting.meeting_date) : new Date());
//   const [startTime, setStartTime] = useState<Date>(editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date());
//   const [endTime, setEndTime] = useState<Date>(editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30 * 60000));

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const lastRequestId = useRef<string | null>(null);

//   // Expense auto-calc
//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10, Bike: 5, Cab: 15, "Public Transport": 3, Walk: 0,
//   };

//   useEffect(() => {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] ?? 0;
//     setExpenses((km * rate).toFixed(2));
//   }, [distanceKm, pathOfTravel]);

//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";
//     if (startTime >= endTime) return "Start time must be before end time";
//     return null;
//   };

//   const getAuthHeaders = () => token ? { Authorization: `Token ${token}` } : {};

//   const submitMeeting = async () => {
//     if (loading) return;

//     const err = validate();
//     if (err) { Alert.alert("Validation", err); return; }

//     setLoading(true);
//     const requestId = uuid.v4().toString();
//     lastRequestId.current = requestId;

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//       request_id: requestId,
//     };

//     try {
//       const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
//       const res = editingMeeting
//         ? await axios.put(`${API_BASE}/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await api.post("meetings/create/", payload);
// // await axios.post(`${API_BASE}/meetings/create/`, payload, { headers });
//         console.log("Submitting meeting with token:", token);
//       Alert.alert("Success", editingMeeting ? "Meeting updated" : "Meeting created", [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (error: any) {
//       const msg = error?.response?.data?.detail || error?.message || "Network error";
//       Alert.alert("Error", msg);
//       if (error.response?.status === 401) {
//         await logout?.();
//         navigation.replace("Login");
//       }
//     } finally {
//       setTimeout(() => setLoading(false), 800);
//     }
//   };

//   return (
//     <Portal>
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//         <Text variant="headlineMedium" style={styles.title}>
//           {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//         </Text>

//         {/* Date */}
//         <CrossPlatformDateTimePicker
//           label="Meeting Date"
//           value={meetingDate}
//           mode="date"
//           onChange={setMeetingDate}
//         />

//         {/* Time */}
//         <View style={styles.row}>
//           <CrossPlatformDateTimePicker
//             label="Start Time"
//             value={startTime}
//             mode="time"
//             onChange={setStartTime}
//           />
//           <CrossPlatformDateTimePicker
//             label="End Time"
//             value={endTime}
//             mode="time"
//             onChange={setEndTime}
//           />
//         </View>

//         {/* Form Inputs */}
//         <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={styles.input} />
//         <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={styles.input} />
//         <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={styles.input} />
//         <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
//         <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

//         {/* Visit Place Menu */}
//         <Menu
//           visible={placeMenuVisible}
//           onDismiss={() => setPlaceMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={[styles.input, { zIndex: 1000 }]}>
//               Visit Place: {place}
//             </Button>
//           }
//         >
//           {["Office", "Client Site", "Other"].map((p) => (
//             <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//           ))}
//         </Menu>

//         <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={styles.input} />
//         <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={styles.input} />

//         {/* Travel Menu */}
//         <Menu
//           visible={travelMenuVisible}
//           onDismiss={() => setTravelMenuVisible(false)}
//           anchor={
//             <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={[styles.input, { zIndex: 1000 }]}>
//               Path of Travel: {pathOfTravel}
//             </Button>
//           }
//         >
//           {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//             <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//           ))}
//         </Menu>

//         <TextInput label="Distance (km)" value={distanceKm} onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric" style={styles.input} />
//         <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//         <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={styles.input} />

//         <Button mode="contained" loading={loading} onPress={submitMeeting} disabled={loading} style={styles.submitButton}>
//           {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//         </Button>
//       </ScrollView>
//     </Portal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff", flex: 1 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 8 },
// });


// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect, useRef } from "react";
// import { ScrollView, View, StyleSheet, Alert } from "react-native";
// import { TextInput, Button, Text, Menu, HelperText } from "react-native-paper";
// import { format } from "date-fns";
// import axios from "axios";
// import { AuthContext } from "../contexts/AuthContext";
// import uuid from "react-native-uuid";
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";

// const API_BASE = "http://127.0.0.1:8000/api";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout } = useContext(AuthContext as any);
//   const editingMeeting = route.params?.meeting || null;

//   // ----- States -----
//   const [loading, setLoading] = useState(false);
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");
//   const [meetingDate, setMeetingDate] = useState<Date>(editingMeeting ? new Date(editingMeeting.meeting_date) : new Date());
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30 * 60000)
//   );

//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const lastRequestId = useRef<string | null>(null);

//   // ----- Auto-calc Expenses -----
//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10,
//     Bike: 5,
//     Cab: 15,
//     "Public Transport": 3,
//     Walk: 0,
//   };

//   useEffect(() => {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] ?? 0;
//     const calc = +(km * rate).toFixed(2);
//     setExpenses(calc.toString());
//   }, [distanceKm, pathOfTravel]);

//   // ----- Validation -----
//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";
//     if (startTime >= endTime) return "Start time must be before end time";
//     return null;
//   };

//   const getAuthHeaders = () => (token ? { Authorization: `Token ${token}` } : {});

//   // ----- Submit Meeting -----
//   const submitMeeting = async () => {
//     if (loading) return;
//     const err = validate();
//     if (err) return Alert.alert("Validation Error", err);

//     setLoading(true);
//     const requestId = uuid.v4().toString();
//     lastRequestId.current = requestId;

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//       request_id: requestId,
//     };

//     try {
//       const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
//       const res = editingMeeting
//         ? await axios.put(`${API_BASE}/meetings/${editingMeeting.id}/`, payload, { headers })
//         : await axios.post(`${API_BASE}/meetings/create/`, payload, { headers });

//       Alert.alert("Success", editingMeeting ? "Meeting updated" : "Meeting created", [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (error: any) {
//       const msg = error?.response?.data?.detail || error?.response?.data?.message || error.message;
//       Alert.alert("Save Failed", msg);
//     } finally {
//       setTimeout(() => setLoading(false), 500);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//       <Text variant="headlineMedium" style={styles.title}>
//         {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//       </Text>

//       {/* Cross-Platform Date Picker */}
//       <CrossPlatformDateTimePicker label="Meeting Date & Time" value={meetingDate} onChange={setMeetingDate} />

//       {/* Cross-Platform Time Pickers */}
//       <View style={styles.row}>
//         <CrossPlatformDateTimePicker label="Start Time" value={startTime} onChange={setStartTime} />
//         <CrossPlatformDateTimePicker label="End Time" value={endTime} onChange={setEndTime} />
//       </View>

//       <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={styles.input} />
//       <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={styles.input} />
//       <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={styles.input} />
//       <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
//       <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

//       {/* Visit Place Menu */}
//       <Menu
//         visible={placeMenuVisible}
//         onDismiss={() => setPlaceMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={styles.input}>
//             Visit Place: {place}
//           </Button>
//         }
//       >
//         {["Office", "Client Site", "Other"].map((p) => (
//           <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={styles.input} />
//       <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={styles.input} />

//       {/* Travel Menu */}
//       <Menu
//         visible={travelMenuVisible}
//         onDismiss={() => setTravelMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={styles.input}>
//             Path of Travel: {pathOfTravel}
//           </Button>
//         }
//       >
//         {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//           <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput
//         label="Distance (km)"
//         value={distanceKm}
//         onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//         keyboardType="numeric"
//         style={styles.input}
//       />

//       <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//       <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={styles.input} />

//       <Button mode="contained" loading={loading} onPress={submitMeeting} disabled={loading} style={styles.submitButton}>
//         {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//       </Button>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff", flex: 1 },
//   title: { marginBottom: 16, fontWeight: "700", textAlign: "center" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   input: { marginBottom: 12 },
//   submitButton: { marginTop: 16 },
// });


// // src/screens/MeetingFormScreen.tsx
// import React, { useState, useContext, useEffect, useRef } from "react";
// import { ScrollView, Alert, View, StyleSheet } from "react-native";
// import { TextInput, Button, Text, Menu } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { format } from "date-fns";
// import axios from "axios";
// import { AuthContext } from "../contexts/AuthContext";
// import uuid from "react-native-uuid"; // ✅ for unique ID per request
// import CrossPlatformDateTimePicker from "../components/CrossPlatformDateTimePicker";
// const API_BASE = "http://127.0.0.1:8000/api";

// export default function MeetingFormScreen({ navigation, route }: any) {
//   const { token, logout } = useContext(AuthContext as any);
//   const editingMeeting = route.params?.meeting || null;

//   // UI + Data states
//   const [loading, setLoading] = useState(false);
//   const [clientName, setClientName] = useState(editingMeeting?.client_name || "");
//   const [personName, setPersonName] = useState(editingMeeting?.contact_person || "");
//   const [designation, setDesignation] = useState(editingMeeting?.designation || "");
//   const [email, setEmail] = useState(editingMeeting?.email || "");
//   const [phone, setPhone] = useState(editingMeeting?.contact_number || "");
//   const [place, setPlace] = useState(editingMeeting?.visit_place || "Office");
//   const [purpose, setPurpose] = useState(editingMeeting?.meeting_purpose || "");
//   const [discussion, setDiscussion] = useState(editingMeeting?.discussion_summary || "");
//   const [pathOfTravel, setPathOfTravel] = useState(editingMeeting?.path_of_travel || "Car");
//   const [distanceKm, setDistanceKm] = useState(editingMeeting?.distance_km?.toString() || "0");
//   const [expenses, setExpenses] = useState(editingMeeting?.expenses?.toString() || "0");
//   const [remarks, setRemarks] = useState(editingMeeting?.remarks || "");
//   const [meetingDate, setMeetingDate] = useState<Date>(
//     editingMeeting ? new Date(editingMeeting.meeting_date) : new Date()
//   );
//   // const [meetingDate, setMeetingDate] = useState(new Date())
//   const [startTime, setStartTime] = useState<Date>(
//     editingMeeting?.start_time ? new Date(`1970-01-01T${editingMeeting.start_time}`) : new Date()
//   );
//   const [endTime, setEndTime] = useState<Date>(
//     editingMeeting?.end_time ? new Date(`1970-01-01T${editingMeeting.end_time}`) : new Date(new Date().getTime() + 30 * 60000)
//   );
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);
//   const [placeMenuVisible, setPlaceMenuVisible] = useState(false);
//   const [travelMenuVisible, setTravelMenuVisible] = useState(false);

//   const lastRequestId = useRef<string | null>(null); // ✅ Track last submission ID

  
//   // Expense auto-calc
//   const RATE_PER_KM: Record<string, number> = {
//     Car: 10,
//     Bike: 5,
//     Cab: 15,
//     "Public Transport": 3,
//     Walk: 0,
//   };

//   useEffect(() => {
//     const km = Number(distanceKm) || 0;
//     const rate = RATE_PER_KM[pathOfTravel] ?? 0;
//     const calc = +(km * rate).toFixed(2);
//     setExpenses(calc.toString());
//   }, [distanceKm, pathOfTravel]);

//   const validate = () => {
//     if (!personName.trim()) return "Person name is required";
//     if (!designation.trim()) return "Designation is required";
//     if (!phone.trim()) return "Contact number is required";
//     if (!purpose.trim()) return "Meeting purpose is required";

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const meetingDay = new Date(meetingDate);
//     meetingDay.setHours(0, 0, 0, 0);
//     if (meetingDay < today) return "Cannot select a past meeting date";
//     if (startTime >= endTime) return "Start time must be before end time";
//     return null;
//   };

//   const getAuthHeaders = () => {
//     if (!token) return {};
//     return { Authorization: `Token ${token}` };
//   };

//   const submitMeeting = async () => {
//     if (loading) return; // ✅ Prevent multiple taps
//     const err = validate();
//     if (err) {
//       Alert.alert("Validation", err);
//       return;
//     }

//     setLoading(true);
//     const requestId = uuid.v4().toString(); // ✅ unique ID
//     lastRequestId.current = requestId;

//     const payload = {
//       client_name: clientName,
//       contact_person: personName,
//       designation,
//       email,
//       contact_number: phone,
//       visit_place: place,
//       meeting_purpose: purpose,
//       meeting_date: meetingDate.toISOString().split("T")[0],
//       start_time: format(startTime, "HH:mm:ss"),
//       end_time: format(endTime, "HH:mm:ss"),
//       discussion_summary: discussion,
//       path_of_travel: pathOfTravel,
//       distance_km: parseFloat(distanceKm) || 0,
//       expenses: parseFloat(expenses) || 0,
//       remarks,
//       request_id: requestId, // ✅ Include for backend deduplication
//     };

//     try {
//       const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
//       let res;

//       if (editingMeeting) {
//         res = await axios.put(`${API_BASE}/meetings/${editingMeeting.id}/`, payload, { headers });
//       } else {
//         res = await axios.post(`${API_BASE}/meetings/create/`, payload, { headers });
//       }

//       console.log("✅ Meeting submitted:", { requestId, data: res.data });
//       Alert.alert("Success", editingMeeting ? "Meeting updated" : "Meeting created", [
//         { text: "OK", onPress: () => navigation.goBack() },
//       ]);
//     } catch (error: any) {
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
//         console.error("Meeting API error:", status, data);

//         if (status === 401) {
//           Alert.alert("Session expired", "Please login again.", [
//             { text: "OK", onPress: async () => { await logout?.(); navigation.replace("Login"); } },
//           ]);
//         } else {
//           const msg = data?.detail || data?.message || JSON.stringify(data);
//           Alert.alert("Save failed", msg);
//         }
//       } else {
//         console.error("Network Error:", error);
//         Alert.alert("Error", "Network or server error. Check console for details.");
//       }
//     } finally {
//       // ✅ Safe release after slight delay
//       setTimeout(() => setLoading(false), 800);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//       <Text variant="headlineMedium" style={styles.title}>
//         {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
//       </Text>

//       {/* Date */}
//       <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.fieldButton}>
//         Meeting Date: {format(meetingDate, "PP")}
//       </Button>
//       {showDatePicker && (
//         <DateTimePicker value={meetingDate} mode="date" display="default" onChange={(e, d) => {
//           setShowDatePicker(false);
//           if (d) setMeetingDate(d);
//         }} />
//       )}

//       {/* Time */}
//       <View style={styles.row}>
//         <Button mode="outlined" onPress={() => setShowStartPicker(true)} style={styles.timeButton}>
//           Start: {format(startTime, "HH:mm")}
//         </Button>
//         <Button mode="outlined" onPress={() => setShowEndPicker(true)} style={styles.timeButton}>
//           End: {format(endTime, "HH:mm")}
//         </Button>
//       </View>

//       {showStartPicker && (
//         <DateTimePicker value={startTime} mode="time" display="default" onChange={(e, d) => {
//           setShowStartPicker(false);
//           if (d) setStartTime(d);
//         }} />
//       )}
//       {showEndPicker && (
//         <DateTimePicker value={endTime} mode="time" display="default" onChange={(e, d) => {
//           setShowEndPicker(false);
//           if (d) setEndTime(d);
//         }} />
//       )}

//       <TextInput label="Client / Organization" value={clientName} onChangeText={setClientName} style={styles.input} />
//       <TextInput label="Person to meet *" value={personName} onChangeText={setPersonName} style={styles.input} />
//       <TextInput label="Designation *" value={designation} onChangeText={setDesignation} style={styles.input} />
//       <TextInput label="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
//       <TextInput label="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

//       {/* Menus */}
//       <Menu
//         visible={placeMenuVisible}
//         onDismiss={() => setPlaceMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setPlaceMenuVisible(true)} style={styles.input}>
//             Visit Place: {place}
//           </Button>
//         }
//       >
//         {["Office", "Client Site", "Other"].map((p) => (
//           <Menu.Item key={p} title={p} onPress={() => { setPlace(p); setPlaceMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput label="Meeting purpose *" value={purpose} onChangeText={setPurpose} style={styles.input} />
//       <TextInput label="Discussion / Outcome" value={discussion} onChangeText={setDiscussion} multiline style={styles.input} />

//       <Menu
//         visible={travelMenuVisible}
//         onDismiss={() => setTravelMenuVisible(false)}
//         anchor={
//           <Button mode="outlined" onPress={() => setTravelMenuVisible(true)} style={styles.input}>
//             Path of Travel: {pathOfTravel}
//           </Button>
//         }
//       >
//         {["Car", "Bike", "Cab", "Public Transport", "Walk"].map((t) => (
//           <Menu.Item key={t} title={t} onPress={() => { setPathOfTravel(t); setTravelMenuVisible(false); }} />
//         ))}
//       </Menu>

//       <TextInput
//         label="Distance (km)"
//         value={distanceKm}
//         onChangeText={(v) => setDistanceKm(v.replace(/[^0-9.]/g, ""))}
//         keyboardType="numeric"
//         style={styles.input}
//       />

//       <TextInput label="Expenses (₹)" value={expenses} editable={false} style={styles.input} />
//       <TextInput label="Remarks / Feedback" value={remarks} onChangeText={setRemarks} multiline style={styles.input} />

//       <Button
//         mode="contained"
//         loading={loading}
//         onPress={submitMeeting}
//         disabled={loading}
//         style={styles.submitButton}
//       >
//         {editingMeeting ? "Update Meeting" : "Submit for Approval"}
//       </Button>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff", flex: 1 },
//   title: { marginBottom: 12, fontWeight: "700", textAlign: "center" },
//   fieldButton: { marginBottom: 12 },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//   timeButton: { flex: 1, marginHorizontal: 6 },
//   input: { marginBottom: 10 },
//   submitButton: { marginTop: 8 },
// });
