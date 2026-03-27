
'use client';

import { useInView } from "@/hooks/use-in-view";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function VisionSection({ lang }: { lang: 'en' | 'sq' }) {
    const content = {
        sq: {
            title: "Vizioni Ynë",
            text: "Blue Square AI do të bëhet partneri kryesor për çdo biznes që kërkon të dixhitalizohet, pa pasur nevojë për programues apo zhvillues. Me teknologjinë moderne të AI dhe automatizimit, ne ofrojmë zgjidhje të shpejta, efikase dhe të personalizuara që rritin produktivitetin dhe uljen e kostove."
        },
        en: {
            title: "Our Vision",
            text: "Blue Square AI will become the leading partner for any business looking to digitize, without the need for programmers or developers. With modern AI and automation technology, we offer fast, efficient, and personalized solutions that increase productivity and reduce costs."
        }
    };
    const currentContent = content[lang];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.3 });


    return (
        <section id="vision" className="py-24 bg-[#FAFAFA]" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="text-left">
                        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-black uppercase bg-black/5 rounded-full">
                            {lang === 'sq' ? 'Misioni & Vizioni' : 'Mission & Vision'}
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-headline mb-8 text-black leading-tight">
                           {currentContent.title}
                        </h2>
                        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed mb-8">
                            {currentContent.text}
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black/5">
                            <div>
                                <h4 className="text-3xl font-bold text-black mb-1">100%</h4>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{lang === 'sq' ? 'Dixhitalizim' : 'Digitalization'}</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-black mb-1">24/7</h4>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{lang === 'sq' ? 'Mbështetje AI' : 'AI Support'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-white border border-black/5 shadow-2xl shadow-black/5 group">
                        <Image
                            src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/3d-rendering-holographic-liquid-shape-for-decoration-or-mixed-media-transparent-background-free-png.webp"
                            alt="Abstract 3D planet"
                            fill
                            className="object-contain p-12 transition-transform duration-1000 group-hover:scale-110"
                            data-ai-hint="holographic liquid"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
}
