/** `modal` shows a lead over the current Sales page when it's opened from a list (see @modal). */
export default function SalesLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
