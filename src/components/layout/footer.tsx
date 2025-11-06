import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-card border-t">
      <div className="container py-8 flex flex-col items-center justify-center text-center">
        <Link href="/" className="flex items-center space-x-2 mb-4">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline">Blue Square AI</span>
        </Link>
        <p className="max-w-md text-muted-foreground mb-4">
          Ne sjellim teknologjinë e zgjuar në çdo biznes — shpejt, bukur dhe me kosto të ulët.
        </p>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.
        </p>
      </div>
    </footer>
  );
}
