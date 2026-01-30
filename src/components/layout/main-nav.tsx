'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/farmconnect/stories', label: 'Farm Stories' },
  { href: '/farmconnect/challenges', label: 'Challenges' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/crop-advisory', label: 'Crop Advisory' },
  { href: '/schemes', label: 'Schemes' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 flex">
      <Logo />
      <nav className="ml-6 hidden items-center space-x-6 text-sm font-medium md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === item.href ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
