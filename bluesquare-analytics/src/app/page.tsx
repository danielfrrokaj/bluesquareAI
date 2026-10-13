import Link from "next/link";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { projection } from "@/lib/finance-reports";
import { listSites } from "@/lib/sites";
import { siteTotals } from "@/lib/stats";
import { monthLabel, parsePeriod, today } from "@/lib/period";
import { salesStats } from "@/lib/sales";
import { listAdsWithStats, sumTotals } from "@/lib/ads";
import { listProjects, listTasks } from "@/lib/projects";
import { money, num } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { NavIcon } from "@/components/NavIcon";
import { ChannexCard, ChannexCardLoading, GoogleCloudCard, GoogleCloudCardLoading } from "@/components/SupplierCards";
import s from "./overview.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

export default async function Overview() {
  const user = await requireAuth();
  const date = today();
  const month = parsePeriod({ period: "month" });
  const [proj, sites, traffic, sales, ads, projects, tasks] = await Promise.all([
    projection(), listSites(), siteTotals("7d"), salesStats(date), listAdsWithStats(month.from, month.to),
    listProjects(), listTasks(),
  ]);
  const adTotals = sumTotals(ads);
  const net = proj.actual.income - proj.actual.expense;
  const expectedNet = proj.projected.income !== null && proj.projected.expense !== null
    ? proj.projected.income - proj.projected.expense : null;
  const visitors = Object.values(traffic).reduce((sum, t) => sum + t.visitors, 0);
  const views = Object.values(traffic).reduce((sum, t) => sum + t.views, 0);
  const openTasks = tasks.filter((task) => task.status !== "done");
  const overdueTasks = openTasks.filter((task) => task.overdue).length;
  const inProgress = openTasks.filter((task) => task.status === "in_progress").length;
  const currentProjects = projects.filter((project) => project.status !== "Completed");
  const followUpsToday = sales.due - sales.overdue;
  const attentionCount = sales.due + overdueTasks;
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

  return (
    <Shell department="overview">
      <div className={s.overview}>
        <header className={s.pageHead}>
          <div>
            <h1>Overview</h1>
            <p>Hello, {user.name.split(" ")[0]}. Here&apos;s where things stand.</p>
          </div>
          <time className={s.date} dateTime={date}><NavIcon name="calendar" />{dateLabel}</time>
        </header>

        <div className={s.topGrid}>
          <section className={s.finance} aria-labelledby="finance-title">
            <header className={s.financeHead}>
              <div className={s.sectionTitle}>
                <DepartmentIcon name="finance" />
                <div><h2 id="finance-title">Finance</h2><p>{monthLabel(proj.month)}</p></div>
              </div>
              <Link href="/finance" className={s.glassLink}>Open finance <Chevron /></Link>
            </header>

            <div className={s.financeBody}>
              <div className={s.net}>
                <span>Net this month</span>
                <strong>{money(net)}</strong>
                <small>{net < 0 ? "Expenses exceed recorded income" : net > 0 ? "Income after recorded expenses" : "Income and expenses are balanced"}</small>
              </div>
              <dl className={s.cashFlow}>
                <div><dt><MovementIcon /> Income</dt><dd>{money(proj.actual.income)}</dd></div>
                <div><dt><MovementIcon outgoing /> Expenses</dt><dd>{money(proj.actual.expense)}</dd></div>
              </dl>
            </div>

            <div className={s.financeFooter}>
              <div><span>Month-end estimate</span><strong>{expectedNet === null ? "Building forecast" : money(expectedNet)}</strong></div>
              <Link href="/finance/reports#forecast">View forecast <NavIcon name="reports" /></Link>
            </div>
          </section>

          <section className={s.attention} aria-labelledby="attention-title">
            <header className={s.panelHead}>
              <h2 id="attention-title">Needs attention</h2>
              <span className={`${s.count} ${attentionCount ? s.countWarm : ""}`}>{num(attentionCount)}</span>
            </header>
            <p className={s.sectionNote}>{attentionCount ? "A few things to keep moving." : "No overdue tasks or follow-ups due."}</p>
            <ul className={s.attentionList}>
              <li><Link href="/sales?due=overdue"><span className={`${s.attentionIcon} ${sales.overdue ? s.red : ""}`}><NavIcon name="phone" /></span><span>Overdue follow-ups</span><strong className={sales.overdue ? s.redText : undefined}>{num(sales.overdue)}</strong><Chevron /></Link></li>
              <li><Link href="/sales?due=today"><span className={s.attentionIcon}><NavIcon name="calendar" /></span><span>Follow-ups today</span><strong>{num(followUpsToday)}</strong><Chevron /></Link></li>
              <li><Link href="/projects?view=list"><span className={`${s.attentionIcon} ${overdueTasks ? s.red : ""}`}><NavIcon name="board" /></span><span>Overdue tasks</span><strong className={overdueTasks ? s.redText : undefined}>{num(overdueTasks)}</strong><Chevron /></Link></li>
            </ul>
            <Link href="/projects?who=me" className={s.myTasks}>View my tasks <Chevron /></Link>
          </section>
        </div>

        {/* Supplier costs billed in USD, streamed in: Google Cloud and the daily LuxHotel read can take a few seconds. */}
        <ul className="fstats" aria-label="Expected supplier costs this month">
          <Suspense fallback={<ChannexCardLoading />}><ChannexCard /></Suspense>
          <Suspense fallback={<GoogleCloudCardLoading />}><GoogleCloudCard period={month} /></Suspense>
        </ul>

        <div className={s.departments}>
          <Link href="/analytics" className={s.department}>
            <div className={s.departmentHead}><DepartmentIcon name="analytics" /><h2>Analytics</h2><Chevron /></div>
            <p className={s.period}>Last 7 days</p>
            <div className={s.mainMetric}><strong>{num(visitors)}</strong><span>Visitors across websites</span></div>
            <dl className={s.supportMetrics}><div><dt>Page views</dt><dd>{num(views)}</dd></div><div><dt>Websites</dt><dd>{num(sites.length)}</dd></div></dl>
          </Link>
          <Link href="/marketing/ads" className={`${s.department} ${s.marketing}`}>
            <div className={s.departmentHead}><DepartmentIcon name="marketing" /><h2>Marketing &amp; Ads</h2><Chevron /></div>
            <p className={s.period}>Meta Ads · {monthLabel(proj.month)}</p>
            <div className={s.mainMetric}><strong>{money(adTotals.spend)}</strong><span>Ad spend this month</span></div>
            <dl className={s.supportMetrics}><div><dt>Active ads</dt><dd>{num(ads.filter((ad) => ad.status === "active").length)}</dd></div><div><dt>Results</dt><dd>{num(adTotals.results)}</dd></div></dl>
          </Link>
          <Link href="/sales" className={`${s.department} ${s.sales}`}>
            <div className={s.departmentHead}><DepartmentIcon name="sales" /><h2>Sales</h2><Chevron /></div>
            <p className={s.period}>Current pipeline</p>
            <div className={s.mainMetric}><strong>{num(sales.open)}</strong><span>Open leads</span></div>
            <dl className={s.supportMetrics}><div><dt>Interested</dt><dd>{num(sales.interested)}</dd></div><div><dt>Customers</dt><dd>{num(sales.customers)}</dd></div></dl>
          </Link>
        </div>

        <section className={s.projects} aria-labelledby="projects-title">
          <header className={s.panelHead}>
            <div className={s.sectionTitle}>
              <DepartmentIcon name="projects" />
              <div><h2 id="projects-title">Projects &amp; tasks</h2><p>{num(currentProjects.length)} ongoing {currentProjects.length === 1 ? "project" : "projects"}</p></div>
            </div>
            <Link href="/projects" className="btn btn--small"><NavIcon name="board" /> Open task board</Link>
          </header>
          <div className={s.projectBody}>
            <div className={s.taskSummary}>
              <div className={s.openTasks}><strong>{num(openTasks.length)}</strong><span>Open tasks</span></div>
              <dl className={s.taskCounts}>
                <div><dt><i />To do</dt><dd>{num(openTasks.length - inProgress)}</dd></div>
                <div><dt><i className={s.inProgress} />In progress</dt><dd>{num(inProgress)}</dd></div>
                <div><dt><i className={s.overdue} />Overdue</dt><dd className={overdueTasks ? s.redText : undefined}>{num(overdueTasks)}</dd></div>
              </dl>
              <p className={s.taskNote}>Across all projects, including unassigned tasks.</p>
            </div>
            <div className={s.projectList}>
              {currentProjects.length === 0 ? (
                <div className={s.empty}><NavIcon name="folder" /><h3>{projects.length ? "All projects completed" : "Make room for your next project"}</h3><p>{projects.length ? "Visit your projects to review completed work or start something new." : "Plan the work, assign tasks, and track progress together."}</p><Link href="/projects/list" className="btn btn--small">View projects</Link></div>
              ) : (
                <ul>{currentProjects.slice(0, 3).map((project) => {
                  const progress = project.tasks_total ? Math.round(project.tasks_done / project.tasks_total * 100) : 0;
                  return <li key={project.id}>
                    <Link href={`/projects/${project.id}`} className={s.projectRow}>
                      <div className={s.projectName}><strong>{project.name}</strong><span>{project.status}</span></div>
                      <div className={s.projectProgress}>
                        <span>{project.tasks_total ? `${num(project.tasks_done)} of ${num(project.tasks_total)} tasks` : "No tasks yet"}</span>
                        <div className={s.track} aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
                      </div>
                      <Chevron />
                    </Link>
                  </li>;
                })}</ul>
              )}
              {currentProjects.length > 0 && <Link href="/projects/list" className={s.allProjects}>View all projects <Chevron /></Link>}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function DepartmentIcon({ name }: { name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={s.departmentIcon} src={`/icons/${name}.png`} width={42} height={42} alt="" />;
}

function Chevron() {
  return <svg className={s.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;
}

function MovementIcon({ outgoing }: { outgoing?: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{outgoing ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M17 7 7 17M7 8v9h9" />}</svg>;
}
