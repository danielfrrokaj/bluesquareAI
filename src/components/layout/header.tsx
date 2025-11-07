
'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { useRouter } from 'next/navigation';


const navLinksSq = [
  { href: '/#home', label: 'Kryefaqja' },
  { 
    href: '#services', 
    label: 'Shërbimet',
  },
  { href: '/#products', label: 'Produktet' },
  { href: '/pricing', label: 'Çmimet'},
  { href: '/#vision', label: 'Vizioni' },
  { href: '/#contact', label: 'Kontakti' },
];

const navLinksEn = [
  { href: '/#home', label: 'Home' },
  { 
    href: '#services', 
    label: 'Services',
  },
  { href: '/#products', label: 'Products' },
  { href: '/pricing', label: 'Pricing'},
  { href: '/#vision', label: 'Vision' },
  { href: '/#contact', label: 'Contact' },
];

export function Header({ lang }: { lang: 'en' | 'sq' }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navLinks = lang === 'sq' ? navLinksSq : navLinksEn;
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const targetId = href.substring(2);
      
      if (window.location.pathname === '/') {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push(`/?lang=${lang}#${targetId}`);
      }
    }
    setSheetOpen(false);
  };

  const renderNavLinks = (isMobile = false) => {
    return navLinks.map((link) => {
      if (link.label === 'Shërbimet' || link.label === 'Services') {
        return (
          <DropdownMenu key={link.href}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("flex items-center gap-1", isMobile ? 'justify-start w-full text-lg' : 'text-sm font-medium text-muted-foreground transition-colors hover:text-primary')}>
                {link.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href={`/services/ai-website-integration?lang=${lang}`}>{lang === 'sq' ? 'Integrim i AI në Website' : 'AI Website Integration'}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/services/management-systems?lang=${lang}`}>{lang === 'sq' ? 'Sisteme Menaxhimi & Monitorimi' : 'Management & Monitoring Systems'}</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href={`/services/communication-automation?lang=${lang}`}>{lang === 'sq' ? 'Automatizim Komunikimi' : 'Communication Automation'}</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href={`/services/local-business-solutions?lang=${lang}`}>{lang === 'sq' ? 'Zgjidhje për Biznese Lokale' : 'Solutions for Local Businesses'}</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href={`/services/tourism-ai?lang=${lang}`}>{lang === 'sq' ? 'AI për Turizëm & Shërbime' : 'AI for Tourism & Services'}</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      return (
        <Link
          key={link.href}
          href={`${link.href.startsWith('/#') ? '' : link.href}?lang=${lang}${link.href.startsWith('/#') ? link.href.substring(1) : ''}`}
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
        <Link href={`/?lang=${lang}#home`} onClick={(e) => handleLinkClick(e, '/#home')} className="mr-6 flex items-center space-x-2">
           <Image src="/logo.png" alt="Blue Square AI Logo" width={130} height={32} />
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
                  <Image src="/logo.png" alt="Blue Square AI Logo" width={130} height={32} />
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
