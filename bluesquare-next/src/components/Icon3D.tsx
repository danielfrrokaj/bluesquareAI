import Image from "next/image";
import type { IconName } from "@/content/data";

type Props = { name: IconName; size?: number; className?: string; priority?: boolean };

/** One of the 3D brand icons in /public/icons (320×320 transparent PNG). */
export function Icon3D({ name, size = 64, className, priority }: Props) {
  return (
    <Image
      src={`/icons/${name}.png`}
      alt=""
      width={size}
      height={size}
      className={className}
      priority={priority}
      sizes={`${size}px`}
    />
  );
}
