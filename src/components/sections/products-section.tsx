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
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    
    const getFullHref = (href: string) => {
        return `${href}?lang=${lang}`;
    };

    return (
        <section id="products" className="bg-background" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                            {currentContent.title}
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            {currentContent.subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {products.map((product, index) => {
                        const CardWrapper = product.href ? Link : 'div';
                        const wrapperProps = product.href ? { href: getFullHref(product.href) } : {};
                        
                        return (
                            <CardWrapper 
                                key={index} 
                                {...wrapperProps} 
                                className={cn(
                                    "overflow-hidden w-full md:w-[45%] lg:w-[30%]",
                                    product.href && "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                )}
                            >
                                <Card className="h-full">
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={product.imageHint}
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="font-headline">{product.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{product.description}</p>
                                    </CardContent>
                                </Card>
                            </CardWrapper>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}