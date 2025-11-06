import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="bg-card">
      <div className="container px-4 md:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 md:p-12 text-center text-primary-foreground shadow-lg">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-4">
            Ready for smarter conversations?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-lg">
            Get the chatbot app and start your free trial today to revolutionize your customer interactions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Start 14-day free trial
            </Button>
            <Button size="lg" variant="ghost" className="hover:bg-white/10 text-white hover:text-white">
              <PlayCircle className="mr-2 h-5 w-5" />
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
