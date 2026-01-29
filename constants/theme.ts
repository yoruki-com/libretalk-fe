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
