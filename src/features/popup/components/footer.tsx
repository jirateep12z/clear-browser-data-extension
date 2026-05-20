import { IsChromeExtension } from '@/lib/is-chrome-extension';
import { Coffee, Heart } from 'lucide-react';
import { memo, useCallback } from 'react';
import { DONATE_URL } from '../constants/popup';

export const Footer = memo(function Footer() {
  const HandleDonateClick = useCallback(() => {
    if (IsChromeExtension()) {
      chrome.tabs.create({ url: DONATE_URL });
    } else {
      window.open(DONATE_URL, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <footer className="border-border mt-4 border-t pt-3">
      <div className="flex flex-col items-center gap-3">
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          Made with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> by
          <span className="text-foreground font-medium">jirateep12z</span>
        </p>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-400/15 dark:text-green-400 dark:hover:bg-green-400/25"
          onClick={HandleDonateClick}
        >
          <Coffee className="h-3.5 w-3.5" />
          Buy me a coffee
        </button>
      </div>
    </footer>
  );
});
