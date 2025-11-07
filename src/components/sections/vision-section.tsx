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
    const isInView = useInView(ref, { once: true, amount: 0.3 });


    return (
        <section id="vision" className="bg-card" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-4">
                           {currentContent.title}
                        </h2>
                        <p className="max-w-[600px] mx-auto md:mx-0 text-muted-foreground md:text-xl/relaxed">
                            {currentContent.text}
                        </p>
                    </div>
                     <div className="relative h-64 md:h-96 w-full">
                        <Image
                            src="https://png.pngtree.com/png-vector/20240517/ourmid/pngtree-smartphone-technological-and-digital-future-mobile-phone-in-isometric-png-image_12475312.png"
                            alt="Abstract 3D planet"
                            fill
                            className="object-contain"
                            data-ai-hint="smartphone technology"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
