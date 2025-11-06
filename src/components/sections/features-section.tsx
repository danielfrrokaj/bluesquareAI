import { Languages, BrainCircuit, Cable } from 'lucide-react';

const features = [
    {
        icon: <Languages className="h-10 w-10 text-primary" />,
        title: "Multilingual Support",
        description: "Engage with a global audience in their native language, breaking down communication barriers.",
    },
    {
        icon: <BrainCircuit className="h-10 w-10 text-primary" />,
        title: "AI-Driven Solutions",
        description: "Leverage the power of artificial intelligence to deliver smart, context-aware responses.",
    },
    {
        icon: <Cable className="h-10 w-10 text-primary" />,
        title: "Seamless Integration",
        description: "Connect our chatbot with your existing tools and platforms for a unified workflow.",
    },
];

export function FeaturesSection() {
    return (
        <section className="bg-card">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                        Elevate every interaction
                    </h2>
                    <p className="max-w-xl mx-auto mt-4 text-muted-foreground md:text-xl/relaxed">
                        Built-in brilliance – discover the smart side of chat.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6">
                            <div className="mb-4 flex items-center justify-center rounded-full bg-primary/10 p-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2 font-headline">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
