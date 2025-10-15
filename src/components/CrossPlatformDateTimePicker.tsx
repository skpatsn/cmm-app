


// src/components/CrossPlatformDateTimePicker.tsx
import React, { useState } from "react";
import { Platform, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface Props {
  label: string;
  value: Date;
  mode: "date" | "time"; //  added this type
  onChange: (date: Date) => void;
}

export default function CrossPlatformDateTimePicker({
  label,
  value,
  mode,
  onChange,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) onChange(selectedDate);
  };

  const formatDisplay = (date: Date) => {
    if (mode === "date") return date.toLocaleDateString();
    if (mode === "time") return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toString();
  };

  return (
    <View style={{ flex: 1, marginBottom: 10 }}>
      <Button
        mode="outlined"
        onPress={() => setShowPicker(true)}
        style={{ flex: 1 }}
      >
        {label}: {formatDisplay(value)}
      </Button>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
        />
      )}
    </View>
  );
}








// import React from "react";
// import { Platform, View, Text } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { TextInput, HelperText } from "react-native-paper";

// interface Props {
//   label: string;
//   value: Date;
//   onChange: (date: Date) => void;
//   error?: string;
// }

// const CrossPlatformDateTimePicker: React.FC<Props> = ({ label, value, onChange, error }) => {
//   if (Platform.OS === "web") {
//     return (
//       <View style={{ marginVertical: 8 }}>
//         <Text style={{ marginBottom: 4 }}>{label}</Text>
//         <DatePicker
//           selected={value}
//           onChange={onChange}
//           showTimeSelect
//           dateFormat="Pp"
//           className="web-datepicker"
//         />
//         {error && <HelperText type="error">{error}</HelperText>}
//       </View>
//     );
//   }

//   return (
//     <View style={{ marginVertical: 8 }}>
//       <TextInput
//         label={label}
//         value={value.toLocaleString()}
//         editable={false}
//         style={{ backgroundColor: "white" }}
//       />
//       <DateTimePicker
//         value={value}
//         mode="datetime"
//         display="default"
//         onChange={(event, selectedDate) => {
//           if (selectedDate) onChange(selectedDate);
//         }}
//       />
//       {error && <HelperText type="error">{error}</HelperText>}
//     </View>
//   );
// };

// export default CrossPlatformDateTimePicker;
