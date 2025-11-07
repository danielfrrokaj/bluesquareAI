
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, LineChart, Code, Camera, MessageCircle, ShoppingCart, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { useRef } from "react";

const servicesSq = [
    {
        icon: <Code className="h-8 w-8 text-primary" />,
        title: "Integrim i AI në Website",
        description: "Chatbot inteligjent, analizë trafiku, dhe gjenerim përmbajtje SEO me AI.",
    },
    {
        icon: <Camera className="h-8 w-8 text-primary" />,
        title: "Sisteme Menaxhimi & Monitorimi",
        description: "Mini-PMS për akomodim, dashboard inteligjent dhe integrim me kamera sigurie.",
    },
    {
        icon: <MessageCircle className="h-8 w-8 text-primary" />,
        title: "Automatizim Komunikimi",
        description: "Integrim WhatsApp Business API dhe AI për përgjigje automatike në rrjete sociale.",
    },
    {
        icon: <ShoppingCart className="h-8 w-8 text-primary" />,
        title: "Zgjidhje për Biznese Lokale",
        description: "Sisteme për porosi, pagesa, rezervime online dhe programe besnikërie.",
    },
    {
        icon: <Plane className="h-8 w-8 text-primary" />,
        title: "AI për Turizëm & Shërbime",
        description: "Chatbot për hotele/agjenci, sinkronizim rezervimesh dhe analizë komentesh.",
    },
];

const servicesEn = [
      {
        icon: <Code className="h-8 w-8 text-primary" />,
        title: "AI Website Integration",
        description: "Intelligent chatbot, traffic analysis, and AI-powered SEO content generation.",
    },
    {
        icon: <Camera className="h-8 w-8 text-primary" />,
        title: "Management & Monitoring Systems",
        description: "Mini-PMS for accommodation, smart dashboards, and security camera integration.",
    },
    {
        icon: <MessageCircle className="h-8 w-8 text-primary" />,
        title: "Communication Automation",
        description: "WhatsApp Business API and AI integration for automated social media responses.",
    },
    {
        icon: <ShoppingCart className="h-8 w-8 text-primary" />,
        title: "Solutions for Local Businesses",
        description: "Systems for ordering, payments, online reservations, and loyalty programs.",
    },
    {
        icon: <Plane className="h-8 w-8 text-primary" />,
        title: "AI for Tourism & Services",
        description: "Chatbot for hotels/agencies, reservation synchronization, and review analysis.",
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
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <section id="services" className="bg-card" ref={ref}>
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
                    {services.map((service, index) => (
                        <Card key={index} className={cn("flex flex-col transition-all duration-300 p-6 items-center text-center bg-background border-2 border-transparent hover:border-primary w-full md:w-[45%] lg:w-[30%]")}>
                            <div className="mb-4">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold font-headline mb-2">{service.title}</h3>
                            <p className="text-muted-foreground flex-1">{service.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
