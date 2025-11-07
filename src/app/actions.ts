'use server';

import { intelligentChatbotForVisitorInteraction } from '@/ai/flows/intelligent-chatbot-for-visitor-interaction';
import { Resend } from 'resend';
import { z } from 'zod';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function handleChatbotQuery(history: { role: string; content: string }[], query: string, lang: 'en' | 'sq', siteContent: string) {
  try {
    const result = await intelligentChatbotForVisitorInteraction({ query, lang, siteContent });
    return { success: true, response: result.response, requiresPhoneNumber: result.requiresPhoneNumber };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'There was a problem communicating with the assistant. Please try again.' };
  }
}

export async function savePhoneNumber(phoneNumber: string, messages: ChatMessage[], lang: 'en' | 'sq') {
    if (!phoneNumber || phoneNumber.length < 6) {
        return { success: false, error: "Invalid phone number." };
    }
    try {
        await addDoc(collection(db, "contactFormSubmissions"), {
            phoneNumber: phoneNumber,
            interestedServices: messages, // Now saving the full message objects
            submissionDate: new Date().toISOString(),
            preferredLanguage: lang,
        });
        return { success: true };
    } catch (error) {
        console.error("Error writing document: ", error);
        return { success: false, error: "Could not save phone number." };
    }
}


export async function submitContactForm(formData: { name: string; email: string; message: string }) {
  const parsed = contactFormSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: 'Invalid form data.' };
  }

  const { name, email, message } = parsed.data;

  const resend = new Resend('re_Mvd9e73R_6b6Sb7qGz8dh1Y4jGCX7mw5Y');

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'danielyoutub100@gmail.com',
      subject: `New message from ${name} on Your Website`,
      html: `<p>You received a new message from your website contact form.</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'There was a problem sending your message. Please try again later.' };
  }
}

export async function subscribeToNewsletter(formData: { email: string }) {
    const parsed = newsletterSchema.safeParse(formData);

    if (!parsed.success) {
        return { success: false, error: 'Invalid email address.' };
    }

    console.log(`New newsletter subscription: ${parsed.data.email}`);
    // Here you would typically add the email to your mailing list service
    // For this example, we'll just simulate a success response.
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };
}
