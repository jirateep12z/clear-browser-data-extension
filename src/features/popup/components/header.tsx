import { Trash2 } from 'lucide-react';
import { memo } from 'react';

export const Header = memo(function Header() {
  return (
    <header className="flex items-center border-b pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
          <Trash2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Clear Browser Data</h1>
        </div>
      </div>
    </header>
  );
});
