import { abs, site } from "./site";
import { faqs } from "./content";
import { iso, sessions, type Session } from "./schedule";
import type { Program } from "./programs";
import type { Staff } from "./staff";

const place = {
  "@type": "Place",
  name: site.venue.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: "興大路 145 號",
    addressLocality: site.venue.locality,
    addressRegion: site.venue.region,
    postalCode: site.venue.postalCode,
    addressCountry: site.venue.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: site.venue.lat, longitude: site.venue.lng },
};

const organizer = {
  "@type": "Organization",
  name: site.organizers[0].name,
  url: site.organizers[0].url,
};

const offer = {
  "@type": "Offer",
  price: "0",
  priceCurrency: "TWD",
  availability: "https://schema.org/InStock",
  url: site.luma.url,
  validFrom: "2026-11-13T00:00:00+08:00",
};

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.organizers[0].name,
  alternateName: site.organizers[0].nameEn,
  url: site.organizers[0].url,
  logo: abs(site.organizers[0].logo),
  parentOrganization: { "@type": "CollegeOrUniversity", name: site.venue.name, url: "https://www.nchu.edu.tw/" },
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.fullName,
  alternateName: [site.shortName, site.nameEn],
  url: abs("/"),
  inLanguage: "zh-Hant-TW",
};

export function sessionLd(s: Session) {
  return {
    "@type": "Event",
    name: s.title,
    startDate: iso(s.day, s.start),
    endDate: iso(s.day, s.end),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: place,
    ...(s.tentative ? { description: "場次內容與時間待定，請以官網最新公告為準。" } : {}),
  };
}

export const festivalLd = {
  "@context": "https://schema.org",
  "@type": "Festival",
  "@id": abs("/#festival"),
  name: site.fullName,
  alternateName: [site.shortName, "中興星光電影節", site.nameEn],
  description: site.description,
  startDate: site.start,
  endDate: site.end,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  isAccessibleForFree: true,
  inLanguage: "zh-Hant-TW",
  url: abs("/"),
  image: [abs("/opengraph-image")],
  location: place,
  organizer,
  offers: offer,
  // 待定場次（電影演講會）確定前不列入子活動，避免搜尋引擎引用未定資訊
  subEvent: sessions.filter((s) => !s.tentative && s.category !== "closing").map(sessionLd),
};

export const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function programLd(p: Program) {
  const ss = sessions.filter((s) => p.sessionIds.includes(s.id));
  if (!ss.length || p.tentative) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: p.title,
      description: p.summary,
      url: abs(`/program/${p.slug}`),
      isPartOf: { "@id": abs("/#festival") },
    };
  }
  const events = ss.map((s) => ({
    "@context": "https://schema.org",
    "@type": p.kind === "film" ? "ScreeningEvent" : "Event",
    name: p.kind === "film" ? `《${p.title}》星空放映` : p.title,
    description: p.summary,
    startDate: iso(s.day, s.start),
    endDate: iso(s.day, s.end),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    url: abs(`/program/${p.slug}`),
    image: [abs("/opengraph-image")],
    location: place,
    organizer,
    offers: offer,
    superEvent: { "@id": abs("/#festival") },
    ...(p.kind === "film"
      ? {
          workPresented: {
            "@type": "Movie",
            name: p.title,
            alternateName: p.titleEn,
            director: { "@type": "Person", name: p.facts.find((f) => f.label === "導演")?.value },
          },
        }
      : {}),
  }));
  return events.length === 1 ? events[0] : events;
}

export function staffLd(s: Staff) {
  const url = abs(`/interactive/echoes/${s.id}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: s.storyTitle,
      author: { "@type": "Person", name: s.name, jobTitle: s.role },
      articleBody: s.storyContent.replace(/\*\*/g, ""),
      inLanguage: "zh-Hant-TW",
      url,
      mainEntityOfPage: url,
      publisher: organizer,
      isPartOf: { "@type": "CreativeWorkSeries", name: "波紋的音像 Echoes of Home" },
    },
    {
      "@context": "https://schema.org",
      "@type": "MusicRecording",
      name: s.songTitle,
      byArtist: { "@type": "MusicGroup", name: s.songArtist },
      ...(s.externalUrl ? { url: s.externalUrl } : {}),
    },
  ];
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "首頁", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}
