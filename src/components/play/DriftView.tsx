import { drifts } from "@/lib/content";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";
import Drift from "./Drift";

const crumbs = [
  { name: "線上互動館", path: "/interactive" },
  { name: "漂流詞幸運籤", path: "/interactive/drift" },
];

export default function DriftView({ initialId }: { initialId?: string }) {
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero
        eyebrow="Drift Words"
        title="漂流詞幸運籤"
        summary={`漂流詞幸運籤是電影節的線上小儀式：
心裡想著一件事，抽一支籤，得到一句詩與今天的小指引。
共 ${drifts.length} 支，抽到的句子可以存成限時動態圖分享。`}
      />
      <section aria-label="抽籤" className="container-x">
        <Drift initialId={initialId} />
      </section>
    </>
  );
}
