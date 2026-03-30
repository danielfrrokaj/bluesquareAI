'use client';

import NextImage from 'next/image';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { motion } from "framer-motion";

export function ProjectShowcaseSection({ lang }: { lang: 'en' | 'sq' }) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <section className="py-24 relative overflow-hidden bg-white" id="innovation" ref={ref}>
            <div className="container px-4 relative z-10 max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-blue-600 mb-6 drop-shadow-sm">
                        {lang === 'sq' ? 'Inovacioni në Veprim' : 'Innovation in Action'}
                    </h2>
                    <p className="text-4xl md:text-5xl font-bold text-black leading-tight tracking-tight">
                        {lang === 'sq' 
                            ? 'Një vështrim në disa nga zgjidhjet tona më të fundit.' 
                            : 'A look at some of our latest solutions.'}
                    </p>
                </motion.div>

                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        <Card className="overflow-hidden border-black/5 shadow-2xl rounded-[2rem] md:rounded-[3rem] group transition-all duration-700 hover:shadow-[0_60px_100px_-20px_rgba(59,130,246,0.15)] bg-white w-full">
                            <div className="w-full overflow-hidden">
                                <NextImage 
                                    src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FUntitled%20design%20(1).png?alt=media&token=79776295-c0cf-4ff5-b12e-015d85915a3c"
                                    alt="AI Projects Showcase"
                                    width={1600}
                                    height={900}
                                    className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 896px"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <Card className="overflow-hidden border-black/5 shadow-2xl rounded-[2rem] md:rounded-[3rem] group transition-all duration-700 hover:shadow-[0_60px_100px_-20px_rgba(59,130,246,0.15)] bg-white w-full">
                            <div className="w-full overflow-hidden">
                                <NextImage 
                                    src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FMenaxhim%20i%20lehte%CC%88%20i%20hotelit%20tuaj.png?alt=media&token=920dc86d-30bf-4bab-b595-a94735755f86"
                                    alt="Hotel Management Solution"
                                    width={1600}
                                    height={900}
                                    className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                                    sizes="(max-width: 1024px) 100vw, 896px"
                                />
                            </div>
                        </Card>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-zinc-400 font-medium tracking-widest text-sm uppercase flex items-center justify-center gap-3">
                        <span className="w-8 h-px bg-zinc-200" />
                        {lang === 'sq' ? 'dhe shumë të tjerë....' : 'and many more....'}
                        <span className="w-8 h-px bg-zinc-200" />
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
