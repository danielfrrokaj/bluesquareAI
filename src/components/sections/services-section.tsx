import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bot, BarChart3, Building, MessagesSquare, Store, Plane } from 'lucide-react';

const services = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'Integrim i AI në Website',
    description: 'Chatbot inteligjent, analizë trafiku, dhe gjenerim përmbajtje SEO me AI.',
  },
  {
    icon: <Building className="h-8 w-8 text-primary" />,
    title: 'Sisteme Menaxhimi & Monitorimi',
    description: 'Mini-PMS për akomodim, dashboard inteligjent dhe integrim me kamera sigurie.',
  },
  {
    icon: <MessagesSquare className="h-8 w-8 text-primary" />,
    title: 'Automatizim Komunikimi',
    description: 'Integrim WhatsApp Business API dhe AI për përgjigje automatike në rrjete sociale.',
  },
  {
    icon: <Store className="h-8 w-8 text-primary" />,
    title: 'Zgjidhje për Biznese Lokale',
    description: 'Sisteme për porosi, pagesa, rezervime online dhe programe besnikërie.',
  },
  {
    icon: <Plane className="h-8 w-8 text-primary" />,
    title: 'AI për Turizëm & Shërbime',
    description: 'Chatbot për hotele/agjenci, sinkronizim rezervimesh dhe analizë komentesh.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Analizë e Thelluar',
    description: 'Raporte të detajuara dhe parashikime të bazuara në të dhënat tuaja për vendimmarrje më të mirë.',
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Çfarë Ofrojmë</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Zgjidhjet tona të fuqizuara nga AI janë krijuar për të transformuar biznesin tuaj, duke rritur efikasitetin dhe duke ulur kostot.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                {service.icon}
                <CardTitle className="font-headline">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
