import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "What is a chatbot and how does it work?",
        answer: "A chatbot is an AI-powered software that can simulate a conversation with a user in natural language through messaging applications, websites, mobile apps, or through the telephone. It uses Natural Language Processing (NLP) to understand and respond to user queries.",
    },
    {
        question: "Do I need technical skills to set it up?",
        answer: "Not at all! Our platform is designed to be user-friendly. You can build, customize, and deploy your chatbot with our intuitive drag-and-drop interface, no coding required. We also provide comprehensive tutorials and support to guide you.",
    },
    {
        question: "Can the chatbot integrate with my website or CRM?",
        answer: "Yes, our chatbot offers seamless integration with most popular website platforms like WordPress, Shopify, and Wix, as well as CRM systems like Salesforce and HubSpot. You can easily connect your tools to create a unified workflow.",
    },
    {
        question: "Does it support multiple languages?",
        answer: "Absolutely. Our chatbot is built with multilingual capabilities, allowing you to engage with a global audience in their native language. You can easily add and manage multiple languages from your dashboard.",
    },
    {
        question: "Is live chat available with the bot?",
        answer: "Yes, our platform supports a hybrid model where the chatbot can handle initial queries and then seamlessly hand over the conversation to a human agent when necessary. This ensures your customers always get the best possible support.",
    },
];


export function FaqSection() {
    return (
        <section id="help" className="bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h2>
                    <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
                        Have questions? We've got answers. Here are some of the most common questions we get from our customers.
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
