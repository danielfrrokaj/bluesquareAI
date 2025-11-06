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

const navLinksSq = [
  { href: '#home', label: 'Kryefaqja' },
  { 
    href: '#services', 
    label: 'Shërbimet',
    sublinks: [
      { href: '/services/ai-website-integration', label: 'Integrim i AI në Website' },
      { href: '/services/management-systems', label: 'Sisteme Menaxhimi & Monitorimi' },
      { href: '/services/communication-automation', label: 'Automatizim Komunikimi' },
      { href: '/services/local-business-solutions', label: 'Zgjidhje për Biznese Lokale' },
      { href: '/services/tourism-ai', label: 'AI për Turizëm & Shërbime' },
    ]
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
    sublinks: [
      { href: '/services/ai-website-integration', label: 'AI Website Integration' },
      { href: '/services/management-systems', label: 'Management & Monitoring Systems' },
      { href: '/services/communication-automation', label: 'Communication Automation' },
      { href: '/services/local-business-solutions', label: 'Local Business Solutions' },
      { href: '/services/tourism-ai', label: 'AI for Tourism & Services' },
    ]
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
