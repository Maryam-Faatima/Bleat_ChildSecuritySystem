/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: { colors: {
        "pastel-blue": "#A3CEF1",
        "pastel-pink": "#F9C5D1",
      },},
  },
  plugins: [],
};

