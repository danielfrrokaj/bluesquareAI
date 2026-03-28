
'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Footer({ lang }: { lang: 'en' | 'sq' }) {
    const content = {
        sq: {
            description: "Me bazë në Tiranë, ne përdorim Inteligjencën Artificiale për të ndërtuar inovacion në të gjithë Shqipërinë dhe rajonin e Ballkanit.",
            locationsTitle: "Gjuhët:",
            albania: "Shqip",
            international: "Anglisht",
            copyright: `© ${new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.`,
            contact: "Kontakt"
        },
        en: {
            description: "Based in Tirana, we use Artificial Intelligence to build innovation across Albania and the Balkan region.",
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
    <footer id="contact-footer" className="bg-white text-black border-t border-black/5 mt-auto relative overflow-hidden">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px] -z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-lime-400/[0.02] rounded-full blur-[120px] -z-0" />
      
      <div className="container py-24 px-4 md:px-6 relative z-10">
        <div className="grid gap-16 md:grid-cols-4">
            <div className="flex flex-col gap-10 md:col-span-1">
                <Link href={getFullHref('/')} className="flex items-center space-x-2">
                        <Image 
                            src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/logo/logo_black%20(1).png"
                            alt="Blue Square AI Logo"
                            width={180}
                            height={45}
                            className="w-44 h-auto"
                        />
                </Link>
                <p className="text-zinc-500 text-lg leading-relaxed max-w-xs font-medium tracking-tight">
                    {currentContent.description}
                </p>
                <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">AI</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-lime-50 border border-lime-100 flex items-center justify-center text-lime-600">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">UX</span>
                    </div>
                </div>
            </div>
            
            <div className="grid gap-8">
                 <h3 className="font-bold font-headline text-black text-xs tracking-[0.3em] uppercase opacity-40">{lang === 'sq' ? 'Menu' : 'Menu'}</h3>
                 <nav className="flex flex-col gap-6">
                    <Link href={getFullHref('/#vision')} className="text-zinc-600 hover:text-blue-600 transition-all duration-300 font-bold text-lg group flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all" />
                        {lang === 'sq' ? 'Vizioni' : 'Vision'}
                    </Link>
                    <Link href={getFullHref('/contact')} className="text-zinc-600 hover:text-blue-600 transition-all duration-300 font-bold text-lg group flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all" />
                        {lang === 'sq' ? 'Kontakt' : 'Contact'}
                    </Link>
                 </nav>
            </div>
            
            <div className="grid gap-8">
                 <h3 className="font-bold font-headline text-black text-xs tracking-[0.3em] uppercase opacity-40">{currentContent.contact}</h3>
                 <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-5 group">
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.03] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 shadow-sm">
                            <Phone className="h-5 w-5" />
                        </div>
                        <a href="tel:+355693815070" className="text-zinc-500 hover:text-black transition-colors font-bold text-xl tracking-tighter">
                            +355 69 381 5070
                        </a>
                    </div>
                    <div className="flex items-center gap-5 group">
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.03] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 shadow-sm">
                            <Mail className="h-5 w-5" />
                        </div>
                        <a href="mailto:info@bluesquare.ai" className="text-zinc-500 hover:text-black transition-colors font-bold text-xl tracking-tighter">
                            info@bluesquare.ai
                        </a>
                    </div>
                </div>
            </div>

             <div className="grid gap-8">
                 <h3 className="font-bold font-headline text-black text-xs tracking-[0.3em] uppercase opacity-40">{currentContent.locationsTitle}</h3>
                 <div className="flex flex-col gap-4">
                    <Link href="?lang=sq" className={cn("inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold transition-all duration-300 border", lang === 'sq' ? "bg-black text-white border-black" : "text-zinc-500 hover:text-black hover:bg-zinc-50 border-black/5")}>
                        {currentContent.albania}
                    </Link>
                    <Link href="?lang=en" className={cn("inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold transition-all duration-300 border", lang === 'en' ? "bg-black text-white border-black" : "text-zinc-500 hover:text-black hover:bg-zinc-50 border-black/5")}>
                        {currentContent.international}
                    </Link>
                </div>
            </div>
        </div>
        
        <div className="border-t border-black/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <p className="text-sm text-zinc-400 font-medium tracking-tight">
                {currentContent.copyright}
            </p>
            <div className="flex gap-10 text-[10px] text-zinc-400 font-bold tracking-[0.3em] uppercase">
                <Link href="#" className="hover:text-blue-600 transition-colors">{lang === 'sq' ? 'Privatësia' : 'Privacy'}</Link>
                <Link href="#" className="hover:text-blue-600 transition-colors">{lang === 'sq' ? 'Kushtet' : 'Terms'}</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}

    
