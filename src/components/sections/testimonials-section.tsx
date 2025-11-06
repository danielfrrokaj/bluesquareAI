'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const testimonials = [
  {
    name: 'Daniel Rivera',
    title: 'Co-founder, Tech Innovators',
    quote: 'Sasico has transformed our customer support. The AI is incredibly human-like and handles most queries flawlessly, freeing up our team to focus on complex issues. A true game-changer!',
    imgId: 'testimonial-1'
  },
  {
    name: 'Sean C. White',
    title: 'Social Manager, Creative Co.',
    quote: 'The seamless integration and multilingual support have been phenomenal. We can now engage with our global audience effortlessly. Highly recommended for any business looking to scale.',
    imgId: 'testimonial-2'
  },
    {
    name: 'Jessica Miller',
    title: 'CEO, Bright Solutions',
    quote: 'The analytics dashboard is powerful. We get real-time insights that have helped us improve our services and customer satisfaction. The best part? It was so easy to set up!',
    imgId: 'testimonial-3'
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Loved by Teams <span className="gradient-text">Worldwide</span>
            </h2>
            <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
                Hear what our satisfied clients have to say about their experience with Sasico.
            </p>
        </div>
        <Carousel
          opts={{ align: 'start', loop: true }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => {
                const image = PlaceHolderImages.find((p) => p.id === testimonial.imgId);
                return (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                        <div className="p-1">
                        <Card className="h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            {image && <Image
                                src={image.imageUrl}
                                alt={testimonial.name}
                                width={80}
                                height={80}
                                className="rounded-full mb-4 border-2 border-primary"
                                data-ai-hint={image.imageHint}
                            />}
                            <p className="text-lg font-medium italic mb-4">"{testimonial.quote}"</p>
                            <h4 className="font-bold font-headline">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                            </CardContent>
                        </Card>
                        </div>
                    </CarouselItem>
                )
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
