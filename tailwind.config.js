/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#014AF1",
        dark: "#131313",
        light: "#F5F5F5",
        gray4: "#BDBDBD",
      },
      fontFamily: {
        "open-sans": ["OpenSans_600SemiBold"],
        "open-sans-bold": ["OpenSans_700Bold"],
        inter: ["Inter_400Regular"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
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
