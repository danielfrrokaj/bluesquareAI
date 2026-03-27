'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from '@/hooks/use-in-view';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const productsSq = [
    {
        title: 'AI Assistant Web Chat',
        description: 'Chat inteligjent që përgjigjet dhe mbledh të dhëna të klientëve.',
        imageUrl: "/images/aiAssistantWebChat.png",
        imageHint: "chat interface",
        href: "/services/ai-website-integration"
    },
    {
        title: 'MenuMaster AI',
        description: 'Produkt SaaS me integrim AI për menaxhim dhe optimizim të menusë.',
        imageUrl: "/images/menumaster.png",
        imageHint: "menu management interface",
        href: "/products/menumaster-ai"
    },
    {
        title: 'Discover Albania Ops Central',
        description: 'Automatizime n8n për hyrje të të dhënave, mesazhe WhatsApp dhe menaxhim operativ.',
        imageUrl: "/images/discoveralbania.png",
        imageHint: "operations dashboard",
        href: "/products/discover-albania-ops-central"
    },
    {
        title: 'NordFix CRM',
        description: 'Sistem CRM me integrim Outlook dhe AI për menaxhimin e marrëdhënieve me klientët.',
        imageUrl: "/images/crm.png",
        imageHint: "crm dashboard",
        href: null
    },
    {
        title: 'Smart Cam Monitor',
        description: 'Aplikacion që njeh fytyra ose llogarit fluksin e njerëzve në lokale apo zyra.',
        imageUrl: "/images/smartcammonitor.png",
        imageHint: "security camera",
        href: "/services/management-systems"
    },
    {
        title: 'AutoBooking AI',
        description: 'Sistemi i rezervimeve me kontroll kundër overbooking-ut dhe faturim automatik.',
        imageUrl: "/images/autobookai.png",
        imageHint: "booking calendar",
        href: "/services/tourism-ai"
    },
    {
        title: 'BlueDesk',
        description: 'Platformë menaxhimi për shitje, pagesa, staf dhe njoftime në një ekran të vetëm.',
        imageUrl: "/images/bluedesk.png",
        imageHint: "pos system",
        href: "/services/local-business-solutions"
    },
    {
        title: 'WhatsAI Connect',
        description: 'Integrim i WhatsApp API me inteligjencë që menaxhon automatikisht komunikimin.',
        imageUrl: "/images/aiAssistantWebChat.png", // Changed to existing image
        imageHint: "whatsapp api",
        href: "/services/communication-automation"
    },
    {
        title: 'Tirana Escape Room Website',
        description: 'Një faqe interneti e bukur dhe funksionale për rezervime dhe prezantim të dhomave.',
        imageUrl: "https://i.postimg.cc/597FvF4H/image.png",
        imageHint: "escape room website interface",
        href: "/products/tirana-escape-room"
    },
];

const productsEn = [
    {
        title: 'AI Assistant Web Chat',
        description: 'An intelligent chat that responds and collects customer data.',
        imageUrl: "/images/aiAssistantWebChat.png",
        imageHint: "chat interface",
        href: "/services/ai-website-integration"
    },
    {
        title: 'MenuMaster AI',
        description: 'SaaS product with AI integration for menu management and optimization.',
        imageUrl: "/images/menumaster.png",
        imageHint: "menu management interface",
        href: "/products/menumaster-ai"
    },
    {
        title: 'Discover Albania Ops Central',
        description: 'n8n automations for data entry, WhatsApp messages, and operational management.',
        imageUrl: "/images/discoveralbania.png",
        imageHint: "operations dashboard",
        href: "/products/discover-albania-ops-central"
    },
    {
        title: 'NordFix CRM',
        description: 'CRM system with Outlook and AI integration for customer relationship management.',
        imageUrl: "/images/crm.png",
        imageHint: "crm dashboard",
        href: null
    },
    {
        title: 'Smart Cam Monitor',
        description: 'An application that recognizes faces or calculates people flow in stores or offices.',
        imageUrl: "/images/smartcammonitor.png",
        imageHint: "security camera",
        href: "/services/management-systems"
    },
    {
        title: 'AutoBooking AI',
        description: 'A reservation system with overbooking control and automatic invoicing.',
        imageUrl: "/images/autobookai.png",
        imageHint: "booking calendar",
        href: "/services/tourism-ai"
    },
    {
        title: 'BlueDesk',
        description: 'A management platform for sales, payments, staff, and notifications on a single screen.',
        imageUrl: "/images/bluedesk.png",
        imageHint: "pos system",
        href: "/services/local-business-solutions"
    },
    {
        title: 'WhatsAI Connect',
        description: 'WhatsApp API integration with intelligence that automatically manages communication.',
        imageUrl: "/images/aiAssistantWebChat.png", // Changed to existing image
        imageHint: "whatsapp api",
        href: "/services/communication-automation"
    },
    {
        title: 'Tirana Escape Room Website',
        description: 'A beautiful and functional website for booking and room presentation.',
        imageUrl: "https://i.postimg.cc/597FvF4H/image.png",
        imageHint: "escape room website interface",
        href: "/products/tirana-escape-room"
    },
];

export function ProductsSection({ lang }: { lang: 'en' | 'sq' }) {
    const products = lang === 'sq' ? productsSq : productsEn;
    const content = {
        sq: {
            title: "Shembuj produktesh të Blue Square AI",
            subtitle: "Këto janë disa nga shembujt e produkteve inovative që kemi ndërtuar për të fuqizuar bizneset."
        },
        en: {
            title: "Blue Square AI Product Examples",
            subtitle: "These are some examples of the innovative products we have built to empower businesses."
        }
    };
    const currentContent = content[lang];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.3 });
    
    const getFullHref = (href: string) => {
        return `${href}?lang=${lang}`;
    };

    return (
        <section id="products" className="py-24 bg-[#FAFAFA]" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <div className="space-y-3 max-w-3xl">
                        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-headline text-black">
                            {currentContent.title}
                        </h2>
                        <p className="text-lg text-muted-foreground md:text-xl leading-relaxed">
                            {currentContent.subtitle}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, index) => {
                        const CardWrapper = product.href ? Link : 'div';
                        const wrapperProps = product.href ? { href: getFullHref(product.href) } : {};
                        
                        return (
                            <CardWrapper 
                                key={index} 
                                {...(wrapperProps as any)}
                                className={cn(
                                    "group block h-full no-underline",
                                    product.href && "cursor-pointer"
                                )}
                            >
                                <Card className="h-full border border-black/5 bg-white overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
                                    <div className="relative aspect-video w-full overflow-hidden">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            data-ai-hint={product.imageHint}
                                        />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-bold font-headline mb-3 text-black group-hover:text-black transition-colors">{product.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-2">{product.description}</p>
                                        
                                        {product.href && (
                                            <div className="flex items-center text-sm font-semibold text-black gap-2 mt-4">
                                                <span>{lang === 'sq' ? 'Shiko detajet' : 'View details'}</span>
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </CardWrapper>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}