#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "assets", "data", "news.json");
const outputJsPath = path.join(projectRoot, "assets", "data", "news.js");

const MAX_ITEMS = 18;
const MAX_ITEMS_PER_SOURCE = 12;
const MAX_ITEM_AGE_DAYS = 45;
const REQUEST_TIMEOUT_MS = 15000;
const USER_AGENT =
  "StrongTownsIndyNewsBot/2.0 (+https://strongtownsindy.org; non-commercial local-news aggregation)";

const SOURCES = [
  {
    id: "wfyi",
    name: "WFYI",
    priority: 20,
    alwaysLocal: false,
    feedUrls: ["https://www.wfyi.org/wfyi-news.rss"],
  },
  {
    id: "mirror-indy",
    name: "Mirror Indy",
    priority: 30,
    alwaysLocal: true,
    feedUrls: ["https://mirrorindy.org/feed/"],
  },
  {
    id: "indy-parks",
    name: "Indy Parks",
    priority: 10,
    alwaysLocal: true,
    feedUrls: ["https://parks.indy.gov/feed/"],
    forcedCategories: ["public-space"],
  },
];

const LOCAL_PATTERNS = [
  /\bindianapolis\b/i,
  /\bindy\b/i,
  /\bmarion county\b/i,
  /\bcity-county\b/i,
  /\bdecatur township\b/i,
  /\bcenter township\b/i,
  /\bperry township\b/i,
  /\bwayne township\b/i,
  /\bpike township\b/i,
  /\bwarren township\b/i,
  /\bfranklin township\b/i,
  /\bmonon\b/i,
  /\bmonon trail\b/i,
  /\bcultural trail\b/i,
  /\bwhite river\b/i,
  /\bindygo\b/i,
  /\bips\b/i,
  /\bmetropolitan development commission\b/i,
  /\bmdc\b/i,
  /\bsouthern split\b/i,
  /\brethink coalition\b/i,
  /\blugar plaza\b/i,
  /\bmilitary park\b/i,
  /\bbroad ripple\b/i,
  /\bfountain square\b/i,
  /\bmass ave\b/i,
  /\bbeech grove\b/i,
  /\bspeedway\b/i,
  /\blawrence\b/i,
  /\b16 tech\b/i,
  /\bnear eastside\b/i,
  /\bnear westside\b/i,
  /\bnear northside\b/i,
  /\bnorthwest side\b/i,
  /\bwest side\b/i,
  /\bwestsider\b/i,
  /\bwestsiders\b/i,
  /\beastside\b/i,
  /\beast side\b/i,
  /\bcanterbury park\b/i,
  /\bwish park\b/i,
  /\brobey park\b/i,
  /\bthompson park\b/i,
  /\barsenal park\b/i,
  /\b16th street bridge\b/i,
  /\bransburg ymca\b/i,
  /\bold city hall\b/i,
];

const CATEGORY_ORDER = [
  "urbanism",
  "mobility",
  "housing-care",
  "public-space",
  "community-action",
];

const CATEGORY_MIN_SCORE = 3;
const PLACE_BASED_CATEGORY_KEYS = new Set([
  "urbanism",
  "mobility",
  "housing-care",
  "public-space",
]);

const COMMUNITY_ACTION_STANDALONE_PATTERN =
  /\b(neighborhood|neighborhoods|community center|community centers|park|parks|public space|public spaces|housing|affordable|garden|gardens|tree|trees|trail|trails|street|streets|sidewalk|sidewalks|transit|bike|bikes|mobility|development|redevelopment|streetscape|placemaking|cleanup|clean-up|beautification|fundraiser|mutual aid|resource fair)\b/i;

const CATEGORY_SIGNALS = {
  urbanism: [
    {
      score: 3,
      pattern:
        /\b(urbanism|zoning|land use|redevelopment|streetscape|placemaking|mixed-use|public realm|data center|vacant lot|walkability)\b/i,
    },
    {
      score: 2,
      pattern:
        /\b(development|infill|corridor|revitalization|property|properties|campus|site|sites)\b/i,
    },
    {
      score: 1,
      pattern:
        /\b(purchase|purchases|purchasing|buy|buys|bought|sale|sold|acquisition|acquire|acquires|acquired)\b/i,
    },
  ],
  mobility: [
    {
      score: 3,
      pattern:
        /\b(transit|transportation|pedestrian|pedestrians|crosswalk|crosswalks|crossing|crossings|sidewalk|sidewalks|bike|bikes|bicycle|bicycles|bicyclist|bicyclists|indygo|bus|buses|road safety|vision zero|traffic calming|protected bike|greenway)\b/i,
    },
    {
      score: 2,
      pattern:
        /\b(mobility|intersection|intersections|bridge repair|bridge|highway|i-65|i-70|lane reduction|road diet)\b/i,
    },
    {
      score: 1,
      pattern: /\b(trail|trails)\b/i,
    },
  ],
  "housing-care": [
    {
      score: 3,
      pattern:
        /\b(housing|tenant|tenants|rent|renter|renters|rental|eviction|evictions|shelter|shelters|child care|day care|recovery home|homeless|homelessness|affordable|affordability|mental health|clinic|pantry|food insecurity|warming center|housing stability|supportive services|supportive housing|health fair|health screening|wellness)\b/i,
    },
    {
      score: 2,
      pattern:
        /\b(caregiving|caregiver|caregivers|health care|public health|behavioral health|resource fair|family services)\b/i,
    },
  ],
  "public-space": [
    {
      score: 3,
      pattern:
        /\b(park|parks|playground|playgrounds|plaza|plazas|public space|public spaces|green space|green spaces|garden|gardens|library|libraries|recreation|event lawn|riverwalk|reservoir|community center)\b/i,
    },
    {
      score: 2,
      pattern:
        /\b(greenway|trail|trails|monon|cultural trail|open street|open streets)\b/i,
    },
  ],
  "community-action": [
    {
      score: 3,
      pattern:
        /\b(neighborhood meeting|community meeting|public meeting|organizing|organizer|organizers|volunteer|volunteers|coalition|initiative|initiatives|community group|community groups|partnership|partnerships|board|boards|commission|commissions|city-county council|public comment|comment period)\b/i,
      },
    {
      score: 2,
      pattern:
        /\b(council|hearing|hearings|budget|budgets|ordinance|ordinances|policy|policies|proposal|proposals|approve|approves|approved|approval|approvals|funding|grant|grants|appointed|appointment|appointments)\b/i,
    },
  ],
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isNaN(code) ? _ : String.fromCodePoint(code);
    })
    .replace(/&#(\d+);/g, (_, num) => {
      const code = Number.parseInt(num, 10);
      return Number.isNaN(code) ? _ : String.fromCodePoint(code);
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|ul|ol|h[1-6]|figcaption|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, " ");
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeSummaryText(value) {
  return cleanText(
    stripHtml(decodeHtmlEntities(value))
      .replace(/\b[a-z-]+=(?:"[^"]*"|'[^']*'|\S+)/gi, " ")
      .replace(/"/g, " ")
      .replace(/\s*The post .*? appeared first on .*?\.?$/i, "")
      .replace(/\s*Read more\.?$/i, "")
  );
}

function truncateText(value, maxLength = 260) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "").trim()}...`;
}

function normalizeUrl(baseUrl, rawUrl) {
  if (!rawUrl) return "";
  try {
    const url = new URL(decodeHtmlEntities(rawUrl).trim(), baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.hash = "";
    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.toString();
  } catch {
    return "";
  }
}

function normalizeComparableUrl(value) {
  return normalizeUrl("https://example.org", value || "");
}

function normalizeThumbnailUrl(baseUrl, rawUrl) {
  const normalized = normalizeUrl(baseUrl, rawUrl);
  if (!normalized) return "";

  try {
    const url = new URL(normalized);

    // WFYI's Brightspot image transforms are currently returning a small
    // error placeholder image. When possible, use the original S3 asset URL
    // embedded in the `url` query param instead.
    if (
      url.hostname === "npr.brightspotcdn.com" &&
      url.pathname.includes("/dims4/default/") &&
      url.searchParams.has("url")
    ) {
      const original = url.searchParams.get("url") || "";
      const originalUrl = new URL(original);
      if (originalUrl.hostname === "npr-brightspot.s3.amazonaws.com") {
        originalUrl.protocol = "https:";
        return originalUrl.toString();
      }
    }
  } catch {
    return normalized;
  }

  return normalized;
}

function extractXmlTagRaw(xml, tagNames) {
  const names = Array.isArray(tagNames) ? tagNames : [tagNames];
  for (const tagName of names) {
    const pattern = new RegExp(
      `<${escapeRegex(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegex(tagName)}>`,
      "i"
    );
    const match = xml.match(pattern);
    if (match && match[1]) return match[1];
  }
  return "";
}

function extractXmlTagsRaw(xml, tagName) {
  const pattern = new RegExp(
    `<${escapeRegex(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegex(tagName)}>`,
    "gi"
  );
  return [...xml.matchAll(pattern)].map((match) => match[1] || "");
}

function extractXmlText(xml, tagNames) {
  return cleanText(stripHtml(decodeHtmlEntities(extractXmlTagRaw(xml, tagNames))));
}

function extractXmlTexts(xml, tagName) {
  return extractXmlTagsRaw(xml, tagName)
    .map((value) => cleanText(stripHtml(decodeHtmlEntities(value))))
    .filter(Boolean);
}

function extractXmlAttribute(xml, tagName, attributeName) {
  const pattern = new RegExp(
    `<${escapeRegex(tagName)}\\b[^>]*\\b${escapeRegex(attributeName)}=(["'])(.*?)\\1[^>]*\\/?>`,
    "i"
  );
  const match = xml.match(pattern);
  return match && match[2] ? decodeHtmlEntities(match[2]).trim() : "";
}

function extractFirstImageUrl(html, baseUrl) {
  const pattern = /<(?:img|source)\b[^>]*(?:src|data-orig-file|data-large-file)=(["'])(.*?)\1/i;
  const match = String(html || "").match(pattern);
  return match && match[2] ? normalizeUrl(baseUrl, match[2]) : "";
}

function htmlToParagraphs(html) {
  const normalized = String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|ul|ol|h[1-6]|blockquote|figcaption)>/gi, "\n");

  return normalized
    .split(/\n+/)
    .map((part) => sanitizeSummaryText(part))
    .filter(Boolean)
    .filter((part) => !/^the post\b/i.test(part));
}

function buildSummary(descriptionHtml, contentHtml) {
  const candidates = [
    ...htmlToParagraphs(contentHtml),
    ...htmlToParagraphs(descriptionHtml),
    sanitizeSummaryText(contentHtml),
    sanitizeSummaryText(descriptionHtml),
  ];

  const isUsableCandidate = (part) => {
    const text = cleanText(part);
    if (!text || text.length < 45) return false;
    if (/^the post\b/i.test(text)) return false;
    if (/\bdata-[a-z-]+=|\bsrcset=|\bfit=\d/i.test(text)) return false;
    return true;
  };

  const preferredCandidate = candidates.find((part) => {
    const text = cleanText(part);
    return isUsableCandidate(text) && (text.length >= 120 || /[.!?].+[.!?]/.test(text));
  });

  const fallbackCandidate = candidates.find(isUsableCandidate);

  return truncateText(preferredCandidate || fallbackCandidate || "");
}

function isRecentEnough(isoDate) {
  const parsed = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  const ageMs = Date.now() - parsed.getTime();
  return ageMs <= MAX_ITEM_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function parseFeedDate(itemXml) {
  const rawDate =
    extractXmlText(itemXml, ["pubDate", "atom:updated", "dc:date", "updated"]) || "";
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function classifyCategories({ title, summary, content, feedCategories, source }) {
  const segments = [
    { text: title, weight: 3 },
    { text: summary, weight: 1 },
    { text: (feedCategories || []).join(" "), weight: 2 },
  ];

  const scores = new Map();

  for (const category of CATEGORY_ORDER) {
    let total = 0;
    for (const segment of segments) {
      const text = cleanText(segment.text);
      if (!text) continue;

      for (const signal of CATEGORY_SIGNALS[category] || []) {
        if (signal.pattern.test(text)) {
          total += signal.score * segment.weight;
        }
      }
    }
    scores.set(category, total);
  }

  const ranked = [...scores.entries()]
    .filter(([, score]) => score >= CATEGORY_MIN_SCORE)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]);
    })
    .map(([category]) => category);

  const hasPlaceBasedCategory = ranked.some((category) =>
    PLACE_BASED_CATEGORY_KEYS.has(category)
  );

  if (
    ranked.includes("community-action") &&
    !hasPlaceBasedCategory &&
    !COMMUNITY_ACTION_STANDALONE_PATTERN.test(
      [title, summary, ...(feedCategories || [])].join(" ")
    )
  ) {
    const index = ranked.indexOf("community-action");
    ranked.splice(index, 1);
  }

  const merged = [...new Set([...(source.forcedCategories || []), ...ranked])];

  if (!merged.length && Array.isArray(source.forcedCategories)) {
    return [...source.forcedCategories];
  }

  return merged.slice(0, 2);
}

function isIndianapolisLocal({ title, summary, content, feedCategories, source }) {
  if (source.alwaysLocal) return true;

  const text = [title, summary, ...(feedCategories || [])].join(" ");
  return LOCAL_PATTERNS.some((pattern) => pattern.test(text));
}

function isLikelyArticleUrl(urlString) {
  if (!urlString) return false;

  try {
    const url = new URL(urlString);
    const pathname = url.pathname.toLowerCase();
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "";
    if (pathname === "/" || pathname.endsWith("/feed") || pathname.endsWith("/feed/")) return false;
    if (pathname.endsWith("/rss")) return false;
    if (lastSegment.length < 6) return false;
    return true;
  } catch {
    return false;
  }
}

function parseFeedItems(xml, source, feedUrl) {
  const itemBlocks = [...String(xml || "").matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(
    (match) => match[0]
  );

  return itemBlocks
    .map((itemXml) => {
      const title = extractXmlText(itemXml, "title");
      const link = normalizeUrl(
        feedUrl,
        extractXmlText(itemXml, "link") || extractXmlText(itemXml, "guid")
      );
      const date = parseFeedDate(itemXml);
      const author = extractXmlText(itemXml, [
        "dc:creator",
        "author",
        "itunes:author",
        "googleplay:author",
      ]);
      const descriptionHtml = extractXmlTagRaw(itemXml, [
        "description",
        "itunes:summary",
        "atom:summary",
      ]);
      const contentHtml = extractXmlTagRaw(itemXml, "content:encoded");
      const summary = buildSummary(descriptionHtml, contentHtml);
      const content = sanitizeSummaryText(contentHtml);
      const thumbnail =
        normalizeThumbnailUrl(feedUrl, extractXmlAttribute(itemXml, "media:content", "url")) ||
        normalizeThumbnailUrl(feedUrl, extractXmlAttribute(itemXml, "itunes:image", "href")) ||
        normalizeThumbnailUrl(feedUrl, extractFirstImageUrl(descriptionHtml, feedUrl)) ||
        normalizeThumbnailUrl(feedUrl, extractFirstImageUrl(contentHtml, feedUrl));
      const feedCategories = extractXmlTexts(itemXml, "category");

      if (!title || !link || !date || !summary || !isLikelyArticleUrl(link)) {
        return null;
      }

      if (!isRecentEnough(date)) {
        return null;
      }

      if (source.rejectAuthors?.some((pattern) => pattern.test(author))) {
        return null;
      }

      const categories = classifyCategories({
        title,
        summary,
        content,
        feedCategories,
        source,
      });

      if (!categories.length) {
        return null;
      }

      if (
        !isIndianapolisLocal({
          title,
          summary,
          content,
          feedCategories,
          source,
        })
      ) {
        return null;
      }

      return {
        id: `${source.id}-${slugify(title)}-${date}`,
        title,
        source: source.name,
        date,
        summary,
        categories,
        thumbnail,
        url: link,
        _priority: source.priority,
      };
    })
    .filter(Boolean);
}

function choosePreferredItem(existing, candidate) {
  if (!existing) return candidate;

  if ((candidate._priority || 0) !== (existing._priority || 0)) {
    return (candidate._priority || 0) > (existing._priority || 0) ? candidate : existing;
  }

  const existingDate = new Date(existing.date).getTime();
  const candidateDate = new Date(candidate.date).getTime();
  if (candidateDate !== existingDate) {
    return candidateDate > existingDate ? candidate : existing;
  }

  if ((candidate.summary || "").length !== (existing.summary || "").length) {
    return (candidate.summary || "").length > (existing.summary || "").length ? candidate : existing;
  }

  return existing;
}

function dedupeItems(items) {
  const byUrl = new Map();
  for (const item of items) {
    const key = normalizeComparableUrl(item.url);
    byUrl.set(key, choosePreferredItem(byUrl.get(key), item));
  }

  const byTitle = new Map();
  for (const item of byUrl.values()) {
    const key = slugify(item.title);
    byTitle.set(key, choosePreferredItem(byTitle.get(key), item));
  }

  return [...byTitle.values()];
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function collectSourceItems(source) {
  const items = [];

  for (const feedUrl of source.feedUrls) {
    try {
      const xml = await fetchText(feedUrl);
      const parsedItems = parseFeedItems(xml, source, feedUrl);
      console.log(`[${source.name}] parsed ${parsedItems.length} relevant items from ${feedUrl}`);
      items.push(...parsedItems);
    } catch (error) {
      console.warn(`[${source.name}] feed fetch failed: ${feedUrl} (${error.message})`);
    }
  }

  return dedupeItems(items)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_ITEMS_PER_SOURCE);
}

async function hasExistingFeed() {
  try {
    const raw = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function stripInternalFields(item) {
  return {
    id: item.id,
    title: item.title,
    source: item.source,
    date: item.date,
    summary: item.summary,
    categories: item.categories,
    thumbnail: item.thumbnail,
    url: item.url,
  };
}

function buildNewsScript(items) {
  return `globalThis.STRONG_TOWNS_NEWS_ITEMS = ${JSON.stringify(items, null, 2)};\n`;
}

async function run() {
  const collectedGroups = [];

  for (const source of SOURCES) {
    const items = await collectSourceItems(source);
    collectedGroups.push(items);
  }

  const freshItems = dedupeItems(collectedGroups.flat())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_ITEMS)
    .map(stripInternalFields);

  if (!freshItems.length) {
    if (await hasExistingFeed()) {
      console.warn("No fresh local articles matched the filters. Keeping the existing feed unchanged.");
      return;
    }

    throw new Error("No fresh local articles were fetched and no existing feed is available.");
  }

  await writeFile(outputPath, `${JSON.stringify(freshItems, null, 2)}\n`, "utf8");
  await writeFile(outputJsPath, buildNewsScript(freshItems), "utf8");

  const sourceCounts = freshItems.reduce((counts, item) => {
    counts[item.source] = (counts[item.source] || 0) + 1;
    return counts;
  }, {});

  console.log(`Saved ${freshItems.length} real local items to ${outputPath}`);
  console.log(`Saved JS fallback feed to ${outputJsPath}`);
  console.log(`Sources kept: ${JSON.stringify(sourceCounts)}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
