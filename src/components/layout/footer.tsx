
'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    <footer id="contact-footer" className="bg-white border-t border-black/5 mt-auto">
      <div className="container py-16 px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-4">
            <div className="flex flex-col gap-6 md:col-span-1">
                <Link href={getFullHref('/')} className="flex items-center space-x-2">
                    <Image 
                        src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/logo/logo_black%20(1).png"
                        alt="Blue Square AI Logo"
                        width={180}
                        height={45}
                        className="w-44 h-auto"
                    />
                </Link>
                <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
                    {currentContent.description}
                </p>
            </div>
            
            <div className="grid gap-6">
                 <h3 className="font-bold font-headline text-black text-lg tracking-tight">{lang === 'sq' ? 'Menu' : 'Menu'}</h3>
                 <nav className="flex flex-col gap-3">
                    <Link href={getFullHref('/services')} className="text-muted-foreground hover:text-black transition-colors font-medium">
                        {lang === 'sq' ? 'Shërbimet' : 'Services'}
                    </Link>
                    <Link href={getFullHref('/products')} className="text-muted-foreground hover:text-black transition-colors font-medium">
                        {lang === 'sq' ? 'Produktet' : 'Products'}
                    </Link>
                    <Link href={getFullHref('/pricing')} className="text-muted-foreground hover:text-black transition-colors font-medium">
                        {lang === 'sq' ? 'Çmimet' : 'Pricing'}
                    </Link>
                    <Link href={getFullHref('/contact')} className="text-muted-foreground hover:text-black transition-colors font-medium">
                        {lang === 'sq' ? 'Kontakt' : 'Contact'}
                    </Link>
                 </nav>
            </div>

            <div className="grid gap-6">
                 <h3 className="font-bold font-headline text-black text-lg tracking-tight">{currentContent.contact}</h3>
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 group">
                        <div className="p-2.5 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-all duration-300">
                            <Phone className="h-4 w-4" />
                        </div>
                        <a href="tel:+355693815070" className="text-muted-foreground hover:text-black transition-colors font-medium">
                            +355 69 381 5070
                        </a>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="p-2.5 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-all duration-300">
                            <Mail className="h-4 w-4" />
                        </div>
                        <a href="mailto:info@bluesquare.ai" className="text-muted-foreground hover:text-black transition-colors font-medium">
                            info@bluesquare.ai
                        </a>
                    </div>
                </div>
            </div>

             <div className="grid gap-6">
                 <h3 className="font-bold font-headline text-black text-lg tracking-tight">{currentContent.locationsTitle}</h3>
                 <div className="flex flex-col gap-3">
                    <Link href="?lang=sq" className={cn("text-muted-foreground hover:text-black transition-colors font-medium flex items-center gap-2", lang === 'sq' && "text-black")}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {currentContent.albania}
                    </Link>
                    <Link href="?lang=en" className={cn("text-muted-foreground hover:text-black transition-colors font-medium flex items-center gap-2", lang === 'en' && "text-black")}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {currentContent.international}
                    </Link>
                </div>
            </div>
        </div>
        
        <div className="border-t border-black/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground font-medium">
                {currentContent.copyright}
            </p>
            <div className="flex gap-8 text-sm text-muted-foreground font-medium">
                <Link href="#" className="hover:text-black transition-colors">{lang === 'sq' ? 'Privatësia' : 'Privacy'}</Link>
                <Link href="#" className="hover:text-black transition-colors">{lang === 'sq' ? 'Kushtet' : 'Terms'}</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}

    
