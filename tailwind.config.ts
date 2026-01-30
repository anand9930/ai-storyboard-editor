import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        /* Flow-specific colors for ReactFlow canvas */
        flow: {
          canvas: 'hsl(var(--flow-canvas-bg))',
          dots: 'hsl(var(--flow-canvas-dots))',
          edge: 'hsl(var(--flow-edge-stroke))',
          minimap: 'hsl(var(--flow-minimap-bg))',
          controls: 'hsl(var(--flow-controls-bg))',
        },
        /* Scrollbar colors */
        scrollbar: {
          track: 'hsl(var(--scrollbar-track))',
          thumb: 'hsl(var(--scrollbar-thumb))',
        },
        /* Surface colors for consistent theming */
        surface: {
          primary: 'hsl(var(--surface-primary))',
          secondary: 'hsl(var(--surface-secondary))',
          elevated: 'hsl(var(--surface-elevated))',
        },
        /* Semantic text colors */
        'theme-text': {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          muted: 'hsl(var(--text-muted))',
        },
        /* Interactive state colors */
        interactive: {
          hover: 'hsl(var(--interactive-hover))',
          active: 'hsl(var(--interactive-active))',
        },
        /* Node colors */
        node: {
          bg: 'hsl(var(--node-bg))',
          border: 'hsl(var(--node-border))',
          'border-selected': 'hsl(var(--node-border-selected))',
        },
        /* Status colors */
        status: {
          error: 'hsl(var(--status-error))',
          success: 'hsl(var(--status-success))',
          warning: 'hsl(var(--status-warning))',
          processing: 'hsl(var(--status-processing))',
        },
        /* Accent highlights */
        'accent-blue': 'hsl(var(--accent-blue))',
        'accent-yellow': 'hsl(var(--accent-yellow))',
      },
      borderColor: {
        node: 'hsl(var(--node-border))',
        'node-selected': 'hsl(var(--node-border-selected))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
