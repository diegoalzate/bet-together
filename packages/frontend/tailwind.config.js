const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "work-sans": ["Work Sans", ...defaultTheme.fontFamily.sans],
        "poppins": ["Poppins"]
      },
      colors: {
        pDark: "#1E2235",
        sDark: "#1A1D2D",
        pBlue: "#2563EB",
        pGreen: "#39A651",
        pPurple: "#424867"
      }
    },
  },
  plugins: [require("daisyui")],
};
