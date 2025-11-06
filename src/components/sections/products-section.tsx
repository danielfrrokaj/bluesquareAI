import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const products = [
  {
    id: '1',
    image: PlaceHolderImages.find(p => p.id === 'product-image-1'),
    title: 'AI Assistant Web Chat',
    description: 'Chat inteligjent që përgjigjet dhe mbledh të dhëna të klientëve 24/7.',
  },
  {
    id: '2',
    image: PlaceHolderImages.find(p => p.id === 'product-image-2'),
    title: 'Smart Cam Monitor',
    description: 'Aplikacion që njeh fytyra ose llogarit fluksin e njerëzve në lokale apo zyra.',
  },
  {
    id: '3',
    image: PlaceHolderImages.find(p => p.id === 'product-image-3'),
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
];

export function ProductsSection() {
  return (
    <section id="products" className="bg-card">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Produktet Tona Kryesore</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Këto janë disa nga shembujt e produkteve inovative që kemi ndërtuar për të fuqizuar bizneset.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-xl">
              {product.image && (
                 <div className="relative h-48 w-full">
                    <Image
                    src={product.image.imageUrl}
                    alt={product.image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={product.image.imageHint}
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
          ))}
        </div>
      </div>
    </section>
  );
}
