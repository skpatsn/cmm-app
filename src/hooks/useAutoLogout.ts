import { useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useAutoLogout = () => {
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "background" || state === "inactive") {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("username");
        await AsyncStorage.removeItem("role");
        console.log("Token cleared: app moved to background/closed");
      }
    });

    return () => sub.remove();
  }, []);
};

export default useAutoLogout;
// import axios from "axios";