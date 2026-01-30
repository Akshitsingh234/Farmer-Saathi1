import Link from 'next/link';
import { Sprout } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Sprout className="h-8 w-8 text-green-600" />
      <span className="inline-block font-headline text-2xl font-bold text-green-800">
        Farmer Saathi
      </span>
    </Link>
  );
}
