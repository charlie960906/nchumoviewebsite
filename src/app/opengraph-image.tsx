import { ogImage } from "@/lib/og";
import { site } from "@/lib/site";
import { THEME } from "@/lib/theme";

export const dynamic = "force-static";
export const alt = site.fullName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({ kicker: "2027 中興星空電影節", lines: [THEME], footnote: site.tagline });
}
