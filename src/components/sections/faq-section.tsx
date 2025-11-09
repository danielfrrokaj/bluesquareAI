
'use client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqsEn = [
    {
        question: "What does 'Starting at' price mean?",
        answer: "The 'Starting at' price represents the base cost for the essential features of a service package. The final price may vary depending on your specific needs, the scale of implementation, and any additional custom features you require.",
    },
    {
        question: "Why is some pricing 'On-demand'?",
        answer: "Some of our solutions, like custom management systems or advanced local business integrations, are highly tailored to each client's unique operational needs. 'On-demand' pricing allows us to provide a fair and accurate quote after a thorough consultation to understand your specific requirements.",
    },
    {
        question: "Is there a setup fee?",
        answer: "For most of our packages, the setup fee is included in the quoted price. For more complex, on-demand projects, a separate setup fee may apply, which will be clearly outlined in your personalized quote.",
    },
    {
        question: "Can I upgrade my plan later?",
        answer: "Absolutely! We understand that your business needs can change. You can easily upgrade your plan at any time to access more features and handle greater capacity. We'll work with you to ensure a smooth transition.",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, bank transfers, and other digital payment methods. All payments are processed securely.",
    },
];

const faqsSq = [
    {
        question: "Çfarë do të thotë çmimi 'Fillestar'?",
        answer: "Çmimi 'Fillestar' përfaqëson koston bazë për veçoritë thelbësore të një pakete shërbimi. Çmimi përfundimtar mund të ndryshojë në varësi të nevojave tuaja specifike, shkallës së implementimit dhe çdo veçorie shtesë të personalizuar që kërkoni.",
    },
    {
        question: "Pse disa çmime janë 'Sipas kërkesës'?",
        answer: "Disa nga zgjidhjet tona, si sistemet e personalizuara të menaxhimit ose integrimet e avancuara për bizneset lokale, janë të përshtatura posaçërisht për nevojat unike operacionale të çdo klienti. Çmimi 'Sipas kërkesës' na lejon të ofrojmë një kuotë të drejtë dhe të saktë pas një konsultimi të thelluar për të kuptuar kërkesat tuaja specifike.",
    },
    {
        question: "A ka një tarifë instalimi?",
        answer: "Për shumicën e paketave tona, tarifa e instalimit është e përfshirë në çmimin e kuotuar. Për projekte më komplekse dhe sipas kërkesës, mund të aplikohet një tarifë e veçantë instalimi, e cila do të specifikohet qartë në kuotën tuaj të personalizuar.",
    },
    {
        question: "A mund ta ndryshoj planin tim më vonë?",
        answer: "Absolutisht! Ne e kuptojmë që nevojat e biznesit tuaj mund të ndryshojnë. Ju mund ta përmirësoni lehtësisht planin tuaj në çdo kohë për të pasur akses në më shumë veçori dhe për të përballuar kapacitet më të madh. Ne do të punojmë me ju për të siguruar një tranzicion të lehtë.",
    },
    {
        question: "Çfarë metodash pagese pranoni?",
        answer: "Ne pranojmë të gjitha kartat kryesore të kreditit, transfertat bankare dhe metoda të tjera pagese dixhitale. Të gjitha pagesat procesohen në mënyrë të sigurt.",
    },
];

type FaqProps = {
    lang?: 'en' | 'sq';
};


export function FaqSection({ lang = 'en' }: FaqProps) {
    const faqs = lang === 'sq' ? faqsSq : faqsEn;
    const content = {
        sq: {
            title: "Pyetje të Shpeshta",
            subtitle: "Keni pyetje? Ne kemi përgjigje. Këtu janë disa nga pyetjet më të shpeshta që marrim nga klientët tanë."
        },
        en: {
            title: "Frequently Asked Questions",
            subtitle: "Have questions? We've got answers. Here are some of the most common questions we get from our customers."
        }
    }
    const currentContent = content[lang];
    return (
        <section id="help" className="bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                        {currentContent.title}
                    </h2>
                    <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
                        {currentContent.subtitle}
                    </p>
                </div>
                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
