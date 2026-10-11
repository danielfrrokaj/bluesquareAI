export function SectionHead({
  title,
  lead,
  center = false,
  id,
}: {
  title: string;
  lead?: string;
  center?: boolean;
  id?: string;
}) {
  return (
    <div className={`section-head${center ? " section-head--center" : ""}`}>
      <h2 id={id}>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}
