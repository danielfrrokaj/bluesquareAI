import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import { postsBetween } from "@/lib/marketing";
import { Shell } from "@/components/Shell";
import { marketingNav } from "@/components/nav";
import { addDays, localDay, PostChip, UploadButton } from "../parts";
import s from "../marketing.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publishing plan" };

const monthName = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** Month calendar of planned posts (?month=YYYY-MM), drawn as whole weeks from Monday. */
export default async function PlanPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireAuth();
  const canDelete = (createdBy: string | null) => isAdmin(user) || createdBy === user.id;
  const today = localDay(new Date());

  const sp = await searchParams;
  const month = sp.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.month) ? sp.month : today.slice(0, 7);
  const first = `${month}-01`;
  const lead = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();
  const days = Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, i) => addDays(first, i - lead));
  const shift = (n: number) => new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7) - 1 + n, 1)).toISOString().slice(0, 7);

  const planned = await postsBetween(days[0], days[days.length - 1]);
  const byDay = Map.groupBy(planned, (p) => p.publish_day!);
  const inMonth = planned.filter((p) => p.publish_day!.startsWith(month)).length;

  return (
    <Shell department="marketing" subnav={marketingNav("plan")}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <h1>Publishing plan</h1>
            <p className="muted">{inMonth} {inMonth === 1 ? "post" : "posts"} planned in {monthName(month)}. Click a post to change its date or networks.</p>
          </div>
          <UploadButton day={month === today.slice(0, 7) ? undefined : first} />
        </div>

        <section className="panel">
          <header className="panel__head">
            <nav className={s.calhead} aria-label="Month">
              <Link href={`/marketing/plan?month=${shift(-1)}`} className={s.navbtn} aria-label="Previous month">‹</Link>
              <h2 aria-live="polite">{monthName(month)}</h2>
              <Link href={`/marketing/plan?month=${shift(1)}`} className={s.navbtn} aria-label="Next month">›</Link>
            </nav>
            {month !== today.slice(0, 7) && <Link href="/marketing/plan" className="btn btn--small">Today</Link>}
          </header>
          <div className={s.cal}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className={s.dow}>{d}</div>)}
            {days.map((day) => (
              <div key={day} className={`${s.day}${day.slice(0, 7) !== month ? ` ${s.out}` : ""}${day === today ? ` ${s.today}` : ""}`}>
                <span className={s.daynum}>{+day.slice(8)}</span>
                {(byDay.get(day) ?? []).map((p) => <PostChip key={p.id} post={p} canDelete={canDelete(p.created_by)} />)}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
