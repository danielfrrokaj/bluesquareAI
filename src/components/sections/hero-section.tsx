import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection({ lang }: { lang: 'en' | 'sq' }) {
  const content = {
    sq: {
      headline: "Zhvillim Aplikacionesh me AI: Më Lehtë, Më Shpejt, Të Gatshme për të Ardhmen.",
      subheadline: "Ne përdorim Inteligjencën Artificiale për të fuqizuar zhvillimin e aplikacioneve, duke ofruar zgjidhje me lehtësi, shpejtësi të pashembullt dhe integrim të qetë në biznesin tuaj.",
      cta: "Mëso Më Shumë",
    },
    en: {
      headline: "AI-Powered App Development: Easier, Faster, Future-Proof.",
      subheadline: "We use Artificial Intelligence to power app development, delivering solutions with unparalleled ease, speed, and seamless integration into your business.",
      cta: "See our services",
    }
  }
  const currentContent = content[lang];

  return (
    <section id="home" className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center text-primary-foreground overflow-hidden">
      <Image
        src="/background/homepage_background.avif"
        alt="Abstract technology globe background"
        fill
        className="object-cover fade-in"
        priority
      />
      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 fade-in-up">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              {currentContent.headline}
            </h1>
            <p className="max-w-[700px] md:text-xl">
              {currentContent.subheadline}
            </p>
            <Button size="lg" asChild>
                <Link href="#services">{currentContent.cta}</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}