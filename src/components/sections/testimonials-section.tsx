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
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const isMobile = useIsMobile();

    const autoplayPlugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
    );


  return (
    <section id="testimonials" className="bg-card py-16 md:py-24 lg:py-32" ref={ref}>
      <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {currentContent.title}
            </h2>
            <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
                {currentContent.subtitle}
            </p>
        </div>
        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={isMobile ? [] : [autoplayPlugin.current]}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                        <div className="p-1 h-full">
                        <Card className="h-full bg-background">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
                            <p className="text-lg font-medium italic mb-4 flex-1">"{testimonial.quote}"</p>
                            <div>
                                <h4 className="font-bold font-headline">{testimonial.name}</h4>
                                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                            </div>
                            </CardContent>
                        </Card>
                        </div>
                    </CarouselItem>
                )
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
