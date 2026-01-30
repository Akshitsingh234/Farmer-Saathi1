import { Hammer } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <nav className="flex w-full flex-row items-center gap-4 text-lg font-medium md:text-sm">
        <a
          href="#"
          className="flex items-center gap-2 text-lg font-semibold text-primary md:text-base"
        >
          <Hammer className="h-6 w-6" />
          <span className="font-headline text-xl">ArtisanFlow</span>
        </a>
      </nav>
    </header>
  );
}
