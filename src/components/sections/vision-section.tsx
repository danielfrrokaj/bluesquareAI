
'use client';

import { useInView } from "@/hooks/use-in-view";
import { useRef } from "react";
import { cn } from "@/lib/utils";

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
    const isInView = useInView(ref, { once: true, amount: 0.5 });


    return (
        <section id="vision" className="bg-card" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                           {currentContent.title}
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            {currentContent.text}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
