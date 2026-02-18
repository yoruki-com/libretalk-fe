/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#014AF1",
        "primary-30": "#D0EBFF",
        dark: "#131313",
        light: "#F5F5F5",
        gray: "#A8A8A8",
        gray4: "#BDBDBD",
        gray5: "#E0E0E0",
        gray6: "#F2F2F2",
        border: "#E3E3E3",
        tertiary: "#53C92C",
      },
      fontFamily: {
        sans: ["NunitoSans_400Regular"],
        "sans-medium": ["NunitoSans_500Medium"],
        "sans-semibold": ["NunitoSans_600SemiBold"],
        "sans-bold": ["NunitoSans_700Bold"],
      },
      fontSize: {
        "heading-4": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "link-normal": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "body-small": ["12px", { lineHeight: "15px", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        card: "32px",
        button: "999px",
      },
    },
  },
  plugins: [],
};
