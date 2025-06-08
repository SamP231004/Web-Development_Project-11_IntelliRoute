// frontend2/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: This content array tells Tailwind where to scan for your classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // Add DaisyUI as a plugin
  // Configure DaisyUI themes for a modern look
  daisyui: {
    themes: ["light", "dark", "cupcake", "dracula", "synthwave", "corporate", "aqua", "forest"], // Include more modern themes
    darkTheme: "dark", // Specify which theme is considered 'dark'
    base: true, // Applies background color and foreground color for root element
    styled: true, // Applies system-wide base styles for DaisyUI components
    utils: true, // Adds helper classes
    prefix: "", // DaisyUI prefix for classes (empty means no prefix)
    logs: true, // Shows DaisyUI logs in browser console
  },
}