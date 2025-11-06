'use client';

import Link from 'next/link';
import { Bot, BrainCircuit } from 'lucide-react';

export function Footer({ lang }: { lang: 'en' | 'sq' }) {
  return (
    <footer id="contact" className="bg-card border-t">
      <div className="container py-8 flex flex-col items-center justify-center text-center">
        <Link href="/" className="flex items-center space-x-2 mb-4">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline">Blue Square AI</span>
        </Link>
        <p className="max-w-md text-muted-foreground mb-4">
          {lang === 'sq'
            ? 'Ne sjellim teknologjinë e zgjuar në çdo biznes — shpejt, bukur dhe me kosto të ulët.'
            : 'We bring smart technology to every business—fast, beautiful, and affordable.'}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <span>Locations:</span>
          <Link href="?lang=sq" className="hover:text-primary transition-colors">
            Albania
          </Link>
          <Link href="?lang=en" className="hover:text-primary transition-colors">
            International
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.
        </p>
      </div>
    </footer>
  );
}
