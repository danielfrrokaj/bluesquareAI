import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

type FooterProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    tagline: 'We bring smart technology to every business—fast, beautiful, and affordable.',
    copyright: `© ${new Date().getFullYear()} Blue Square AI. All rights reserved.`,
    locations: 'Locations:',
    albania: 'Albania',
    international: 'International',
  },
  sq: {
    tagline: 'Ne sjellim teknologjinë e zgjuar në çdo biznes — shpejt, bukur dhe me kosto të ulët.',
    copyright: `© ${new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.`,
    locations: 'Vendndodhjet:',
    albania: 'Shqipëri',
    international: 'Ndërkombëtar',
  },
};


export function Footer({ lang }: FooterProps) {
  const t = translations[lang];
  return (
    <footer id="contact" className="bg-card border-t">
      <div className="container py-8 flex flex-col items-center justify-center text-center">
        <Link href="/" className="flex items-center space-x-2 mb-4">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline">Blue Square AI</span>
        </Link>
        <p className="max-w-md text-muted-foreground mb-4">
          {t.tagline}
        </p>
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <span>{t.locations}</span>
            <Link href="?lang=sq" className="hover:text-primary transition-colors">{t.albania}</Link>
            <Link href="?lang=en" className="hover:text-primary transition-colors">{t.international}</Link>
        </div>
        <p className="text-sm text-muted-foreground">
         {t.copyright}
        </p>
      </div>
    </footer>
  );
}
