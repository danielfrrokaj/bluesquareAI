"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/site";

type Labels = {
  name: string;
  email: string;
  company: string;
  topic: string;
  topicOther: string;
  message: string;
  submit: string;
  note: string;
  subject: string;
};

/**
 * Collects the enquiry and opens the visitor's email app with it addressed to us.
 * No backend is needed; swap handleSubmit for an API call to send server-side.
 */
export function ContactForm({ labels, topics }: { labels: Labels; topics: string[] }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const topic = get("topic");
    const subject = `${labels.subject}${topic ? `: ${topic}` : ""}`;
    const details = [`${labels.name}: ${get("name")}`, `${labels.email}: ${get("email")}`];
    if (get("company")) details.push(`${labels.company}: ${get("company")}`);
    const body = `${details.join("\n")}\n\n${get("message")}`;
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__row">
        <div className="field">
          <label htmlFor="cf-name">{labels.name}</label>
          <input id="cf-name" name="name" type="text" autoComplete="name" required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="cf-email">{labels.email}</label>
          <input id="cf-email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="cf-company">{labels.company}</label>
          <input id="cf-company" name="company" type="text" autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="cf-topic">{labels.topic}</label>
          <select id="cf-topic" name="topic" defaultValue={topics[0]}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
            <option>{labels.topicOther}</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-message">{labels.message}</label>
        <textarea id="cf-message" name="message" rows={6} required minLength={10} />
      </div>
      <button type="submit" className="btn btn--primary">
        {labels.submit}
      </button>
      <p className="form__note" role={sent ? "status" : undefined}>
        {labels.note}
      </p>
    </form>
  );
}
