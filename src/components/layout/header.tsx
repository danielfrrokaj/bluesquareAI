'use client';

import Link from 'next/link';
import { BrainCircuit, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type HeaderProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    services: 'Services',
    products: 'Products',
    vision: 'Vision',
    contact: 'Contact Us',
    servicesList: [
        { href: '/services/ai-website-integration', label: 'AI Website Integration' },
        { href: '/services/management-and-monitoring-systems', label: 'Management & Monitoring Systems' },
        { href: '/services/communication-automation', label: 'Communication Automation' },
        { href: '/services/solutions-for-local-businesses', label: 'Solutions for Local Businesses' },
        { href: '/services/ai-for-tourism-and-services', label: 'AI for Tourism & Services' },
        { href: '/services/in-depth-analysis', label: 'In-Depth Analysis' },
    ]
  },
  sq: {
    services: 'Shërbimet',
    products: 'Produktet',
    vision: 'Vizioni',
    contact: 'Na Kontaktoni',
    servicesList: [
        { href: '/services/ai-website-integration', label: 'Integrim i AI në Website' },
        { href: '/services/management-and-monitoring-systems', label: 'Sisteme Menaxhimi & Monitorimi' },
        { href: '/services/communication-automation', label: 'Automatizim Komunikimi' },
        { href: '/services/solutions-for-local-businesses', label: 'Zgjidhje për Biznese Lokale' },
        { href: '/services/ai-for-tourism-and-services', label: 'AI për Turizëm & Shërbime' },
        { href: '/services/in-depth-analysis', label: 'Analizë e Thelluar' },
    ]
  },
};

export function Header({ lang }: HeaderProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const t = translations[lang];

  const navLinks = [
    { href: '#products', label: t.products },
    { href: '#vision', label: t.vision },
    { href: '#contact', label: t.contact },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Check if it's a link to a section on the same page
    if(href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
    setSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href={`/?lang=${lang}`} className="mr-6 flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline inline-block">Blue Square AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link href="#services" onClick={(e) => handleLinkClick(e, '#services')} className="flex items-center transition-colors hover:text-primary">
                {t.services}
                <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {t.servicesList.map((service) => (
                <DropdownMenuItem key={service.href} asChild>
                  <Link href={`${service.href}?lang=${lang}`}>{service.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
           <div className="hidden sm:flex items-center gap-2 text-sm">
             <Link href="?lang=sq" className={cn("hover:text-primary transition-colors", lang === 'sq' && 'text-primary font-semibold')}>AL</Link>
             <span className="text-muted-foreground">/</span>
             <Link href="?lang=en" className={cn("hover:text-primary transition-colors", lang === 'en' && 'text-primary font-semibold')}>EN</Link>
           </div>
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-4 pt-6">
                <Link href={`/?lang=${lang}`} className="flex items-center space-x-2 mb-4" onClick={() => setSheetOpen(false)}>
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline">Blue Square AI</span>
                </Link>
                {/* Mobile nav needs to be updated as well */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-between text-lg font-medium transition-colors hover:text-primary w-full">
                        {t.services}
                        <ChevronDown className="relative top-[1px] ml-1 h-4 w-4" />
                    </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    {t.servicesList.map((service) => (
                        <DropdownMenuItem key={service.href} asChild>
                        <Link href={`${service.href}?lang=${lang}`} onClick={()=>setSheetOpen(false)}>{service.label}</Link>
                        </DropdownMenuItem>
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}

                 <div className="flex items-center gap-2 text-lg font-medium pt-4">
                  <Link href="?lang=sq" onClick={() => setSheetOpen(false)} className={cn("hover:text-primary transition-colors", lang === 'sq' && 'text-primary font-semibold')}>AL</Link>
                  <span className="text-muted-foreground">/</span>
                  <Link href="?lang=en" onClick={() => setSheetOpen(false)} className={cn("hover:text-primary transition-colors", lang === 'en' && 'text-primary font-semibold')}>EN</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
