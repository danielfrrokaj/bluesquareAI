import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { servicesData } from '@/lib/services-data';
import { notFound } from 'next/navigation';

export default function ServicePage({ params, searchParams }: { params: { slug: string }, searchParams: { lang?: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';
  const service = servicesData[lang].find(s => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-1">
        <section className="py-20 md:py-32">
            <div className="container">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline mb-4">
                        {service.title}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {service.description}
                    </p>
                </div>
            </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = new Set<string>();
  servicesData.en.forEach(s => slugs.add(s.slug));
  servicesData.sq.forEach(s => slugs.add(s.slug));
  
  return Array.from(slugs).map(slug => ({
    slug,
  }));
}