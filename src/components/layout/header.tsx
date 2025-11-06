'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react';

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

const navLinksSq = [
  { href: '#home', label: 'Kryefaqja' },
  { 
    href: '#services', 
    label: 'Shërbimet',
  },
  { href: '#products', label: 'Produktet' },
  { href: '#vision', label: 'Vizioni' },
  { href: '#contact', label: 'Kontakti' },
];

const navLinksEn = [
  { href: '#home', label: 'Home' },
  { 
    href: '#services', 
    label: 'Services',
  },
  { href: '#products', label: 'Products' },
  { href: '#vision', label: 'Vision' },
  { href: '#contact', label: 'Contact' },
];

export function Header({ lang }: { lang: 'en' | 'sq' }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navLinks = lang === 'sq' ? navLinksSq : navLinksEn;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setSheetOpen(false);
  };

  const renderNavLinks = (isMobile = false) => {
    return navLinks.map((link) => {
      if (link.sublinks) {
        return (
          <DropdownMenu key={link.href}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("flex items-center gap-1", isMobile ? 'justify-start w-full text-lg' : 'text-sm font-medium text-muted-foreground transition-colors hover:text-primary')}>
                {link.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {link.sublinks.map(sublink => (
                <DropdownMenuItem key={sublink.href} asChild>
                  <Link href={sublink.href + `?lang=${lang}`}>{sublink.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={(e) => handleLinkClick(e, link.href)}
          className={cn(isMobile ? 'text-lg' : 'text-sm font-medium text-muted-foreground transition-colors hover:text-primary')}
        >
          {link.label}
        </Link>
      );
    });
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-transparent"
    )}>
      <div className="container flex h-20 items-center">
        <Link href="#home" onClick={(e) => handleLinkClick(e, '#home')} className="mr-6 flex items-center space-x-2">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {renderNavLinks()}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs bg-card">
              <div className="flex flex-col space-y-6 pt-10">
                <Link href="/" className="flex items-center space-x-2 mb-4" onClick={() => setSheetOpen(false)}>
                  <Logo className="h-8 w-auto" />
                </Link>
                {renderNavLinks(true)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
