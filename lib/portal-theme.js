export const portalThemes = {
  admin: {
    label: "Admin Portal",
    shortLabel: "Administration",
    tagline: "School operations and academic management",
    accent: "#2563EB",
    accentStrong: "#1D4ED8",
    accentSoft: "#DBEAFE",
    surface: "#F3F7FE",
    border: "#CFE0F5",
    sidebarStart: "#081E45",
    sidebarEnd: "#114D91",
  },
  teacher: {
    label: "Teacher Portal",
    shortLabel: "Teaching workspace",
    tagline: "Classes, learning and student progress",
    accent: "#059669",
    accentStrong: "#047857",
    accentSoft: "#D1FAE5",
    surface: "#F1FAF6",
    border: "#BDE8D4",
    sidebarStart: "#073E3A",
    sidebarEnd: "#087A69",
  },
  parent: {
    label: "Parent Portal",
    shortLabel: "Family workspace",
    tagline: "Your child's learning, progress and school life",
    accent: "#7C3AED",
    accentStrong: "#6D28D9",
    accentSoft: "#EDE9FE",
    surface: "#F8F5FF",
    border: "#DDD1FA",
    sidebarStart: "#2E1065",
    sidebarEnd: "#5B21B6",
  },
};

export function getPortalTheme(portal) {
  return portalThemes[portal] || portalThemes.admin;
}
