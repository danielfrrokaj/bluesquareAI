'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from '@/hooks/use-in-view';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const productsSq = [
    {
        title: 'AI Assistant Web Chat',
        description: 'Chat inteligjent që përgjigjet dhe mbledh të dhëna të klientëve.',
        imageUrl: "/images/aiAssistantWebChat.png",
        imageHint: "chat interface"
    },
    {
        title: 'Smart Cam Monitor',
        description: 'Aplikacion që njeh fytyra ose llogarit fluksin e njerëzve në lokale apo zyra.',
        imageUrl: "/images/smartcammonitor.png",
        imageHint: "security camera"
    },
    {
        title: 'AutoBooking AI',
        description: 'Sistemi i rezervimeve me kontroll kundër overbooking-ut dhe faturim automatik.',
        imageUrl: "/images/autobookai.png",
        imageHint: "booking calendar"
    },
    {
        title: 'BlueDesk',
        description: 'Platformë menaxhimi për shitje, pagesa, staf dhe njoftime në një ekran të vetëm.',
        imageUrl: "/images/bluedesk.png",
        imageHint: "pos system"
    },
    {
        title: 'WhatsAI Connect',
        description: 'Integrim i WhatsApp API me inteligjencë që menaxhon automatikisht komunikimin.',
        imageUrl: "/images/aiAssistantWebChat.png", // Changed to existing image
        imageHint: "whatsapp api"
    },
];

const productsEn = [
    {
        title: 'AI Assistant Web Chat',
        description: 'An intelligent chat that responds and collects customer data.',
        imageUrl: "/images/aiAssistantWebChat.png",
        imageHint: "chat interface"
    },
    {
        title: 'Smart Cam Monitor',
        description: 'An application that recognizes faces or calculates people flow in stores or offices.',
        imageUrl: "/images/smartcammonitor.png",
        imageHint: "security camera"
    },
    {
        title: 'AutoBooking AI',
        description: 'A reservation system with overbooking control and automatic invoicing.',
        imageUrl: "/images/autobookai.png",
        imageHint: "booking calendar"
    },
    {
        title: 'BlueDesk',
        description: 'A management platform for sales, payments, staff, and notifications on a single screen.',
        imageUrl: "/images/bluedesk.png",
        imageHint: "pos system"
    },
    {
        title: 'WhatsAI Connect',
        description: 'WhatsApp API integration with intelligence that automatically manages communication.',
        imageUrl: "/images/aiAssistantWebChat.png", // Changed to existing image
        imageHint: "whatsapp api"
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
                    {products.map((product, index) => (
                        <Card key={index} className="overflow-hidden transition-shadow hover:shadow-xl w-full md:w-[45%] lg:w-[30%]">
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
                    ))}
                </div>
            </div>
        </section>
    );
}