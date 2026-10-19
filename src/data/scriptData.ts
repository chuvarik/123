export interface BeatItem {
  id: string;
  timeRange: string;
  startSec: number;
  endSec: number;
  narration: string;
  wordCount: number;
  subtitleLines: [string, string];
  koreanTerms: { term: string; romanization: string; meaning: string }[];
  visualDirection: string;
  onScreenGraphics: string;
  soundDesign: string;
  imagePath: string;
}

export interface CulturalInsight {
  title: string;
  korean: string;
  romanization: string;
  summary: string;
  details: string;
}

export const OFFICIAL_BEATS: BeatItem[] = [
  {
    id: "beat-1",
    timeRange: "0–5s",
    startSec: 0,
    endSec: 5,
    narration: "In Korea, everyone drinks “아이스 아메리카노”—that’s Iced Americano! It’s so refreshing.",
    wordCount: 11,
    subtitleLines: [
      "In Korea, everyone drinks “아이스 아메리카노”—",
      "that’s Iced Americano! It’s so refreshing."
    ],
    koreanTerms: [
      {
        term: "아이스 아메리카노",
        romanization: "A-i-seu A-me-ri-ka-no",
        meaning: "Iced Americano (often affectionately nicknamed 'Ah-Ah' / 아아)"
      }
    ],
    visualDirection: "Macro close-up of a condensation-covered clear plastic cup. Ice cubes rattle crisply as a barista pulls dark espresso over filtered water and ice.",
    onScreenGraphics: "Text pop: “아이스 아메리카노” (Iced Americano) with ice cube icon",
    soundDesign: "Crisp ice clinking in cup, espresso machine hiss, bright energetic pop sound",
    imagePath: "/src/assets/images/korean_iced_americano_cup_1792390266384.jpg"
  },
  {
    id: "beat-2",
    timeRange: "5–10s",
    startSec: 5,
    endSec: 10,
    narration: "You’ll find it everywhere, and it’s super affordable with low calories.",
    wordCount: 11,
    subtitleLines: [
      "You’ll find it everywhere,",
      "and it’s super affordable with low calories."
    ],
    koreanTerms: [
      {
        term: "가성비",
        romanization: "Ga-seong-bi",
        meaning: "Cost-performance / great value (budget mega-cafés on every street corner)"
      }
    ],
    visualDirection: "Fast-paced montage of Seoul street corners, office workers walking with take-out cups, and touch-screen order kiosks in budget coffee franchises.",
    onScreenGraphics: "Fast floating tags: 0 CALORIES · ~2,000 KRW (~$1.50) · ON EVERY CORNER",
    soundDesign: "Bustling Seoul street ambiance, quick camera whip whoosh, coin/cash register chime",
    imagePath: "/src/assets/images/seoul_cafe_street_takeaway_1792390266683.jpg"
  },
  {
    id: "beat-3",
    timeRange: "10–15s",
    startSec: 10,
    endSec: 15,
    narration: "That’s why Koreans sip it all year round—even in winter!",
    wordCount: 10,
    subtitleLines: [
      "That’s why Koreans sip it",
      "all year round—even in winter!"
    ],
    koreanTerms: [
      {
        term: "얼죽아",
        romanization: "Eol-juk-ah",
        meaning: "Short for '얼어 죽어도 아이스 아메리카노' (Even if I freeze to death, Iced Americano!)"
      }
    ],
    visualDirection: "A person in a winter puffer coat and knit mittens happily clutching a frosty iced cup outdoors against a cool Seoul winter backdrop.",
    onScreenGraphics: "Large animated text stamp: 얼죽아 (Eoljukah) // Winter or Summer, Always Iced!",
    soundDesign: "Subtle winter wind whistle fading into a cheerful concluding sip sound with straw slurping",
    imagePath: "/src/assets/images/eoljukah_winter_coffee_1792390266929.jpg"
  }
];

export const CULTURAL_INSIGHTS: CulturalInsight[] = [
  {
    title: "The 'Eoljukah' Phenomenon",
    korean: "얼죽아",
    romanization: "Eol-juk-ah",
    summary: "Even if I freeze to death, Iced Americano!",
    details: "In Korea, winter temperatures frequently drop well below freezing, yet Iced Americano sales remain massive. The national mantra 'Eol-juk-ah' captures the unshakeable cultural dedication to cold coffee regardless of blizzards or sub-zero weather."
  },
  {
    title: "The Nickname 'Ah-Ah'",
    korean: "아아",
    romanization: "Ah-Ah",
    summary: "The universal two-syllable shorthand",
    details: "When ordering at any Korean cafe, asking for an 'Ah-Ah' (아아) is instantly understood. Its hot counterpart is 'Tta-Ah' (따아 - 따뜻한 아메리카노)."
  },
  {
    title: "Ppalli-Ppalli (Hurry-Hurry) Culture",
    korean: "빨리빨리",
    romanization: "Ppalli-Ppalli",
    summary: "Immediate drinkability for fast-paced lives",
    details: "Hot coffee requires waiting and careful sipping to avoid burning your tongue. An iced americano can be immediately drank or chugged through a straw, matching Korea's efficient, fast-moving daily rhythm."
  },
  {
    title: "Post-Lunch K-Office Ritual",
    korean: "식후 커피",
    romanization: "Sik-hu Keo-pi",
    summary: "Clean palate cleanser and midday reset",
    details: "Korean meals often feature bold, savory, fermented, or spicy dishes like kimchi-jjigae. A cold, bitter, calorie-free iced black coffee acts as the ultimate palate cleanser and afternoon productivity booster."
  }
];

export const CONSTRAINT_CHECKLIST = [
  {
    id: "beats",
    label: "3 Beats (0–5s, 5–10s, 10–15s)",
    description: "Strict 15-second duration divided into three equal 5-second narrative chunks.",
    verified: true
  },
  {
    id: "words",
    label: "Maximum 12 Words Per Beat",
    description: "Beat 1: 11 words · Beat 2: 11 words · Beat 3: 10 words (All strictly under 12).",
    verified: true
  },
  {
    id: "subtitles",
    label: "Max 2 Lines Per Subtitle Card",
    description: "Every beat subtitle is split into exactly 2 clean, high-retention video lines.",
    verified: true
  },
  {
    id: "contractions",
    label: "Friendly, Spoken English & Contractions",
    description: "Uses natural spoken phrasing with contractions: “that’s”, “It’s”, “You’ll”, “That’s”.",
    verified: true
  },
  {
    id: "refreshing",
    label: "Mentions Refreshing Taste",
    description: "Explicitly highlighted in Beat 1: “It’s so refreshing.”",
    verified: true
  },
  {
    id: "calories",
    label: "Mentions Low Calories",
    description: "Explicitly highlighted in Beat 2: “with low calories.”",
    verified: true
  },
  {
    id: "price",
    label: "Mentions Affordable Price",
    description: "Explicitly highlighted in Beat 2: “super affordable.”",
    verified: true
  },
  {
    id: "availability",
    label: "Mentions Wide Availability",
    description: "Explicitly highlighted in Beat 2: “You’ll find it everywhere.”",
    verified: true
  },
  {
    id: "korean_expr",
    label: "Includes “아이스 아메리카노” With Short Explanation",
    description: "Explicitly introduced in Beat 1: “everyone drinks “아이스 아메리카노”—that’s Iced Americano!”",
    verified: true
  },
  {
    id: "no_fake_facts",
    label: "Factual Authenticity (No Invented Stats)",
    description: "All cultural reasons and beverage traits reflect authentic Korean coffee life without fabricated percentages.",
    verified: true
  }
];
