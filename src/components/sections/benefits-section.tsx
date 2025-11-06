import { CheckCircle2, BarChart, Bot, ShieldCheck, Zap, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: 'AI-Powered Automation',
        description: 'Reduce manual tasks and let our AI handle the repetitive work.',
    },
    {
        icon: <BarChart className="h-8 w-8 text-primary" />,
        title: 'Real-Time Analytics',
        description: 'Get instant insights into your customer interactions and performance.',
    },
    {
        icon: <Zap className="h-8 w-8 text-primary" />,
        title: 'Omnichannel Support',
        description: 'Connect with your customers on any platform, from website to social media.',
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary" />,
        title: 'Secure & Compliant',
        description: 'Your data is protected with enterprise-grade security and compliance.',
    },
    {
        icon: <SlidersHorizontal className="h-8 w-8 text-primary" />,
        title: 'Scalable for any business',
        description: 'From small startups to large enterprises, our solution grows with you.',
    },
    {
        icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
        title: 'Built-in time tracking',
        description: 'Monitor team productivity and optimize your resource allocation.',
    },
];

export function BenefitsSection() {
    return (
        <section id="benefits" className="bg-card">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                        Unlock Game-Changing <span className="gradient-text">Benefits</span>
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                        Discover why businesses choose Sasico to power their customer communications and drive growth.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg transition-all hover:bg-background">
                            <div className="mt-1">{benefit.icon}</div>
                            <div>
                                <h3 className="text-lg font-semibold font-headline">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
