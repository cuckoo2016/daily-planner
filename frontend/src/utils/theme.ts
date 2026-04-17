type Theme = 'light' | 'dark' | 'system';

const DARK_CLASS = 'dark';

export function applyTheme(theme: Theme): void {
  const root = window.document.documentElement;
  root.classList.remove(DARK_CLASS);

  if (theme === 'dark') {
    root.classList.add(DARK_CLASS);
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add(DARK_CLASS);
    }
  }
}

export function getSystemThemePreference(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 监听系统主题变化
export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
