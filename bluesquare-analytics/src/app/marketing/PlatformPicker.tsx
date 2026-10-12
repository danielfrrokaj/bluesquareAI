import { PLATFORMS, type Platform } from "@/lib/platforms";
import s from "./marketing.module.css";

const LIST = Object.entries(PLATFORMS) as [Platform, (typeof PLATFORMS)[Platform]][];

/** Toggle pills for the networks a post goes to (form field "platforms", repeated). */
export function PlatformPicker({ value = [], disabled }: { value?: readonly string[]; disabled?: boolean }) {
  return (
    <fieldset className={s.platforms} disabled={disabled}>
      <legend>Publish to</legend>
      {LIST.map(([key, { label, color }]) => (
        <label key={key}>
          <input type="checkbox" name="platforms" value={key} defaultChecked={value.includes(key)} />
          <span><i style={{ background: color }} />{label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function PlatformBadges({ value }: { value: readonly string[] }) {
  return (
    <span className={s.badges}>
      {LIST.filter(([key]) => value.includes(key)).map(([key, { label, short, color }]) => (
        <span key={key} className={s.badge} style={{ background: color }} title={label}>{short}</span>
      ))}
    </span>
  );
}
