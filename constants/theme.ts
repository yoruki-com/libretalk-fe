export const colors = {
  primary: "#014AF1",
  primary30: "#D0EBFF",
  dark: "#131313",
  light: "#F5F5F5",
  white: "#FFFFFF",
  black: "#000000",
  gray4: "#BDBDBD",
  gray5: "#E0E0E0",
  gray6: "#F2F2F2",
  border: "#E3E3E3",
  tertiary: "#53C92C",
  overlay: "rgba(0, 0, 0, 0.4)",
  overlayWhite50: "rgba(255, 255, 255, 0.5)",
} as const;

export const lightTheme = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  card: "#FFFFFF",
  text: "#131313",
  textSecondary: "#666666",
  textTertiary: "#999999",
  border: "#E3E3E3",
  primary: "#014AF1",
  primaryLight: "#D0EBFF",
  icon: "#131313",
  iconSecondary: "#666666",
  success: "#53C92C",
  error: "#FF4444",
  overlay: "rgba(0, 0, 0, 0.4)",
} as const;

export const darkTheme = {
  background: "#0F1624",
  surface: "#1A2332",
  card: "#212D40",
  text: "#F4F6FB",
  textSecondary: "#9BA4B5",
  textTertiary: "#6B7280",
  border: "#2D3A4F",
  primary: "#4B8BFF",
  primaryLight: "#1E3A5F",
  icon: "#E8ECF4",
  iconSecondary: "#9BA4B5",
  success: "#34D399",
  error: "#F87171",
  overlay: "rgba(15, 22, 36, 0.8)",
} as const;

export interface Theme {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  primary: string;
  primaryLight: string;
  icon: string;
  iconSecondary: string;
  success: string;
  error: string;
  overlay: string;
}

export const typography = {
  heading4: {
    fontFamily: "NunitoSans_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  linkNormal: {
    fontFamily: "NunitoSans_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
  },
  bodySmall: {
    fontFamily: "NunitoSans_400Regular",
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.12,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  card: 32,
  button: 999,
  small: 8,
} as const;
