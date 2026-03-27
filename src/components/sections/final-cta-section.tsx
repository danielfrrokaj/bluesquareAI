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
            title: "Gati për të fuqizuar biznesin tuaj?",
            subtitle: "Zbuloni se si inteligjenca artificiale mund të transformojë mënyrën se si punoni. Filloni sot me një konsultë falas.",
            primaryCta: "Na kontaktoni tani",
            secondaryCta: "Shiko demo"
        },
        en: {
            title: "Ready to empower your business?",
            subtitle: "Discover how artificial intelligence can transform the way you work. Start today with a free consultation.",
            primaryCta: "Contact us now",
            secondaryCta: "View demo"
        }
    };

    const currentContent = content[lang];

    const getFullHref = (href: string) => {
        return `${href}?lang=${lang}`;
    };

    return (
        <section className="py-24 bg-white" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="relative rounded-3xl bg-black px-8 py-16 md:px-16 md:py-24 text-center text-white shadow-2xl overflow-hidden group">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-1000" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-1000" />
                    
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-headline mb-8 leading-tight">
                            {currentContent.title}
                        </h2>
                        <p className="mb-12 text-lg md:text-xl text-white/70 leading-relaxed font-medium">
                            {currentContent.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href={getFullHref('/contact')} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-bold px-10 py-7 text-lg rounded-full group-button">
                                    {currentContent.primaryCta}
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href={getFullHref('/services')} className="w-full sm:w-auto">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-bold px-10 py-7 text-lg rounded-full">
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    {currentContent.secondaryCta}
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-8 text-sm text-white/40 font-medium">
                            {lang === 'sq' ? 'S’ka nevojë për kartë krediti. Konfigurim i shpejtë.' : 'No credit card required. Fast setup.'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
