'use client';

import Link from 'next/link';
import { BrainCircuit, Menu } from 'lucide-react';
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
                  <Link href={sublink.href}>{sublink.label}</Link>
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
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline inline-block">Blue Square AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {renderNavLinks()}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" className="hidden sm:inline-flex">Login</Button>
          <Button className="hidden sm:inline-flex bg-gradient-to-r from-primary to-secondary text-primary-foreground">Sign Up</Button>
          
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
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold font-headline">Blue Square AI</span>
                </Link>
                {renderNavLinks(true)}
                <div className="flex flex-col space-y-2 pt-6">
                  <Button variant="outline">Login</Button>
                  <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">Sign Up</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
