'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const pricingPlans = {
  monthly: [
    {
      name: 'Starter Package',
      price: '$19',
      period: '/month',
      features: [
        '1 Chatbot Platform',
        'Up to 1,000 conversations/month',
        'Basic NLP Level',
        'Email Support',
      ],
      cta: 'Start 7-Day Free Trial',
    },
    {
      name: 'Pro Package',
      price: '$49',
      period: '/month',
      features: [
        '3 Chatbot Platforms',
        'Up to 5,000 conversations/month',
        'Advanced NLP Level',
        'Priority Email Support',
        'Basic Integrations',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Business Package',
      price: '$99',
      period: '/month',
      features: [
        'Unlimited Chatbot Platforms',
        'Unlimited conversations',
        'Expert NLP Level',
        '24/7 Phone & Email Support',
        'Advanced Integrations',
      ],
      cta: 'Start 14-Day Free Trial',
    },
  ],
  yearly: [
    {
      name: 'Starter Package',
      price: '$15',
      period: '/month',
      features: [
        '1 Chatbot Platform',
        'Up to 1,000 conversations/month',
        'Basic NLP Level',
        'Email Support',
      ],
      cta: 'Start 7-Day Free Trial',
    },
    {
      name: 'Pro Package',
      price: '$39',
      period: '/month',
      features: [
        '3 Chatbot Platforms',
        'Up to 5,000 conversations/month',
        'Advanced NLP Level',
        'Priority Email Support',
        'Basic Integrations',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Business Package',
      price: '$79',
      period: '/month',
      features: [
        'Unlimited Chatbot Platforms',
        'Unlimited conversations',
        'Expert NLP Level',
        '24/7 Phone & Email Support',
        'Advanced Integrations',
      ],
      cta: 'Start 14-Day Free Trial',
    },
  ],
};

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const plans = isYearly ? pricingPlans.yearly : pricingPlans.monthly;

  return (
    <section id="pricing" className="bg-card">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
            Our <span className="gradient-text">Pricing Plans</span>
          </h2>
          <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
            Choose the perfect plan for your business. All plans come with a free trial, no credit card required.
          </p>
          <div className="flex items-center space-x-2 pt-4">
            <Label htmlFor="pricing-switch" className={cn(!isYearly && "text-primary")}>Monthly</Label>
            <Switch
              id="pricing-switch"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="pricing-switch" className={cn(isYearly && "text-primary")}>Yearly (Save 23%)</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative flex flex-col p-6 rounded-lg shadow-md border',
                plan.popular ? 'border-primary' : 'border-border'
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="inline-block px-3 py-1 text-sm font-semibold text-primary-foreground bg-primary rounded-full">
                        Most Popular
                    </div>
                </div>
              )}
              <h3 className="text-xl font-bold font-headline mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? 'default' : 'outline'}
                className={cn(plan.popular && 'bg-gradient-to-r from-primary to-secondary')}
              >
                {plan.cta}
              </Button>
            </div>
))}
        </div>
      </div>
    </section>
  );
}
