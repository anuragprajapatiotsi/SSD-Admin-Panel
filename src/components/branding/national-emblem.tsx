import type { ImgHTMLAttributes } from "react";

import nationalEmblemUrl from "@/assets/government-logo/national-emblem.svg";

type NationalEmblemProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;

export function NationalEmblem({ alt = "National Emblem of India", ...props }: NationalEmblemProps) {
  return <img src={nationalEmblemUrl} alt={alt} {...props} />;
}
