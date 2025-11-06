import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ProductsSectionProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    title: 'Our Core Products',
    subtitle: 'These are some examples of the innovative products we have built to empower businesses.',
    products: [
      {
        id: '1',
        title: 'AI Assistant Web Chat',
        description: 'An intelligent chat that responds and collects customer data 24/7.',
      },
      {
        id: '2',
        title: 'Smart Cam Monitor',
        description: 'An application that recognizes faces or calculates people flow in stores or offices.',
      },
      {
        id: '3',
        title: 'AutoBooking AI',
        description: 'A reservation system with overbooking control and automatic invoicing.',
      },
      {
        id: '4',
        title: 'BlueDesk',
        description: 'A management platform for sales, payments, staff, and notifications on a single screen.',
      },
      {
        id: '5',
        title: 'WhatsAI Connect',
        description: 'WhatsApp API integration with intelligence that automatically manages communication.',
      },
    ],
  },
  sq: {
    title: 'Produktet Tona Kryesore',
    subtitle: 'Këto janë disa nga shembujt e produkteve inovative që kemi ndërtuar për të fuqizuar bizneset.',
    products: [
      {
        id: '1',
        title: 'AI Assistant Web Chat',
        description: 'Chat inteligjent që përgjigjet dhe mbledh të dhëna të klientëve 24/7.',
      },
      {
        id: '2',
        title: 'Smart Cam Monitor',
        description: 'Aplikacion që njeh fytyra ose llogarit fluksin e njerëzve në lokale apo zyra.',
      },
      {
        id: '3',
        title: 'AutoBooking AI',
        description: 'Sistem rezervimesh me kontroll kundër overbooking-ut dhe faturim automatik.',
      },
      {
        id: '4',
        title: 'BlueDesk',
        description: 'Platformë menaxhimi për shitje, pagesa, staf dhe njoftime në një ekran të vetëm.',
      },
      {
        id: '5',
        title: 'WhatsAI Connect',
        description: 'Integrim i WhatsApp API me inteligjencë që menaxhon automatikisht komunikimin.',
      },
    ],
  },
};

const imageMap = {
  '1': PlaceHolderImages.find(p => p.id === 'product-image-1'),
  '2': PlaceHolderImages.find(p => p.id === 'product-image-2'),
  '3': PlaceHolderImages.find(p => p.id === 'product-image-3'),
};


export function ProductsSection({ lang }: ProductsSectionProps) {
  const t = translations[lang];

  return (
    <section id="products" className="bg-card">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t.title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.products.map((product) => {
            const image = imageMap[product.id as keyof typeof imageMap];
            return (
              <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-xl">
                {image && (
                   <div className="relative h-48 w-full">
                      <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                      />
                   </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline">{product.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{product.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
}
