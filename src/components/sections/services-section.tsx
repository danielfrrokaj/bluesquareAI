
'use client';

import { Card } from "@/components/ui/card";
import { Code, Plane, MessageCircle, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { useRef } from "react";
import Link from 'next/link';


const servicesSq = [
    {
        icon: <MessageCircle className="h-8 w-8" />,
        title: "AI për Inovacion",
        description: "Aplikacione Mobile si ShqipFol, Chatbote, Openclaw, N8N dhe Automatizime.",
        href: "/services/ai-innovation"
    },
    {
        icon: <Plane className="h-8 w-8" />,
        title: "Sisteme për Turizëm",
        description: "Discover Albania PMS, Booking Engine, Channel Manager dhe integrime AI.",
        href: "/services/tourism-systems"
    },
    {
        icon: <Zap className="h-8 w-8" />,
        title: "Zgjidhje të Shpejta",
        description: "Website të optimizuar për SEO me CMS. Shembuj: discoveralbania.al, tiranaescaperoom.com. Duke filluar nga 300€.",
        href: "/services/quick-solutions"
    },
];

const servicesEn = [
    {
        icon: <MessageCircle className="h-8 w-8" />,
        title: "AI for Innovation",
        description: "Mobile Apps like ShqipFol, Chatbots, Openclaw, N8N, and advanced Automations.",
        href: "/services/ai-innovation"
    },
    {
        icon: <Plane className="h-8 w-8" />,
        title: "Tourism Systems",
        description: "Discover Albania PMS, Booking Engine, Channel Manager, and AI Integrations.",
        href: "/services/tourism-systems"
    },
    {
        icon: <Zap className="h-8 w-8" />,
        title: "Quick Solutions",
        description: "SEO-optimized websites with CMS. Examples: discoveralbania.al, tiranaescaperoom.com. Starting from 300€.",
        href: "/services/quick-solutions"
    },
]

export function ServicesSection({ lang }: { lang: 'en' | 'sq' }) {
    const services = lang === 'sq' ? servicesSq : servicesEn;
    const content = {
        sq: {
            title: "Fuqia e Inovacionit",
            subtitle: "Ne ndërtojmë zgjidhje që shtyjnë kufijtë e teknologjisë në Shqipëri dhe më gjerë."
        },
        en: {
            title: "The Power of Innovation",
            subtitle: "We build solutions that push the boundaries of technology in Albania and beyond."
        }
    };
    const currentContent = content[lang];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.3 });

    return (
        <section id="services" className="py-32 bg-white relative overflow-hidden" ref={ref}>
            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.02] rounded-full blur-[150px] pointer-events-none" />

            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="flex flex-col items-center justify-center space-y-10 text-center mb-24 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-5 py-2 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {lang === 'sq' ? 'Shërbimet Tona' : 'Our Services'}
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter font-headline text-black leading-tight">
                        {currentContent.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium tracking-tight">
                       {currentContent.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {services.map((service, index) => (
                        <Link key={index} href={`${service.href}?lang=${lang}`} className="group h-full">
                            <Card className={cn("flex flex-col h-full transition-all duration-500 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-zinc-50/50 border border-black/[0.03] hover:border-blue-200 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)] items-start text-left relative overflow-hidden group-hover:-translate-y-2")}>
                                {/* Inner glow */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/0 group-hover:bg-blue-500/5 rounded-full blur-3xl transition-all duration-700" />
                                
                                <div className="mb-10 p-5 rounded-[1.25rem] bg-white shadow-sm border border-black/5 text-black group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-500 shadow-transparent group-hover:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.2)]">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold font-headline mb-4 text-black tracking-tight">{service.title}</h3>
                                <p className="text-zinc-500 font-medium leading-relaxed flex-1 mb-10 text-lg tracking-tight">{service.description}</p>
                                
                                <div className="mt-auto flex items-center text-[10px] font-bold text-black group-hover:text-blue-600 gap-3 group-hover:gap-5 transition-all duration-500 uppercase tracking-[0.2em]">
                                    <span>{lang === 'sq' ? 'Eksploro' : 'Explore'}</span>
                                    <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
