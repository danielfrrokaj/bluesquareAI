import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    title: 'AI-Powered Automation',
    stat: '2h 20m',
    description: 'Average time you spent per day',
    imgId: 'all-in-one-1',
  },
  {
    title: 'Cutting-edge AI features for growing a business',
    imgId: 'all-in-one-2',
  },
  {
    title: 'Smart Task Management',
    imgId: 'all-in-one-3',
  },
  {
    title: "Customers AI-powered chatbots — free forever",
    imgId: 'all-in-one-4',
  },
  {
    title: 'Auto backup and recovery',
    imgId: 'all-in-one-5',
  },
];

export function AllInOneSection() {
  return (
    <section id="about" className="bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                The <span className="gradient-text">All-in-One</span> AI Solution
            </h2>
            <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
                Unlock powerful capabilities with our comprehensive suite of AI tools designed to streamline your workflow and boost productivity.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const image = PlaceHolderImages.find((p) => p.id === feature.imgId);
            return (
              <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-2 group">
                <CardHeader className="p-0">
                  {image && (
                    <div className="relative h-56 w-full">
                      <Image
                        src={image.imageUrl}
                        alt={feature.title}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-lg mb-2">{feature.title}</CardTitle>
                  {feature.stat && (
                    <div className="mb-2">
                        <p className="text-3xl font-bold gradient-text">{feature.stat}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  )}
                  {!feature.stat && <p className="text-sm text-muted-foreground">Manage tasks, track progress, and collaborate seamlessly with your team.</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
}
