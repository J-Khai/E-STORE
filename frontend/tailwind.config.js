/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zinc-950': '#09090b', // Deep Slate for text/nav
        'zinc-50': '#fafafa',  // Off-white for background
        'accent': '#18181b',    // Sharp black for buttons
      },
      borderRadius: {
        'none': '0',
        'sm': '2px', // Minimalist sharp corners
        'md': '4px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
