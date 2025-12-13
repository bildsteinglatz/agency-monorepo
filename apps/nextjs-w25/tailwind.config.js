/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'owners': ['Owners Text', 'sans-serif'],
        'sans': ['Owners Text', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "#ff6600",
        "neon-orange": "#ff6600",
      },
      textColor: {
        accent: "#ff6600",
      },
      fontWeight: {
        'xlight': '200',
        'light': '300',
        'regular': '400', 
        'roman': '400',
        'medium': '500',
        'bold': '700',
        'black': '900',
      }
    },
  },
  plugins: [],
}
