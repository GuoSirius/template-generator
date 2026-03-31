import { defineConfig, presetUno, presetAttributify, presetIcons, transformerDirectives, } from 'unocss';
export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
            scale: 1.2,
            warn: true,
        }),
    ],
    transformers: [transformerDirectives()],
    theme: {
        colors: {
            primary: '#38BDF8',
            'primary-dark': '#0284C7',
            accent: '#22C55E',
            danger: '#EF4444',
            warning: '#F59E0B',
            purple: '#8B5CF6',
        },
    },
    safelist: ['bg-primary', 'text-primary', 'bg-danger', 'text-danger'],
    shortcuts: {
        'btn-primary': 'bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer',
        'btn-accent': 'bg-accent text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer',
        'btn-danger': 'bg-danger text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer',
        'btn-purple': 'bg-purple text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer',
        'btn-warning': 'bg-warning text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer',
        'btn-secondary': 'bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer',
    },
});
