/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '15px'
    	},
    	screens: {
    		sm: '640px',
    		md: '768px',
    		lg: '960px',
    		xl: '1200px'
    	},
    	fontFamily: {
    		primary: 'var(--font-raleway)',
    		outfit: 'var(--font-outfit)'
    	},
    	extend: {
    		colors: {
    			primary: '#93ccdd',
    			text: '#1d365b',
    			secondary: '#155e81',
    			accent: {
    				DEFAULT: '#009ec9',
    				hover: '#719caa'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
  };