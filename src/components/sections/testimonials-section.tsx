'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useInView } from '@/hooks/use-in-view';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import { useIsMobile } from '@/hooks/use-mobile';


const testimonialsSq = [
  {
    name: 'Artan Basha',
    title: 'CEO, Tech Solutions',
    quote: 'Blue Square AI na ndihmoi të transformonim shërbimin tonë ndaj klientit. Inteligjenca artificiale është tepër e ngjashme me njeriun dhe menaxhon shumicën e kërkesave pa probleme, duke liruar ekipin tonë për t\'u fokusuar në çështje komplekse. Një ndryshim i vërtetë!',
  },
  {
    name: 'Elira Hoxha',
    title: 'Menaxhere Marketingu, Creative Co.',
    quote: 'Integrimi pa probleme dhe mbështetja shumëgjuhëshe kanë qenë fenomenale. Tani mund të angazhohemi me audiencën tonë globale pa mundim. E rekomandoj pa masë për çdo biznes që kërkon të rritet.',
  },
  {
    name: 'Genti Prifti',
    title: 'CEO, Bright Solutions',
    quote: 'Paneli i analitikës është i fuqishëm. Marrim njohuri në kohë reale që na kanë ndihmuar të përmirësojmë shërbimet tona dhe kënaqësinë e klientit. Pjesa më e mirë? Ishte kaq e lehtë për t\'u konfiguruar!',
  },
];

const testimonialsEn = [
  {
    name: 'Daniel Rivera',
    title: 'Co-founder, Tech Innovators',
    quote: 'Blue Square AI has transformed our customer support. The AI is incredibly human-like and handles most queries flawlessly, freeing up our team to focus on complex issues. A true game-changer!',
  },
  {
    name: 'Sean C. White',
    title: 'Social Manager, Creative Co.',
    quote: 'The seamless integration and multilingual support have been phenomenal. We can now engage with our global audience effortlessly. Highly recommended for any business looking to scale.',
  },
  {
    name: 'Jessica Miller',
    title: 'CEO, Bright Solutions',
    quote: 'The analytics dashboard is powerful. We get real-time insights that have helped us improve our services and customer satisfaction. The best part? It was so easy to set up!',
  },
];

export function TestimonialsSection({ lang }: { lang: 'en' | 'sq' }) {
    const testimonials = lang === 'sq' ? testimonialsSq : testimonialsEn;
    const content = {
        sq: {
            title: "Çfarë thonë klientët tanë",
            subtitle: "Dëgjoni se çfarë kanë për të thënë klientët tanë të kënaqur për përvojën e tyre me Blue Square AI."
        },
        en: {
            title: "What Our Clients Say",
            subtitle: "Hear what our satisfied clients have to say about their experience with Blue Square AI."
        }
    };
    const currentContent = content[lang];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, threshold: 0.3 });
    const isMobile = useIsMobile();

    const autoplayPlugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
    );


    return (
        <section id="testimonials" className="py-24 bg-white" ref={ref}>
            <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <div className="space-y-3 max-w-3xl">
                        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-headline text-black">
                            {currentContent.title}
                        </h2>
                        <p className="text-lg text-muted-foreground md:text-xl leading-relaxed">
                            {currentContent.subtitle}
                        </p>
                    </div>
                </div>

                <Carousel
                    opts={{ align: 'start', loop: true }}
                    plugins={isMobile ? [] : [autoplayPlugin.current]}
                    className="w-full max-w-6xl mx-auto"
                >
                    <CarouselContent className="-ml-6">
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
                                <div className="h-full py-4">
                                    <Card className="h-full border border-black/5 bg-[#FAFAFA] rounded-2xl transition-all duration-500 hover:shadow-xl hover:shadow-black/5 flex flex-col">
                                        <CardContent className="flex flex-col p-8 h-full">
                                            <div className="mb-6">
                                                <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black/20">
                                                    <path d="M0 13.92V23.52H9.6V13.92H4.8C4.8 11.36 6.88 9.28 9.44 9.28V4.48C4.224 4.48 0 8.704 0 13.92ZM19.2 13.92V23.52H28.8V13.92H24C24 11.36 26.08 9.28 28.64 9.28V4.48C23.424 4.48 19.2 8.704 19.2 13.92Z" fill="currentColor"/>
                                                </svg>
                                            </div>
                                            <p className="text-lg leading-relaxed text-black/80 mb-8 flex-grow font-medium">
                                                {testimonial.quote}
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-black/5">
                                                <h4 className="font-bold font-headline text-black">{testimonial.name}</h4>
                                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">{testimonial.title}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex justify-center mt-12 gap-4">
                        <CarouselPrevious className="static translate-y-0 border-black/10 hover:bg-black hover:text-white transition-colors h-12 w-12" />
                        <CarouselNext className="static translate-y-0 border-black/10 hover:bg-black hover:text-white transition-colors h-12 w-12" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
