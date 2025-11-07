
'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export function Footer({ lang }: { lang: 'en' | 'sq' }) {
    const content = {
        sq: {
            description: "Ne sjellim teknologjinë e zgjuar në çdo biznes — shpejt, bukur dhe me kosto të ulët.",
            locationsTitle: "Gjuhët:",
            albania: "Shqip",
            international: "Anglisht",
            copyright: `© ${new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.`,
            contact: "Kontakt"
        },
        en: {
            description: "We bring smart technology to every business—fast, beautiful, and affordable.",
            locationsTitle: "Languages:",
            albania: "Albanian",
            international: "English",
            copyright: `© ${new Date().getFullYear()} Blue Square AI. All rights reserved.`,
            contact: "Contact"
        }
    }
    const currentContent = content[lang];
    
    const getFullHref = (href: string) => {
      if (href.startsWith('/#')) {
          return `/?lang=${lang}${href.substring(1)}`;
      }
      return `${href}?lang=${lang}`;
    };

  return (
    <footer id="contact-footer" className="bg-card border-t mt-auto">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4">
                <Link href={getFullHref('/')} className="flex items-center space-x-2 font-bold text-2xl font-headline">
                    Blue Square AI
                </Link>
                <p className="max-w-xs text-muted-foreground text-sm">
                    {currentContent.description}
                </p>
            </div>
            <div className="grid gap-4">
                 <h3 className="font-semibold font-headline">{currentContent.contact}</h3>
                 <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href="tel:+35512345678" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        +355 123 456 78
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href="mailto:info@bluesquare.ai" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        info@bluesquare.ai
                    </a>
                </div>
            </div>
             <div className="grid gap-4">
                 <h3 className="font-semibold font-headline">{currentContent.locationsTitle}</h3>
                <Link href="?lang=sq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {currentContent.albania}
                </Link>
                <Link href="?lang=en" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {currentContent.international}
                </Link>
            </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>{currentContent.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
