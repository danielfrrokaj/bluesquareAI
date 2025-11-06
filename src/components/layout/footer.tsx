'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 32" width={130} height={32} {...props}>
        <defs>
            <linearGradient id="logo-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#1e88e5'}} />
                <stop offset="100%" style={{stopColor: '#0d47a1'}} />
            </linearGradient>
            <linearGradient id="logo-text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#1565c0'}} />
                <stop offset="50%" style={{stopColor: '#42a5f5'}} />
                <stop offset="100%" style={{stopColor: '#90caf9'}} />
            </linearGradient>
        </defs>
        <rect width="32" height="32" rx="6" fill="url(#logo-bg-gradient)" />
        <path fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M10 13a3 3 0 01-3-3m-1 8a3 3 0 003-3m10 3a3 3 0 013-3m-12-4a3 3 0 01-3 3m7 5a3 3 0 00-3 3m4-11a3 3 0 013 3M16 8a4 4 0 00-8 0m8 16a4 4 0 01-8 0M8 16a4 4 0 000-8 4 4 0 000 8zm16 0a4 4 0 010-8 4 4 0 010 8z" transform="scale(0.6) translate(10, 10)" />
        <circle cx="11.5" cy="11.5" r="1" fill="#000" transform="scale(0.6) translate(10, 10)" />
        <circle cx="20.5" cy="11.5" r="1" fill="#000" transform="scale(0.6) translate(10, 10)" />
        <circle cx="11.5" cy="20.5" r="1" fill="#000" transform="scale(0.6) translate(10, 10)" />
        <circle cx="20.5" cy="20.5" r="1" fill="#000" transform="scale(0.6) translate(10, 10)" />
        <circle cx="16" cy="16" r="1.5" fill="#000" transform="scale(0.6) translate(10, 10)" />
        <text x="38" y="22" fill="url(#logo-text-gradient)" style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            BlueSquareAI
        </text>
    </svg>
);

export function Footer({ lang }: { lang: 'en' | 'sq' }) {
    const content = {
        sq: {
            description: "Ne sjellim teknologjinë e zgjuar në çdo biznes — shpejt, bukur dhe me kosto të ulët.",
            locationsTitle: "Vendndodhjet:",
            albania: "Shqipëri",
            international: "Ndërkombëtar",
            copyright: `© ${new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.`,
            contact: "Kontakt"
        },
        en: {
            description: "We bring smart technology to every business—fast, beautiful, and affordable.",
            locationsTitle: "Locations:",
            albania: "Albania",
            international: "International",
            copyright: `© ${new Date().getFullYear()} Blue Square AI. All rights reserved.`,
            contact: "Contact"
        }
    }
    const currentContent = content[lang];

  return (
    <footer id="contact-footer" className="bg-card border-t mt-auto">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4">
                <Link href="/" className="flex items-center space-x-2">
                    <Logo className="h-8 w-auto" />
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
