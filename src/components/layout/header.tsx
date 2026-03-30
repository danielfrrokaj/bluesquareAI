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
import { motion, AnimatePresence } from 'framer-motion';


const navLinksSq = [
  { href: '/vision', label: 'Vizioni' },
  { href: '/contact', label: 'Kontakti' },
];

const navLinksEn = [
  { href: '/vision', label: 'Vision' },
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
  const isTransparentHeader = !isScrolled;

  const renderNavLinks = (isMobile = false) => {
    if (isMobile) {
      return (
        <div className="flex flex-col space-y-4">
          <Link
            href={getFullHref(homeLink.href)}
            onClick={(e) => handleLinkClick(e, homeLink.href)}
            className={cn("text-lg px-4 transition-colors", pathname === homeLink.href ? "text-blue-600 font-bold" : "text-black/70")}
          >
            {homeLink.label}
          </Link>
          <p className="font-bold text-lg px-4">{lang === 'sq' ? 'Shërbimet' : 'Services'}</p>
          {services.map((service) => (
            <Link 
                key={service.href} 
                href={getFullHref(service.href)} 
                className={cn("hover:text-primary pl-8 transition-colors", pathname === service.href ? "text-blue-600 font-bold" : "text-muted-foreground")} 
                onClick={() => setSheetOpen(false)}
            >
              {service.title}
            </Link>
          ))}
          <p className="font-bold text-lg px-4 pt-4">{lang === 'sq' ? 'Menu' : 'Menu'}</p>
          {navLinks.map((link) => (
             <Link
              key={link.href}
              href={getFullHref(link.href)}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={cn("text-lg px-4 transition-colors", pathname === link.href ? "text-blue-600 font-bold" : "text-black/70")}
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
                  <DropdownMenuItem 
                    key={option.code}
                    asChild
                    className={cn("cursor-pointer", option.code === lang && "bg-accent text-accent-foreground")}
                  >
                    <Link href={createLanguageSwitchHref(option.code)} onClick={() => setSheetOpen(false)}>
                      <FlagIcon countryCode={option.countryCode} className="mr-2" />
                      {option.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )
    }

    return (
       <NavigationMenu>
        <NavigationMenuList className="bg-transparent">
            <NavigationMenuItem>
                <NavigationMenuLink 
                    asChild
                    className={cn(
                        navigationMenuTriggerStyle(),
                        !isTransparentHeader ? "text-black" : "text-white hover:bg-white/10 hover:text-white",
                        pathname === homeLink.href && (isTransparentHeader ? "bg-white/10" : "bg-black/5")
                    )}
                >
                    <Link href={getFullHref(homeLink.href)} onClick={(e) => handleLinkClick(e, homeLink.href)}>
                        {homeLink.label}
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={cn(
                !isTransparentHeader ? "text-black" : "text-white hover:bg-white/10 hover:text-white bg-transparent",
                pathname.startsWith('/services') && (isTransparentHeader ? "bg-white/12" : "bg-black/5")
            )}>
                {lang === 'sq' ? 'Shërbimet' : 'Services'}
            </NavigationMenuTrigger>
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
                <NavigationMenuLink 
                    asChild
                    className={cn(
                        navigationMenuTriggerStyle(),
                        !isTransparentHeader ? "text-black" : "text-white hover:bg-white/10 hover:text-white",
                        pathname === link.href && (isTransparentHeader ? "bg-white/10" : "bg-black/5")
                    )}
                >
                    <Link href={getFullHref(link.href)} onClick={(e) => handleLinkClick(e, link.href)}>
                        {link.label}
                    </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        !isTransparentHeader ? "border-b border-black/5 bg-white/80 backdrop-blur-xl py-2" : "py-4"
      )} 
      id="main-header"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center">
            <Link href={getFullHref('/')} onClick={(e) => handleLinkClick(e, '/')} className="flex items-center relative group">
                <div className="flex items-center gap-3">
                        <Image 
                            src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2FGemini_Generated_Image_uuixsnuuixsnuuix-removebg-preview.png?alt=media&token=eae0c0c2-2554-4aa4-af2e-84ddc673dd21"
                            alt="BlueSquare Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain transition-all"
                            priority
                        />
                    <span className={cn(
                        "font-headline font-extrabold text-lg md:text-xl tracking-tighter transition-colors group-hover:text-blue-600",
                        isScrolled ? "text-zinc-900" : "text-white"
                    )}>
                        BlueSquare
                    </span>
                </div>
                <div 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"
                />
            </Link>
          </div>
          <nav className={cn(
              "hidden md:flex items-center space-x-1 transition-all"
          )}>
            {renderNavLinks()}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switch for Desktop */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 hover:bg-black/5 rounded-full transition-all">
                  <FlagIcon countryCode={currentLanguage?.countryCode || 'us'} />
                  <span className="text-[10px] font-bold tracking-widest text-zinc-500">{lang.toUpperCase()}</span>
                  <ChevronDown className="h-3 w-3 opacity-30" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-md border-black/5 p-1 rounded-2xl shadow-2xl">
                {languageOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.code}
                    asChild
                    className={cn("cursor-pointer focus:bg-black/5 rounded-xl px-3 py-2 transition-colors", option.code === lang && "bg-black/5 font-medium")}
                  >
                    <Link href={createLanguageSwitchHref(option.code)}>
                      <FlagIcon countryCode={option.countryCode} className="mr-3" />
                      <span className="text-sm">{option.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop CTA Button - Removed asChild to simplify and avoid potential multiple children issue in Slot */}
          <Button 
            size="sm" 
            className="hidden md:inline-flex bg-black text-white hover:bg-zinc-800 font-semibold px-8 h-11 rounded-full transition-all relative overflow-hidden group"
            onClick={() => router.push(getFullHref(currentCta.href))}
          >
            <span className="relative z-10">
              {currentCta.label}
            </span>
            <div className="absolute inset-0 bg-blue-600 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
          </Button>
          
          <div>
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                  "md:hidden rounded-full w-10 h-10",
                  isTransparentHeader ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5"
                )}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs bg-zinc-950/98 backdrop-blur-2xl p-0 border-l border-white/10 text-white">
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1">
                      <div className="flex flex-col space-y-8 pt-10 pb-12 px-4">
                          {/* Home Link */}
                          <Link
                            href={getFullHref(homeLink.href)}
                            onClick={(e) => handleLinkClick(e, homeLink.href)}
                            className={cn("text-lg px-4 transition-colors", pathname === homeLink.href ? "text-blue-400 font-bold" : "text-white/70 hover:text-white")}
                          >
                            {homeLink.label}
                          </Link>

                          {/* Services Group */}
                          <div className="space-y-4">
                              <p className="font-bold text-xs uppercase tracking-widest text-zinc-500 px-4">{lang === 'sq' ? 'Shërbimet' : 'Services'}</p>
                              <div className="flex flex-col space-y-2">
                                  {services.map((service) => (
                                    <Link 
                                        key={service.href} 
                                        href={getFullHref(service.href)} 
                                        className={cn("text-lg pl-8 transition-colors py-2 rounded-xl", pathname === service.href ? "text-blue-400 font-bold bg-blue-500/10" : "text-white/50 hover:text-white hover:bg-white/5")} 
                                        onClick={() => setSheetOpen(false)}
                                    >
                                      {service.title}
                                    </Link>
                                  ))}
                              </div>
                          </div>

                          {/* Menu Group */}
                          <div className="space-y-4 pb-8">
                              <p className="font-bold text-xs uppercase tracking-widest text-zinc-500 px-4">{lang === 'sq' ? 'Menu' : 'Menu'}</p>
                              <div className="flex flex-col space-y-2">
                                  {navLinks.map((link) => (
                                     <Link
                                      key={link.href}
                                      href={getFullHref(link.href)}
                                      onClick={(e) => handleLinkClick(e, link.href)}
                                      className={cn("text-lg px-4 transition-colors py-2 rounded-xl", pathname === link.href ? "text-blue-400 font-bold bg-blue-500/10" : "text-white/70 hover:text-white hover:bg-white/5")}
                                    >
                                      {link.label}
                                    </Link>
                                  ))}
                              </div>
                          </div>
                          
                          {/* Mobile CTA Button */}
                          <div className="px-4 pt-4">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 font-bold shadow-lg shadow-blue-600/20" onClick={() => { router.push(getFullHref(currentCta.href)); setSheetOpen(false); }}>
                                {currentCta.label}
                            </Button>
                          </div>
                      </div>
                  </ScrollArea>

                  {/* Mobile Language Switch at Bottom */}
                  <div className="p-8 border-t border-white/5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10">
                          <div className="flex items-center">
                            <FlagIcon countryCode={currentLanguage?.countryCode || 'us'} className="mr-3" />
                            <span className="font-medium">{currentLanguage?.label}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[calc(100vw-4rem)] max-w-xs bg-zinc-900 border-white/10 text-white rounded-2xl shadow-2xl backdrop-blur-xl">
                        {languageOptions.map((option) => (
                          <DropdownMenuItem 
                            key={option.code}
                            asChild
                            className={cn("cursor-pointer focus:bg-white/10 rounded-xl px-4 py-3 transition-colors", option.code === lang && "bg-white/10")}
                          >
                            <Link href={createLanguageSwitchHref(option.code)} onClick={() => setSheetOpen(false)}>
                              <FlagIcon countryCode={option.countryCode} className="mr-3" />
                              <span>{option.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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