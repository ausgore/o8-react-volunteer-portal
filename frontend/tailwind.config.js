import flowbite from 'flowbite-react/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', 
    './src/**/*.{ts,tsx}',
    flowbite.content()],
  theme: {
    extend: {
      colors: {
        primary: "#A9B7E0",
        secondary: "#5A71B4"
      }  
    }
  },
  plugins: [flowbite.plugin()],
}

