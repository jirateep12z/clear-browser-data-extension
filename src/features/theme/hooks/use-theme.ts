import { useEffect, useLayoutEffect, useState } from 'react';
import type { ResolvedTheme, Theme } from '../types/theme';

export function UseTheme(theme: Theme = 'system') {
  const [system_dark, set_system_dark] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  const resolved_theme: ResolvedTheme =
    theme === 'system' ? (system_dark ? 'dark' : 'light') : theme;

  useLayoutEffect(() => {
    const root = document.documentElement;

    if (resolved_theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolved_theme]);

  useEffect(() => {
    const media_query = window.matchMedia('(prefers-color-scheme: dark)');
    const HandleChange = (e: MediaQueryListEvent) => {
      set_system_dark(e.matches);
    };

    media_query.addEventListener('change', HandleChange);

    return () => media_query.removeEventListener('change', HandleChange);
  }, []);

  return { resolved_theme };
}
