
'use client';

import { useInView } from "@/hooks/use-in-view";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function VisionSection({ lang }: { lang: 'en' | 'sq' }) {
    const content = {
        sq: {
            title: "Vizioni Ynë",
            text: "Blue Square AI është krijuar për të qenë epiqendra e inovacionit teknologjik në Tiranë. Ne besojmë se Shqipëria dhe Ballkani kanë potencialin për të udhëhequr në fushën e Inteligjencës Artificiale. Misioni ynë është të ndërtojmë zgjidhje që transformojnë shoqërinë dhe ekonominë tonë."
        },
        en: {
            title: "Our Vision",
            text: "Blue Square AI is built to be the epicenter of technological innovation in Tirana. We believe that Albania and the Balkans have the potential to lead in the field of Artificial Intelligence. Our mission is to build solutions that transform our society and economy."
        }
    };
    const currentContent = content[lang];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.3 });


    return (
        <section id="vision" className="py-32 bg-white relative overflow-hidden" ref={ref}>
            {/* Background Glows */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-lime-400/5 rounded-full blur-[120px] pointer-events-none" />

            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="grid md:grid-cols-2 gap-24 items-center">
                    <div className="text-left relative z-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {lang === 'sq' ? 'Misioni & Vizioni' : 'Mission & Vision'}
                        </div>
                        <h2 className="text-4xl md:text-7xl font-extrabold tracking-tighter font-headline mb-10 text-black leading-[1.05]">
                           {currentContent.title}
                        </h2>
                        <p className="max-w-[650px] text-lg md:text-2xl text-zinc-500 leading-relaxed mb-12 font-medium tracking-tight">
                            {currentContent.text}
                        </p>
                        <div className="grid grid-cols-2 gap-12 pt-12 border-t border-black/5">
                            <div className="group/stat">
                                <h4 className="text-4xl md:text-5xl font-bold text-black mb-3 tracking-tighter transition-colors group-hover/stat:text-blue-600">100%</h4>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">{lang === 'sq' ? 'Dixhitalizim' : 'Digitalization'}</p>
                            </div>
                            <div className="group/stat">
                                <h4 className="text-4xl md:text-5xl font-bold text-black mb-3 tracking-tighter transition-colors group-hover/stat:text-lime-500">24/7</h4>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">{lang === 'sq' ? 'Mbështetje AI' : 'AI Support'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[400px] md:h-[550px] w-full rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-zinc-50 border border-black/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] group">
                        <Image
                            src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/3d-rendering-holographic-liquid-shape-for-decoration-or-mixed-media-transparent-background-free-png.webp"
                            alt="Abstract 3D planet"
                            fill
                            className="object-contain p-16 transition-all duration-1000 group-hover:scale-105 group-hover:rotate-2"
                            data-ai-hint="holographic liquid"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.03] to-lime-500/[0.03] pointer-events-none" />
                        
                        {/* Interactive floaters */}
                        <div className="absolute top-10 right-10 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl animate-bounce" style={{ animationDuration: '4s' }}>
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="absolute bottom-10 left-10 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>
                            <div className="h-2 w-2 rounded-full bg-lime-400" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
