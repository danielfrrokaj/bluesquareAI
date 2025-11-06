import Link from 'next/link';
import { BrainCircuit, Phone, Mail } from 'lucide-react';

type FooterProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    tagline: 'We bring smart technology to every business—fast, beautiful, and affordable.',
    copyright: `© ${new Date().getFullYear()} Blue Square AI. All rights reserved.`,
    locations: 'Locations',
    albania: 'Albania',
    international: 'International',
    contact: 'Contact',
  },
  sq: {
    tagline: 'Ne sjellim teknologjinë e zgjuar në çdo biznes — shpejt, bukur dhe me kosto të ulët.',
    copyright: `© ${new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.`,
    locations: 'Vendndodhjet',
    albania: 'Shqipëri',
    international: 'Ndërkombëtar',
    contact: 'Kontakt',
  },
};


export function Footer({ lang }: FooterProps) {
  const t = translations[lang];
  return (
    <footer className="bg-background border-t">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start gap-4">
            <Link href={`/?lang=${lang}`} className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-headline">Blue Square AI</span>
            </Link>
            <p className="max-w-xs text-muted-foreground">
              {t.tagline}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2 font-headline">{t.contact}</h3>
                <div className="space-y-2 text-sm">
                   <a href="tel:+355123456789" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <Phone className="h-4 w-4" />
                    +355 123 456 789
                  </a>
                  <a href="mailto:contact@bluesquare.ai" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <Mail className="h-4 w-4" />
                    contact@bluesquare.ai
                  </a>
                </div>
              </div>
               <div>
                <h3 className="font-semibold mb-2 font-headline">{t.locations}</h3>
                <div className="space-y-2 text-sm">
                   <Link href="?lang=sq" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    {t.albania}
                  </Link>
                   <Link href="?lang=en" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    {t.international}
                  </Link>
                </div>
              </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
         {t.copyright}
        </div>
      </div>
    </footer>
  );
}
