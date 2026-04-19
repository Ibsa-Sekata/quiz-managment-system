import { create } from 'zustand';

const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialDark = saved ? saved === 'dark' : prefersDark;

// Apply on load
if (initialDark) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

export const useThemeStore = create((set) => ({
    isDark: initialDark,

    toggleTheme: () =>
        set((state) => {
            const next = !state.isDark;
            if (next) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return { isDark: next };
        }),
}));
