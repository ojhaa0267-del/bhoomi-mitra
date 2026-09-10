/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Bhoomi Mitra – Cyber-Civic Dark Mode Palette ──────────────────────
      colors: {
        background: {
          deep:   '#070D19',  // Global app canvas (V4)
          card:   '#111E36',  // Floating panels
          subtle: '#0F172A',  // Input fields, nested containers (V4)
        },
        accent: {
          emerald: '#10B981', // Safe / Verified / Clear Title
          amber:   '#F59E0B', // Caution / Pending NOC / Price gap warning
          crimson: '#EF4444', // High Risk / Litigation / Forest Buffer Overlap
          blue:    '#3B82F6', // Primary CTA / Verified Bhu-Aadhar Badge / Mic Glow
        },
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
      },

      // ── Glow Box-Shadows ──────────────────────────────────────────────────
      boxShadow: {
        'glow-blue':    '0 0 20px rgba(59, 130, 246, 0.45)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.2)',
        'glow-crimson': '0 0 15px rgba(239, 68, 68, 0.2)',
        'glow-amber':   '0 0 15px rgba(245, 158, 11, 0.2)',
        'card':         '0 8px 32px 0 rgba(0, 0, 0, 0.37)', // V4 premium shadow
      },

      // ── Custom Animations ─────────────────────────────────────────────────
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sonar':      'sonarEffect 1.5s ease-out infinite',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.35s ease-out forwards',
        'slide-up-fade': 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down-fade': 'slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        sonarEffect: {
          '0%':   { transform: 'scale(0.95)', opacity: '0.6' },
          '100%': { transform: 'scale(1.28)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDownFade: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
