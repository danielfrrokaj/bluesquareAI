'use client';

import Link from 'next/link';
import { Menu, ChevronDown, Code, MessageCircle, Zap, Plane, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import FlagIcon from '@/components/flag-icon';
import { ScrollArea } from '@/components/ui/scroll-area';


const navLinksSq = [
  { href: '/#vision', label: 'Vizioni' },
  { href: '/contact', label: 'Kontakti' },
];

const navLinksEn = [
  { href: '/#vision', label: 'Vision' },
  { href: '/contact', label: 'Contact' },
];

const servicesEn = [
    {
        title: "AI for Innovation",
        href: "/services/ai-innovation",
        description: "Mobile Apps like ShqipFol, Chatbots, Openclaw, N8N, and Automations.",
        icon: <MessageCircle className="h-5 w-5" />
    },
    {
        title: "Tourism Systems",
        href: "/services/tourism-systems",
        description: "Discover Albania PMS, Booking Engine, Channel Manager, and AI Integrations.",
        icon: <Plane className="h-5 w-5" />
    },
    {
        title: "Quick Solutions",
        href: "/services/quick-solutions",
        description: "SEO-optimized websites with CMS starting from 300 euro.",
        icon: <Zap className="h-5 w-5" />
    },
];

const servicesSq = [
    {
        title: "AI për Inovacion",
        href: "/services/ai-innovation",
        description: "Aplikacione Mobile si ShqipFol, Chatbote, Openclaw, N8N dhe Automatizime.",
        icon: <MessageCircle className="h-5 w-5" />
    },
    {
        title: "Sisteme për Turizëm",
        href: "/services/tourism-systems",
        description: "Discover Albania PMS, Booking Engine, Channel Manager dhe integrime AI.",
        icon: <Plane className="h-5 w-5" />
    },
    {
        title: "Zgjidhje të Shpejta",
        href: "/services/quick-solutions",
        description: "Website të optimizuar për SEO me CMS duke filluar nga 300 euro.",
        icon: <Zap className="h-5 w-5" />
    },
];

export function Header({ lang }: { lang: 'en' | 'sq' }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const homeLink = { href: '/', label: lang === 'sq' ? 'Kryefaqja' : 'Home' };
  const navLinks = lang === 'sq' ? navLinksSq : navLinksEn;
  const services = lang === 'sq' ? servicesSq : servicesEn;
  
  const ctaContent = {
      en: { label: "Get a free consultation", href: "/contact" },
      sq: { label: "Merr një konsultim falas", href: "/contact" },
  };
  const currentCta = ctaContent[lang];
  
  // Removed tagline content

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
      
      if (pathname === '/') {
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
  
  const getFullHref = (href: string) => {
    if (href.startsWith('/#')) {
        return `/?lang=${lang}${href.substring(1)}`;
    }
    return `${href}?lang=${lang}`;
  };
  
  const createLanguageSwitchHref = (newLang: 'en' | 'sq') => {
    const currentPath = pathname;
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('lang', newLang);
    return `${currentPath}?${currentParams.toString()}`;
  };
  
  const languageOptions: { code: 'en' | 'sq', label: string, countryCode: 'us' | 'al' }[] = [
    { code: 'en', label: 'English', countryCode: 'us' },
    { code: 'sq', label: 'Shqip', countryCode: 'al' },
  ];
  
  const currentLanguage = languageOptions.find(opt => opt.code === lang);


  const renderNavLinks = (isMobile = false) => {
    if (isMobile) {
      return (
        <div className="flex flex-col space-y-4">
          <Link
            href={getFullHref(homeLink.href)}
            onClick={(e) => handleLinkClick(e, homeLink.href)}
            className="text-lg px-4"
          >
            {homeLink.label}
          </Link>
          <p className="font-bold text-lg px-4">{lang === 'sq' ? 'Shërbimet' : 'Services'}</p>
          {services.map((service) => (
            <Link key={service.href} href={getFullHref(service.href)} className="text-muted-foreground hover:text-primary pl-8" onClick={() => setSheetOpen(false)}>
              {service.title}
            </Link>
          ))}
          <p className="font-bold text-lg px-4 pt-4">{lang === 'sq' ? 'Menu' : 'Menu'}</p>
          {navLinks.map((link) => (
             <Link
              key={link.href}
              href={getFullHref(link.href)}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-lg px-4"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile CTA Button */}
          <div className="px-4 pt-4">
            <Button asChild className="w-full">
                <Link href={getFullHref(currentCta.href)} onClick={() => setSheetOpen(false)}>
                    {currentCta.label}
                </Link>
            </Button>
          </div>
          
          {/* Mobile Language Switch (Dropdown style for consistency) */}
          <div className="px-4 pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  {currentLanguage?.label}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {languageOptions.map((option) => (
                  <Link key={option.code} href={createLanguageSwitchHref(option.code)} passHref legacyBehavior>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", option.code === lang && "bg-accent text-accent-foreground")}
                      onClick={() => setSheetOpen(false)}
                    >
                      <FlagIcon countryCode={option.countryCode} className="mr-2" />
                      {option.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )
    }

    return (
       <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem>
                <Link href={getFullHref(homeLink.href)} legacyBehavior passHref>
                    <NavigationMenuLink 
                        className={navigationMenuTriggerStyle()}
                        onClick={(e) => handleLinkClick(e, homeLink.href)}
                    >
                        {homeLink.label}
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{lang === 'sq' ? 'Shërbimet' : 'Services'}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {services.map((service) => (
                  <ListItem
                    key={service.title}
                    title={service.title}
                    href={getFullHref(service.href)}
                    icon={service.icon}
                  >
                    {service.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {navLinks.map((link) => (
            <NavigationMenuItem key={link.href}>
                <Link href={getFullHref(link.href)} legacyBehavior passHref>
                    <NavigationMenuLink 
                        className={navigationMenuTriggerStyle()}
                        onClick={(e) => handleLinkClick(e, link.href)}
                    >
                        {link.label}
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "border-b border-black/5 bg-white/95 backdrop-blur-md" : "bg-transparent"
    )}>
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={getFullHref('/')} onClick={(e) => handleLinkClick(e, '/')} className="flex items-center">
              <Image 
                  src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/logo/logo_black%20(1).png"
                  alt="Blue Square AI Logo"
                  width={140}
                  height={35}
                  className="w-36 h-auto"
                  priority
              />
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {renderNavLinks()}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {/* Language Switch for Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 hover:bg-black/5">
                <FlagIcon countryCode={currentLanguage?.countryCode || 'us'} />
                <span className="text-xs font-semibold tracking-wider">{lang.toUpperCase()}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border-border">
              {languageOptions.map((option) => (
                <Link key={option.code} href={createLanguageSwitchHref(option.code)} passHref legacyBehavior>
                  <DropdownMenuItem 
                    className={cn("cursor-pointer focus:bg-black/5", option.code === lang && "bg-black/5")}
                  >
                    <FlagIcon countryCode={option.countryCode} className="mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop CTA Button */}
          <Button asChild size="sm" className="hidden md:inline-flex bg-black text-white hover:bg-black/90 font-medium px-6 rounded-full transition-all active:scale-95">
            <Link href={getFullHref(currentCta.href)}>
                {currentCta.label}
            </Link>
          </Button>
          
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-black/5">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-white p-0 border-l border-border">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                    <Link href={getFullHref('/')} className="flex items-center" onClick={() => setSheetOpen(false)}>
                        <Image 
                            src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/logo/logo_black%20(1).png"
                            alt="Blue Square AI Logo"
                            width={120}
                            height={30}
                            className="w-32 h-auto"
                            priority
                        />
                    </Link>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col space-y-6 pt-4 pb-8">
                        {renderNavLinks(true)}
                    </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string, icon: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-black/5 hover:text-black focus:bg-black/5 focus:text-black",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            <span className="text-black/70 group-hover:text-black transition-colors">{icon}</span>
            <div className="text-sm font-semibold leading-none text-black/90">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"