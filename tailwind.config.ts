import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-content": "var(--primary-content)",
        secondary: "var(--secondary)",
        "secondary-content": "var(--secondary-content)",
        accent: "var(--accent)",
        "accent-content": "var(--accent-content)",
        neutral: "var(--neutral)",
        "neutral-content": "var(--neutral-content)",
        success: "var(--success)",
        "success-content": "var(--success-content)",
        warning: "var(--warning)",
        "warning-content": "var(--warning-content)",
        danger: "var(--danger)",
        "danger-content": "var(--danger-content)",
        info: "var(--info)",
        "info-content": "var(--info-content)",
        "base-100": "var(--base100)",
        "base-200": "var(--base200)",
        "base-300": "var(--base300)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
