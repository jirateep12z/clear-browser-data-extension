import type { Theme } from '../types/theme';

export function ApplyTheme(theme: Theme): void {
  const is_dark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', is_dark);
}
