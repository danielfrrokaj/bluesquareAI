
'use client';

import NextImage from 'next/image';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { useRef } from "react";

export function ProjectShowcaseSection({ lang }: { lang: 'en' | 'sq' }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.1 });

    const content = {
        sq: {
            tag: "Projektet tona",
            title: "Inovacioni në Praksë",
            subtitle: "Një vështrim në disa nga zgjidhjet tona më të fundit që po transformojnë industrinë."
        },
        en: {
            tag: "Our Projects",
            title: "Innovation in Action",
            subtitle: "A look at some of our latest solutions that are transforming the industry."
        }
    };

    const c = content[lang];

    return (
        <section className="py-32 bg-zinc-50/30 overflow-hidden" ref={ref}>
            <div className={cn("container px-4 mx-auto transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="flex flex-col items-center mb-24 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-5 py-2 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 backdrop-blur-sm mb-8">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {c.tag}
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter font-headline text-black leading-tight mb-8">
                        {c.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium tracking-tight">
                        {c.subtitle}
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-lime-500 rounded-full mt-12" />
                </div>
                
                <div className="grid grid-cols-1 gap-16 lg:gap-24 max-w-7xl mx-auto">
                    <Card className="overflow-hidden border-black/5 shadow-2xl rounded-[2rem] md:rounded-[3rem] group transition-all duration-700 hover:shadow-[0_60px_100px_-20px_rgba(59,130,246,0.15)] bg-white">
                        <div className="w-full overflow-hidden">
                            <NextImage 
                                src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FUntitled%20design%20(1).png?alt=media&token=79776295-c0cf-4ff5-b12e-015d85915a3c"
                                alt="AI Projects Showcase"
                                width={1600}
                                height={900}
                                className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                                priority
                                sizes="100vw"
                            />
                        </div>
                    </Card>
                    <Card className="overflow-hidden border-black/5 shadow-2xl rounded-[2rem] md:rounded-[3rem] group transition-all duration-700 hover:shadow-[0_60px_100px_-20px_rgba(59,130,246,0.15)] bg-white">
                        <div className="w-full overflow-hidden">
                            <NextImage 
                                src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FMenaxhim%20i%20lehte%CC%88%20i%20hotelit%20tuaj.png?alt=media&token=920dc86d-30bf-4bab-b595-a94735755f86"
                                alt="Hotel Management Solution"
                                width={1600}
                                height={900}
                                className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                                sizes="100vw"
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
