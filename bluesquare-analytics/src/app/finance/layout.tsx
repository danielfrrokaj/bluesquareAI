import s from "./finance.module.css";

/** `modal` shows a transaction over the current Finance page when it's opened from a link (see @modal). */
export default function FinanceLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <div className={s.finance}>
      {children}
      {modal}
    </div>
  );
}
