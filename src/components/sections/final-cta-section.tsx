'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { useRef } from 'react';

export function FinalCtaSection({ lang = 'en' }: { lang?: 'en' | 'sq' }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.3 });

    const content = {
        sq: {
            title: "Të ndërtojmë të ardhmen së bashku?",
            subtitle: "Zbuloni se si Blue Square AI po transformon rajonin e Ballkanit përmes inovacionit. Nisni projektin tuaj sot.",
            primaryCta: "Nisni Bashkëpunimin",
            secondaryCta: "Shiko Vizioni"
        },
        en: {
            title: "Building the future together?",
            subtitle: "Discover how Blue Square AI is transforming the Balkan region through innovation. Start your project today.",
            primaryCta: "Start Collaborating",
            secondaryCta: "View Vision"
        }
    };

    const currentContent = content[lang];

    const getFullHref = (href: string) => {
        return `${href}?lang=${lang}`;
    };

    return (
        <section className="py-40 bg-white" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="relative rounded-[4rem] bg-gradient-to-br from-zinc-950 via-black to-zinc-900 px-8 py-24 md:px-24 md:py-36 text-center text-white shadow-[0_80px_160px_-20px_rgba(0,0,0,0.6)] overflow-hidden group border border-white/10">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/[0.1] rounded-full -translate-x-1/4 -translate-y-1/4 blur-[140px] group-hover:bg-blue-500/[0.15] transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-lime-400/[0.08] rounded-full translate-x-1/4 translate-y-1/4 blur-[140px] group-hover:bg-lime-400/[0.12] transition-all duration-1000" />
                    
                    <div className="relative z-10 max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-5 py-2 mb-12 text-[10px] font-bold tracking-[0.4em] text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20 backdrop-blur-sm">
                            <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
                            {lang === 'sq' ? 'Bashkohu me Ne' : 'Ready to Start?'}
                        </div>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter font-headline mb-12 leading-[1.05]">
                            {currentContent.title}
                        </h2>
                        <p className="mb-20 text-xl md:text-3xl text-zinc-400 leading-relaxed font-medium tracking-tight max-w-3xl mx-auto">
                            {currentContent.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                            <Link href={getFullHref('/contact')} className="w-full sm:w-auto">
                                <Button size="lg" className="h-24 w-full sm:w-auto bg-white text-black hover:bg-zinc-100 font-bold px-16 text-2xl rounded-full group transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)]">
                                    {currentContent.primaryCta}
                                    <ArrowRight className="ml-3 h-7 w-7 transition-transform group-hover:translate-x-2" />
                                </Button>
                            </Link>
                            <Link href={getFullHref('/vision')} className="w-full sm:w-auto group">
                                <Button size="lg" className="h-24 w-full sm:w-auto bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] font-bold px-16 text-2xl rounded-full transition-all duration-500 active:scale-95 backdrop-blur-xl relative overflow-hidden">
                                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    {currentContent.secondaryCta}
                                    <PlayCircle className="ml-3 h-7 w-7 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-blue-400" />
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-1 bg-blue-500 rounded-full" />
                                {lang === 'sq' ? 'Bashkëpunim i Shpejtë' : 'Fast Setup'}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-1 bg-lime-400 rounded-full" />
                                {lang === 'sq' ? 'Cilësi Premium' : 'Premium Quality'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
