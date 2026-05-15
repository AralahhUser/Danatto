import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        navy: "#13243a",
        olive: "#596044",
        champagne: "#b99a5f",
        linen: "#f7f2ea",
        mist: "#f5f4f1",
        porcelain: "#fbfaf7"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(17, 17, 17, 0.08)",
        lift: "0 12px 35px rgba(17, 17, 17, 0.07)"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
