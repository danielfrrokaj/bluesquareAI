import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function HeroSection() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-robot');

  return (
    <section id="home" className="relative w-full h-screen min-h-[700px] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 z-10" />
      <div className="container px-4 md:px-6 relative z-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-start space-y-6 text-left fade-in-up">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              Your Digital Assistant, <br />
              <span className="gradient-text">Always On.</span>
            </h1>
            <p className="max-w-xl text-muted-foreground md:text-xl">
              Revolutionize the way you communicate with an AI-powered chatbot that offers multilingual support, seamless integration, and human-like conversations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg">
                Get a Free 14-days trial
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] fade-in-up" style={{ animationDelay: '0.2s' }}>
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-contain"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
