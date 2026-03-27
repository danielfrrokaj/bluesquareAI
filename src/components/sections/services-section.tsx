
'use client';

import { Card } from "@/components/ui/card";
import { Code, Camera, MessageCircle, ShoppingCart, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { useRef } from "react";
import Link from 'next/link';


const servicesSq = [
    {
        icon: <Code className="h-8 w-8 text-primary" />,
        title: "Integrim i AI në Website",
        description: "Chatbot inteligjent, analizë trafiku, dhe gjenerim përmbajtje SEO me AI.",
        href: "/services/ai-website-integration"
    },
    {
        icon: <Camera className="h-8 w-8 text-primary" />,
        title: "Sisteme Menaxhimi & Monitorimi",
        description: "Mini-PMS për akomodim, dashboard inteligjent dhe integrim me kamera sigurie.",
        href: "/services/management-systems"
    },
    {
        icon: <MessageCircle className="h-8 w-8 text-primary" />,
        title: "Automatizim Komunikimi",
        description: "Integrim WhatsApp Business API dhe AI për përgjigje automatike në rrjete sociale.",
        href: "/services/communication-automation"
    },
    {
        icon: <ShoppingCart className="h-8 w-8 text-primary" />,
        title: "Zgjidhje për Biznese Lokale",
        description: "Sisteme për porosi, pagesa, rezervime online dhe programe besnikërie.",
        href: "/services/local-business-solutions"
    },
    {
        icon: <Plane className="h-8 w-8 text-primary" />,
        title: "AI për Turizëm & Shërbime",
        description: "Chatbot për hotele/agjenci, sinkronizim rezervimesh dhe analizë komentesh.",
        href: "/services/tourism-ai"
    },
];

const servicesEn = [
      {
        icon: <Code className="h-8 w-8 text-primary" />,
        title: "AI Website Integration",
        description: "Intelligent chatbot, traffic analysis, and AI-powered SEO content generation.",
        href: "/services/ai-website-integration"
    },
    {
        icon: <Camera className="h-8 w-8 text-primary" />,
        title: "Management & Monitoring Systems",
        description: "Mini-PMS for accommodation, smart dashboards, and security camera integration.",
        href: "/services/management-systems"
    },
    {
        icon: <MessageCircle className="h-8 w-8 text-primary" />,
        title: "Communication Automation",
        description: "WhatsApp Business API and AI integration for automated social media responses.",
        href: "/services/communication-automation"
    },
    {
        icon: <ShoppingCart className="h-8 w-8 text-primary" />,
        title: "Solutions for Local Businesses",
        description: "Systems for ordering, payments, online reservations, and loyalty programs.",
        href: "/services/local-business-solutions"
    },
    {
        icon: <Plane className="h-8 w-8 text-primary" />,
        title: "AI for Tourism & Services",
        description: "Chatbot for hotels/agencies, reservation synchronization, and review analysis.",
        href: "/services/tourism-ai"
    },
]

export function ServicesSection({ lang }: { lang: 'en' | 'sq' }) {
    const services = lang === 'sq' ? servicesSq : servicesEn;
    const content = {
        sq: {
            title: "Çfarë Ofrojmë",
            subtitle: "Zgjidhjet tona të fuqizuara nga AI janë krijuar për të transformuar biznesin tuaj, duke rritur efikasitetin dhe duke ulur kostot."
        },
        en: {
            title: "What We Offer",
            subtitle: "Our AI-powered solutions are designed to transform your business, increasing efficiency and reducing costs."
        }
    };
    const currentContent = content[lang];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.3 });

    return (
        <section id="services" className="py-24 bg-white" ref={ref}>
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
                    {services.map((service, index) => (
                        <Link key={index} href={`${service.href}?lang=${lang}`} className="group no-underline h-full">
                            <Card className={cn("flex flex-col h-full transition-all duration-500 p-8 rounded-2xl bg-white border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 items-start text-left relative overflow-hidden group-hover:-translate-y-1")}>
                                <div className="mb-6 p-4 rounded-xl bg-black/5 text-black group-hover:bg-black group-hover:text-white transition-all duration-500 ease-in-out">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold font-headline mb-3 text-black">{service.title}</h3>
                                <p className="text-muted-foreground leading-relaxed flex-1 mb-8">{service.description}</p>
                                
                                <div className="mt-auto flex items-center text-sm font-semibold text-black gap-2 group-hover:translate-x-1 transition-transform">
                                    <span>{lang === 'sq' ? 'Mëso më shumë' : 'Learn more'}</span>
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
