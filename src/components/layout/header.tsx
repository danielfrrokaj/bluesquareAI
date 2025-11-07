'use client';

import Link from 'next/link';
import { Menu, ChevronDown, Code, Camera, MessageCircle, ShoppingCart, Plane } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import React from 'react';


const navLinksSq = [
  { href: '/#home', label: 'Kryefaqja' },
  { href: '/#products', label: 'Produktet' },
  { href: '/pricing', label: 'Çmimet'},
  { href: '/#vision', label: 'Vizioni' },
  { href: '/#contact', label: 'Kontakti' },
];

const navLinksEn = [
  { href: '/#home', label: 'Home' },
  { href: '/#products', label: 'Products' },
  { href: '/pricing', label: 'Pricing'},
  { href: '/#vision', label: 'Vision' },
  { href: '/#contact', label: 'Contact' },
];

const servicesEn = [
    {
        title: "AI Website Integration",
        href: "/services/ai-website-integration",
        description: "Intelligent chatbot, traffic analysis, and AI-powered SEO content generation.",
        icon: <Code className="h-5 w-5" />
    },
    {
        title: "Management & Monitoring Systems",
        href: "/services/management-systems",
        description: "Mini-PMS for accommodation, smart dashboards, and security camera integration.",
        icon: <Camera className="h-5 w-5" />
    },
    {
        title: "Communication Automation",
        href: "/services/communication-automation",
        description: "WhatsApp Business API and AI integration for automated social media responses.",
        icon: <MessageCircle className="h-5 w-5" />
    },
    {
        title: "Solutions for Local Businesses",
        href: "/services/local-business-solutions",
        description: "Systems for ordering, payments, online reservations, and loyalty programs.",
        icon: <ShoppingCart className="h-5 w-5" />
    },
    {
        title: "AI for Tourism & Services",
        href: "/services/tourism-ai",
        description: "Chatbot for hotels/agencies, reservation synchronization, and review analysis.",
        icon: <Plane className="h-5 w-5" />
    },
];

const servicesSq = [
    {
        title: "Integrim i AI në Website",
        href: "/services/ai-website-integration",
        description: "Chatbot inteligjent, analizë trafiku, dhe gjenerim përmbajtje SEO me AI.",
        icon: <Code className="h-5 w-5" />
    },
    {
        title: "Sisteme Menaxhimi & Monitorimi",
        href: "/services/management-systems",
        description: "Mini-PMS për akomodim, dashboard inteligjent dhe integrim me kamera sigurie.",
        icon: <Camera className="h-5 w-5" />
    },
    {
        title: "Automatizim Komunikimi",
        href: "/services/communication-automation",
        description: "Integrim WhatsApp Business API dhe AI për përgjigje automatike në rrjete sociale.",
        icon: <MessageCircle className="h-5 w-5" />
    },
    {
        title: "Zgjidhje për Biznese Lokale",
        href: "/services/local-business-solutions",
        description: "Sisteme për porosi, pagesa, rezervime online dhe programe besnikërie.",
        icon: <ShoppingCart className="h-5 w-5" />
    },
    {
        title: "AI për Turizëm & Shërbime",
        href: "/services/tourism-ai",
        description: "Chatbot për hotele/agjenci, sinkronizim rezervimesh dhe analizë komentesh.",
        icon: <Plane className="h-5 w-5" />
    },
];

export function Header({ lang }: { lang: 'en' | 'sq' }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navLinks = lang === 'sq' ? navLinksSq : navLinksEn;
  const services = lang === 'sq' ? servicesSq : servicesEn;
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
    const mobileLinks = [
      { href: '/#home', label: lang === 'sq' ? 'Kryefaqja' : 'Home' },
      ...services.map(s => ({ href: `${s.href}?lang=${lang}`, label: s.title})),
      ...navLinks.slice(1)
    ];

    if (isMobile) {
      return (
        <div className="flex flex-col space-y-4">
          <p className="font-bold text-lg px-4">{lang === 'sq' ? 'Shërbimet' : 'Services'}</p>
          {services.map((service) => (
            <Link key={service.href} href={`${service.href}?lang=${lang}`} className="text-muted-foreground hover:text-primary pl-8" onClick={() => setSheetOpen(false)}>
              {service.title}
            </Link>
          ))}
          <p className="font-bold text-lg px-4 pt-4">{lang === 'sq' ? 'Menu' : 'Menu'}</p>
          {navLinks.map((link) => (
             <Link
              key={link.href}
              href={`${link.href.startsWith('/#') ? '' : link.href}?lang=${lang}${link.href.startsWith('/#') ? link.href.substring(1) : ''}`}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-lg px-4"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )
    }

    return (
       <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{lang === 'sq' ? 'Shërbimet' : 'Services'}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {services.map((service) => (
                  <ListItem
                    key={service.title}
                    title={service.title}
                    href={`${service.href}?lang=${lang}`}
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
               <Link href={`${link.href.startsWith('/#') ? '' : link.href}?lang=${lang}${link.href.startsWith('/#') ? link.href.substring(1) : ''}`} legacyBehavior passHref>
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
      isScrolled ? "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-transparent"
    )}>
      <div className="container flex h-20 items-center">
        <Link href={`/?lang=${lang}#home`} onClick={(e) => handleLinkClick(e, '/#home')} className="mr-6 flex items-center space-x-2 font-bold text-2xl font-headline">
           Blue Square AI
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
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
                <Link href="/" className="flex items-center space-x-2 mb-4 font-bold text-2xl font-headline" onClick={() => setSheetOpen(false)}>
                  Blue Square AI
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
            "group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-white">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
