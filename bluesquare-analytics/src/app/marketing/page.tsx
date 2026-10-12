import { isAdmin, requireAuth } from "@/lib/auth";
import { deletePostRow, listIdeas, listPosts, staleUploads } from "@/lib/marketing";
import { removeMedia } from "@/lib/media-store";
import { Shell } from "@/components/Shell";
import { marketingNav } from "@/components/nav";
import { NewIdeaButton, Note, PostCard, UploadButton } from "./parts";
import s from "./marketing.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketing & Ads" };

export default async function MarketingPage() {
  const user = await requireAuth();
  const canDelete = (createdBy: string | null) => isAdmin(user) || createdBy === user.id;

  // Uploads abandoned for a day are cleaned up in passing.
  for (const p of await staleUploads()) await removeMedia(p.media_key).then(() => deletePostRow(p.id), () => {});

  const [ideas, posts] = await Promise.all([listIdeas(), listPosts()]);

  return (
    <Shell department="marketing" subnav={marketingNav("ideas")}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <h1>Ideas &amp; media</h1>
            <p className="muted">Pin ideas, collect images and videos, and plan where they go.</p>
          </div>
          <UploadButton />
        </div>

        <section className="panel">
          <header className="panel__head">
            <div>
              <h2>Ideas</h2>
              <p className="muted panel__sub">Pinned notes stay on top</p>
            </div>
            <NewIdeaButton />
          </header>
          {ideas.length === 0 ? (
            <p className="empty">No ideas yet. Use “New idea” to add the first one.</p>
          ) : (
            <ul className={s.ideas}>
              {ideas.map((i) => <Note key={i.id} idea={i} canDelete={canDelete(i.created_by)} />)}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel__head">
            <div>
              <h2>Media</h2>
              <p className="muted panel__sub">
                {posts.length} {posts.length === 1 ? "file" : "files"} · {posts.filter((p) => !p.publish_at).length} not scheduled
              </p>
            </div>
          </header>
          {posts.length === 0 ? (
            <p className="empty">No media yet. Use “Upload media” to add images and videos.</p>
          ) : (
            <ul className={s.gallery}>
              {posts.map((p) => <li key={p.id}><PostCard post={p} canDelete={canDelete(p.created_by)} /></li>)}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}
