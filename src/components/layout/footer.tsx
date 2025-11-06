'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 32" width={130} height={32} {...props}>
        <g>
            <path fill="#0d47a1" d="M2.5,2.5v27h27v-27h-27Zm24.5,24.5h-22v-22h22v22Z" />
            <path fill="#1565c0" d="M4,4V28H28V4H4Zm21.5,21.5h-19v-19h19v19Z" />
            <path fill="#42a5f5" d="M5.5,5.5v21h21v-21h-21Zm18.5,18.5h-16v-16h16v16Z" />
            <path fill="#1976d2" d="M7,7V25H25V7H7Zm15.5,15.5h-13v-13h13v13Z" />
            <path fill="#0d47a1" d="M12,12v8h8v-8h-8Zm5.5,5.5h-3v-3h3v3Z" />
            <path fill="#1e88e5" d="M29.5,2.5l-4,4h-21l-4-4h-0.5v0.5l4,4v21l-4,4v0.5h0.5l4-4h21l4,4h0.5v-0.5l-4-4v-21l4-4v-0.5h-0.5Z M28,28H4V4H28V28Z" />
            <path fill="#1e88e5" d="M25,7l-4,4h-9l-4-4h-1v1l4,4v9l-4,4v1h1l4-4h9l4,4h1v-1l-4-4v-9l4-4v-1h-1Z M23,23H9V9H23V23Z" />
f           <path fill="#90caf9" d="M17,16.5c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M19,17.5c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M14,14.5c-0.6,0-1,0.4-1,1v1c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1c0-0.6-0.4-1-1-1h-1Zm0.5,2.5h-0.5c-0.3,0-0.5-0.2-0.5-0.5v-1c0-0.3,0.2-0.5,0.5-0.5h1c0.3,0,0.5,0.2,0.5,0.5v1c0,0.3-0.2,0.5-0.5,0.5h-0.5Z" />
            <path fill="#90caf9" d="M16.5,12c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M19.5,14c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M13.5,12c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M11.5,14c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M13,17.5c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M10,17.5c-0.3,0-0.5,0.2-0.5,0.5v1c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1c0-0.3-0.2-0.5-0.5-0.5Z" />
            <path fill="#90caf9" d="M15,19.5c-0.6,0-1,0.4-1,1v1c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1c0-0.6-0.4-1-1-1h-1Zm0.5,2.5h-0.5c-0.3,0-0.5-0.2-0.5-0.5v-1c0-0.3,0.2-0.5,0.5-0.5h1c0.3,0,0.5,0.2,0.5,0.5v1c0,0.3-0.2,0.5-0.5,0.5h-0.5Z" />
            <path fill="#90caf9" d="M11,19.5c-0.6,0-1,0.4-1,1v1c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1c0-0.6-0.4-1-1-1h-1Zm0.5,2.5h-0.5c-0.3,0-0.5-0.2-0.5-0.5v-1c0-0.3,0.2-0.5,0.5-0.5h1c0.3,0,0.5,0.2,0.5,0.5v1c0,0.3-0.2,0.5-0.5,0.5h-0.5Z" />
        </g>
        <text x="35" y="22" fill="#1e88e5" style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            BlueSquare<tspan fill="#42a5f5">A</tspan><tspan fill="#90caf9">i</tspan>
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
