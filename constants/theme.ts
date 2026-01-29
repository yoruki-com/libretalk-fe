export const colors = {
  primary: "#014AF1",
  dark: "#131313",
  light: "#F5F5F5",
  white: "#FFFFFF",
  black: "#000000",
  gray4: "#BDBDBD",
  overlay: "rgba(0, 0, 0, 0.4)",
} as const;

export const typography = {
  heading4: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  linkNormal: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
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
