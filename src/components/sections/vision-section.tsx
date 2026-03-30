
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
        <section id="vision" className="py-32 bg-zinc-950 relative overflow-hidden" ref={ref}>
            {/* Dark Modern Gradient Accents */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[160px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-lime-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-[140px] pointer-events-none" />

            <div className={cn("container px-4 md:px-6 transition-all duration-1000 relative z-10", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="grid md:grid-cols-2 gap-24 items-center">
                    <div className="text-left relative z-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 text-[10px] font-extrabold tracking-[0.3em] text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            {lang === 'sq' ? 'Misioni & Vizioni' : 'Mission & Vision'}
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter font-headline mb-10 text-white leading-[0.95]">
                           {currentContent.title}
                        </h2>
                        <p className="max-w-[650px] text-xl md:text-3xl text-zinc-400 leading-relaxed mb-12 font-medium tracking-tight">
                            {currentContent.text}
                        </p>
                        <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/10">
                            <div className="group/stat">
                                <h4 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter transition-all group-hover/stat:text-blue-500 group-hover/stat:scale-105 inline-block">100%</h4>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">{lang === 'sq' ? 'Dixhitalizim' : 'Digitalization'}</p>
                            </div>
                            <div className="group/stat">
                                <h4 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter transition-all group-hover/stat:text-lime-400 group-hover/stat:scale-105 inline-block">24/7</h4>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">{lang === 'sq' ? 'Mbështetje AI' : 'AI Support'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[450px] md:h-[650px] w-full rounded-[4rem] overflow-hidden bg-black/40 border border-white/10 backdrop-blur-3xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] group transition-all duration-700 hover:border-white/20">
                        <Image
                            src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/3d-rendering-holographic-liquid-shape-for-decoration-or-mixed-media-transparent-background-free-png.webp"
                            alt="Abstract 3D planet"
                            fill
                            className="object-contain p-16 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-3 brightness-125"
                            data-ai-hint="holographic liquid"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.05] to-lime-500/[0.05] pointer-events-none" />
                        
                        {/* Interactive floating elements */}
                        <div className="absolute top-12 right-12 p-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl animate-bounce" style={{ animationDuration: '5s' }}>
                            <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
                        </div>
                        <div className="absolute bottom-12 left-12 p-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl animate-bounce" style={{ animationDuration: '7s', animationDelay: '1.5s' }}>
                            <div className="h-3 w-3 rounded-full bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.8)]" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
