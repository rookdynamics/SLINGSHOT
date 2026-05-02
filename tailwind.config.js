/** @type {import('tailwindcss').Config} */

// SLINGSHOT — Tailwind CSS configuration
// Scans every TS/TSX/HTML file under src/ for class names. The popup, options
// page, and the in-page IOC lookup overlay all share this theme.

export default {
  content: ['./src/**/*.{html,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      // Cap the popup width to a comfortable browser-popup size.
      maxWidth: {
        popup: '400px',
      },
    },
  },
  // The IOC lookup overlay is injected into arbitrary host pages, so we keep
  // the default plugin set minimal to avoid leaking too much CSS surface.
  plugins: [],
};
