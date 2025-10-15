// src/constants/quickLinksConfig.ts

/**
 * Defines quick-link buttons available to each user role.
 * Scalable to future roles and permissions.
 */
export const roleQuickLinks: Record<string, { label: string; icon: string; route: string }[]> = {
  USER: [
    { label: "Schedule Meeting", icon: "calendar-plus", route: "MeetingForm" },
    { label: "Reports", icon: "file-chart", route: "Reports" },
  ],
  HO: [
    { label: "Approvals", icon: "check", route: "Approvals" },
    { label: "Schedule Meeting", icon: "calendar-plus", route: "MeetingForm" },
    { label: "Reports", icon: "file-chart", route: "Reports" },
  ],
  MGMT: [
    { label: "Analytics", icon: "chart-line", route: "Analytics" },
    { label: "Approvals", icon: "check", route: "Approvals" },
    { label: "Schedule Meeting", icon: "calendar-plus", route: "MeetingForm" },
    { label: "Reports", icon: "file-chart", route: "Reports" },
  ],
};



// // src/constants/quickLinksConfig.ts
// export const roleQuickLinks: Record<string, { label: string; icon: string; route: string }[]> = {
//   USER: [
//     { label: "My Meetings", icon: "calendar", route: "Dashboard" },
//     { label: "Reports", icon: "file-chart", route: "Reports" },
//   ],
//   MGMT: [
//     { label: "Approvals", icon: "check", route: "Approvals" },
//     { label: "All Meetings", icon: "calendar", route: "Dashboard" },
//   ],
//   ADMIN: [
//     { label: "Users", icon: "account", route: "Dashboard" },
//     { label: "Reports", icon: "file-chart", route: "Reports" },
//   ],
// };
