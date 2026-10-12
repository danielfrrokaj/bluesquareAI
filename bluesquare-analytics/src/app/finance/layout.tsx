/** `modal` shows a transaction over the current Finance page when it's opened from a link (see @modal). */
export default function FinanceLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
