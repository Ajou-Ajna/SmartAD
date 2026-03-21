/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "schemes-outline-variant": "#cac4d0",
        "schemes-surface": "#fef7ff",
        "schemes-surface-container": "#f3edf7",
        "schemes-on-surface": "#1d1b20",
        "schemes-primary-container": "#eaddff",
        "schemes-secondary": "#625b71",
        "schemes-secondary-container": "#e8def8",
        "schemes-on-surface-variant": "#49454f",
        "schemes-primary": "#6750a4",
        "schemes-on-primary": "#fff",
        "schemes-surface-container-highest": "#e6e0e9",
        "schemes-outline": "#79747e",
        "schemes-surface-container-high": "#ece6f0",
        "schemes-surface-container-lowest": "#fff",
        "schemes-on-secondary-container": "#4a4459",
        "schemes-error": "#b3261e",
        "m3-sys-light-outline-variant": "#cac4d0",
        "m3-sys-light-outline": "#79747e",
      },
      spacing: {
        "space-400": "16px",
        "space-200": "8px",
        "space-300": "12px",
      },
      borderRadius: {
        "corner-large": "16px",
        "corner-extra-large": "28px",
        "radius-200": "8px",
      },
      borderWidth: {
        "stroke-border": "1px",
      },
    },
    fontSize: {
      "static-body-large-size": "16px",
      "static-label-medium-size": "12px",
      "static-title-medium-size": "16px",
      "static-display-small-size": "36px",
      "static-label-large-size": "14px",
      "static-body-medium-size": "14px",
      "static-body-small-size": "12px",
      "static-label-small-size": "11px",
    },
    lineHeight: {
      "static-body-large-line-height": "24px",
      "static-label-medium-line-height": "16px",
      "static-title-medium-line-height": "24px",
      "static-display-small-line-height": "44px",
      "static-label-large-line-height": "20px",
      "static-body-medium-line-height": "20px",
      "static-body-small-line-height": "16px",
      "static-label-small-line-height": "16px",
    },
    letterSpacing: {
      "static-body-large-tracking": "0.5px",
      "static-label-medium-tracking": "0.5px",
      "static-title-medium-tracking": "0.15px",
      "static-display-small-tracking": "0px",
      "static-label-large-tracking": "0.1px",
      "static-body-medium-tracking": "0.25px",
      "static-body-small-tracking": "0.4px",
      "static-label-small-tracking": "0.5px",
    },
    screens: {
      mq750: {
        raw: "screen and (min-width: 751px) and (max-width: 750px)",
      },
      mq450: {
        raw: "screen and (max-width: 450px)",
      },
      mq675: {
        raw: "screen and (min-width: 451px) and (max-width: 675px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
