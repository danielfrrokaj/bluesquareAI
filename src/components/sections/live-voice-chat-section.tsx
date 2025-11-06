import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare, ShieldCheck, Share2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const chatFeatures = [
    {
        icon: <MessageSquare className="h-5 w-5 text-primary" />,
        text: 'Real-time messaging'
    },
    {
        icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
        text: 'Typing indicators & read receipts'
    },
    {
        icon: <Share2 className="h-5 w-5 text-primary" />,
        text: 'File & media sharing'
    },
    {
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        text: 'Secure & encrypted chat'
    },
]

export function LiveVoiceChatSection() {
    const chatImage = PlaceHolderImages.find((p) => p.id === 'live-chat-interface');
    return (
        <section className="bg-background">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline mb-4">
                            Talk to us <span className="gradient-text">live</span> anytime, anywhere.
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Our live chat feature allows you to connect with human agents instantly, ensuring your customers always have access to the help they need, right when they need it.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {chatFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    {feature.icon}
                                    <span className="font-medium">{feature.text}</span>
                                </li>
                            ))}
                        </ul>
                        <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                            Start a Free Trial
                        </Button>
                    </div>
                    <div className="order-1 md:order-2">
                        {chatImage && (
                            <Image
                                src={chatImage.imageUrl}
                                alt={chatImage.description}
                                width={600}
                                height={600}
                                className="rounded-xl shadow-2xl shadow-primary/10"
                                data-ai-hint={chatImage.imageHint}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
