'use client';

import Link from 'next/link';
import { BrainCircuit, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

type HeaderProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    services: 'Services',
    products: 'Products',
    vision: 'Vision',
    contact: 'Contact Us',
  },
  sq: {
    services: 'Shërbimet',
    products: 'Produktet',
    vision: 'Vizioni',
    contact: 'Na Kontaktoni',
  },
};

export function Header({ lang }: HeaderProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const t = translations[lang];

  const navLinks = [
    { href: '#services', label: t.services },
    { href: '#products', label: t.products },
    { href: '#vision', label: t.vision },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
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
          <Button className="hidden sm:inline-flex" asChild>
            <Link href="#contact">{t.contact}</Link>
          </Button>
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
                <Button asChild className="mt-4">
                   <Link href="#contact" onClick={(e) => handleLinkClick(e, '#contact')}>{t.contact}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
