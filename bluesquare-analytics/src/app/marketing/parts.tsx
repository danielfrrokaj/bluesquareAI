import { Modal } from "@/components/Modal";
import { ActionForm } from "@/components/ActionForm";
import type { Idea, Post } from "@/lib/marketing";
import { addIdea, removeIdea, removePost, savePost, toggleIdeaPin } from "./actions";
import { UploadForm } from "./UploadForm";
import { PlatformBadges, PlatformPicker } from "./PlatformPicker";
import s from "./marketing.module.css";

// Pieces shared by the Marketing tabs (Ideas & media, Publishing plan).

const TZ = () => process.env.REPORT_TIMEZONE || "Europe/Tirane";
export const localDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ() }).format(d); // YYYY-MM-DD
export const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
export const media = (id: string) => `/api/marketing/media/${id}`;

/** "Upload media" button; the publish time defaults to the given day (or tomorrow) at 10:00. */
export function UploadButton({ day }: { day?: string }) {
  return (
    <Modal trigger="Upload media" title="Upload an image or video">
      <UploadForm defaultPublish={`${day ?? addDays(localDay(new Date()), 1)}T10:00`} />
    </Modal>
  );
}

export function NewIdeaButton() {
  return (
    <Modal trigger="New idea" title="New idea" triggerClassName="btn btn--primary btn--small">
      <ActionForm action={addIdea} submit="Add idea" className={`form ${s.modalform}`}>
        <label className="field">
          <span>Idea</span>
          <textarea name="body" rows={4} maxLength={1000} placeholder="e.g. Reel: a day at the hotel, behind the scenes" required autoFocus />
        </label>
        <div className={s.addidea__row}>
          <span className={s.swatches} role="radiogroup" aria-label="Note colour">
            {(["yellow", "blue", "green", "pink"] as const).map((c, i) => (
              <label key={c} title={c}>
                <input type="radio" name="color" value={c} defaultChecked={i === 0} aria-label={c} />
                <i className={s[c]} />
              </label>
            ))}
          </span>
          <label className="check"><input type="checkbox" name="pinned" /> Pin to top</label>
        </div>
      </ActionForm>
    </Modal>
  );
}

/** A post as a calendar chip or gallery card that opens its details. */
export function PostChip({ post: p, canDelete }: { post: Post; canDelete: boolean }) {
  return (
    <Modal title={p.title || p.original_name} triggerClassName={s.chip}
      trigger={
        <>
          {p.kind === "image"
            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={media(p.id)} alt="" loading="lazy" />
            : <video src={`${media(p.id)}#t=0.1`} preload="metadata" muted playsInline />}
          <span><b>{p.publish_local?.slice(11)}</b> {p.title || p.original_name}</span>
        </>
      }>
      <PostDetail post={p} canDelete={canDelete} />
    </Modal>
  );
}

export function PostCard({ post: p, canDelete }: { post: Post; canDelete: boolean }) {
  return (
    <Modal title={p.title || p.original_name} triggerClassName={s.card} trigger={<Card post={p} />}>
      <PostDetail post={p} canDelete={canDelete} />
    </Modal>
  );
}

export function Note({ idea, canDelete }: { idea: Idea; canDelete: boolean }) {
  return (
    <li className={`${s.note} ${s[idea.color]}${idea.pinned ? ` ${s.pinned}` : ""}`}>
      <p>{idea.body}</p>
      <footer>
        <span>{idea.author ?? "—"} · {idea.created_at}</span>
        <form action={toggleIdeaPin}>
          <input type="hidden" name="id" value={idea.id} />
          <input type="hidden" name="pinned" value={idea.pinned ? "0" : "1"} />
          <button className={s.iconbtn} title={idea.pinned ? "Unpin" : "Pin to top"} aria-label={idea.pinned ? "Unpin" : "Pin to top"}>
            {idea.pinned ? "↓" : "📌"}
          </button>
        </form>
        {canDelete && (
          <form action={removeIdea}>
            <input type="hidden" name="id" value={idea.id} />
            <button className={s.iconbtn} title="Delete" aria-label="Delete idea">✕</button>
          </form>
        )}
      </footer>
    </li>
  );
}

export function Card({ post: p }: { post: Post }) {
  return (
    <>
      <div className={s.thumb}>
        {p.kind === "image"
          ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={media(p.id)} alt="" loading="lazy" />
          : <video src={`${media(p.id)}#t=0.1`} preload="metadata" muted playsInline />}
        {p.kind === "video" && <span className={s.play}><i>▶</i></span>}
        <span className={`${s.when}${p.publish_label ? "" : ` ${s["when--none"]}`}`}>{p.publish_label ?? "Not scheduled"}</span>
      </div>
      <div className={s.cardbody}>
        <strong>{p.title || p.original_name}</strong>
        <PlatformBadges value={p.platforms} />
        <small>{p.kind === "video" ? "Video" : "Image"} · {(p.size / 1024 / 1024).toFixed(1)} MB{p.author ? ` · ${p.author}` : ""}</small>
      </div>
    </>
  );
}

export function PostDetail({ post: p, canDelete }: { post: Post; canDelete: boolean }) {
  return (
    <>
      <div className={s.viewer}>
        {p.kind === "image"
          ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={media(p.id)} alt={p.title} />
          : <video src={media(p.id)} controls playsInline preload="metadata" />}
      </div>
      <p className="muted">
        {p.original_name} · {(p.size / 1024 / 1024).toFixed(1)} MB · <a href={media(p.id)} download={p.original_name}>Download</a>
      </p>
      <ActionForm action={savePost} submit="Save" className={`form ${s.modalform}`}>
        <input type="hidden" name="id" value={p.id} />
        <label className="field"><span>Title</span><input name="title" defaultValue={p.title} maxLength={120} /></label>
        <label className="field"><span>Caption</span><textarea name="caption" rows={3} defaultValue={p.caption} maxLength={2200} /></label>
        <label className="field"><span>Publish on</span><input type="datetime-local" name="publish" defaultValue={p.publish_local ?? ""} /></label>
        <PlatformPicker value={p.platforms} />
      </ActionForm>
      {canDelete && (
        <div className="danger">
          <ActionForm action={removePost} submit="Delete" pending="Deleting…" danger className="form form--row">
            <input type="hidden" name="id" value={p.id} />
            <span className="muted">Removes the file for everyone.</span>
          </ActionForm>
        </div>
      )}
    </>
  );
}
