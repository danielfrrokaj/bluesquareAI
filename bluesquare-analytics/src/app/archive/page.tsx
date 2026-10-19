import Link from "next/link";
import { isAdmin, requireArchiveTab } from "@/lib/auth";
import { deleteFileRow, folderCounts, listFiles, staleFileUploads, type ArchiveFile } from "@/lib/archive";
import { removeMedia } from "@/lib/media-store";
import { Shell } from "@/components/Shell";
import { archiveNav } from "@/components/nav";
import { Modal } from "@/components/Modal";
import { ActionForm } from "@/components/ActionForm";
import { removeFile, saveFile } from "./actions";
import { FileUploader } from "./FileUploader";
import s from "./archive.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Archive" };

const mb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
const url = (id: string, download = false) => `/api/archive/files/${id}${download ? "?download" : ""}`;

/** Badge for a file type: a short label and a colour family. */
function kindOf(f: ArchiveFile): { label: string; tone: string } {
  const ext = f.name.match(/\.([a-z0-9]{1,6})$/i)?.[1]?.toUpperCase() ?? "";
  if (f.mime.startsWith("image/")) return { label: ext || "IMG", tone: "img" };
  if (f.mime.startsWith("video/")) return { label: ext || "VID", tone: "vid" };
  if (f.mime === "application/pdf") return { label: "PDF", tone: "pdf" };
  if (/sheet|excel|csv/.test(f.mime) || /^(XLSX?|CSV|ODS)$/.test(ext)) return { label: ext || "XLS", tone: "xls" };
  if (/word|document|rtf/.test(f.mime) || /^(DOCX?|ODT|RTF)$/.test(ext)) return { label: ext || "DOC", tone: "doc" };
  if (/zip|compressed|tar|rar|7z/.test(f.mime) || /^(ZIP|RAR|7Z|GZ|TAR)$/.test(ext)) return { label: ext || "ZIP", tone: "zip" };
  return { label: ext || "FILE", tone: "other" };
}

type SP = { folder?: string; q?: string };

export default async function ArchiveFiles({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireArchiveTab("files");
  const sp = await searchParams;
  const folder = typeof sp.folder === "string" ? sp.folder : null;
  const q = (sp.q ?? "").trim().slice(0, 100);

  for (const f of await staleFileUploads()) await removeMedia(f.media_key).then(() => deleteFileRow(f.id), () => {});
  const [files, folders] = await Promise.all([listFiles(folder, q), folderCounts()]);
  const total = folders.reduce((n, f) => n + f.count, 0);
  const href = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ folder: folder ?? undefined, q: q || undefined, ...patch }).filter(([, v]) => v !== undefined) as [string, string][]);
    return `/archive${p.size ? `?${p}` : ""}`;
  };

  return (
    <Shell department="archive" subnav={archiveNav("files", user)}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <h1>Files</h1>
            <p className="muted">{total} {total === 1 ? "file" : "files"} · contracts, invoices, designs, backups… anything the team needs to keep.</p>
          </div>
          <Modal trigger="Upload files" title="Upload files">
            <FileUploader folders={folders.map((f) => f.folder).filter(Boolean)} folder={folder ?? ""} />
          </Modal>
        </div>

        <div className={s.layout}>
          <nav className={s.folders} aria-label="Folders">
            <Link href={href({ folder: undefined })} aria-current={folder === null ? "page" : undefined}><span>All files</span><b>{total}</b></Link>
            {folders.map((f) => (
              <Link key={f.folder} href={href({ folder: f.folder })} aria-current={folder === f.folder ? "page" : undefined} title={f.folder || "No folder"}>
                <span>📁 {f.folder ? f.folder.split("/").join(" › ") : "No folder"}</span><b>{f.count}</b>
              </Link>
            ))}
          </nav>

          <section className={s.main}>
            <form action="/archive" className={s.search}>
              {folder !== null && <input type="hidden" name="folder" value={folder} />}
              <input name="q" defaultValue={q} placeholder={folder ? `Search in ${folder || "No folder"}…` : "Search files, notes, folders…"} aria-label="Search files" />
              <button className="btn btn--small">Search</button>
              {q && <Link href={href({ q: undefined })} className={s.clear}>Clear</Link>}
            </form>

            {files.length === 0 ? (
              <p className="empty empty--big">{q ? "No files match your search." : "No files here yet. Use “Upload files” to add some."}</p>
            ) : (
              <ul className={s.files}>
                {files.map((f) => {
                  const k = kindOf(f);
                  const canDelete = isAdmin(user) || f.created_by === user.id;
                  return (
                    <li key={f.id} className={s.file}>
                      {/* Thumbnails only for raster images: SVGs are served as downloads (they can carry script). */}
                      {/^image\/(png|jpe?g|gif|webp|avif)$/.test(f.mime) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={s.thumb} src={url(f.id)} alt="" loading="lazy" />
                      ) : (
                        <span className={`${s.badge} ${s[`t_${k.tone}`]}`}>{k.label}</span>
                      )}
                      <div className={s.fileinfo}>
                        <a href={url(f.id)} target="_blank" rel="noopener" className={s.filename}>{f.name}</a>
                        <small>
                          {mb(f.size)} · {f.created_at}{f.author ? ` · ${f.author}` : ""}
                          {folder === null && f.folder && <> · 📁 {f.folder}</>}
                        </small>
                        {f.note && <small className={s.filenote}>{f.note}</small>}
                      </div>
                      <span className={s.fileactions}>
                        <a href={url(f.id, true)} className="btn btn--small" download>Download</a>
                        <Modal trigger="Edit" title={f.name} triggerClassName="btn btn--small">
                          <ActionForm action={saveFile} submit="Save" className="form">
                            <input type="hidden" name="id" value={f.id} />
                            <label className="field"><span>Name</span><input name="name" defaultValue={f.name} required maxLength={200} /></label>
                            <label className="field">
                              <span>Folder</span>
                              <input name="folder" defaultValue={f.folder} list={`folders-${f.id}`} placeholder="e.g. Contracts/2026" />
                              <datalist id={`folders-${f.id}`}>{folders.filter((x) => x.folder).map((x) => <option key={x.folder} value={x.folder} />)}</datalist>
                            </label>
                            <label className="field"><span>Note</span><input name="note" defaultValue={f.note} maxLength={1000} /></label>
                          </ActionForm>
                          {canDelete && (
                            <div className="danger">
                              <ActionForm action={removeFile} submit="Delete file" pending="Deleting…" danger className="form form--row">
                                <input type="hidden" name="id" value={f.id} />
                                <span className="muted">Removes it for everyone.</span>
                              </ActionForm>
                            </div>
                          )}
                        </Modal>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}
