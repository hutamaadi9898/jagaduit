import {
  siBata,
  siBlibli,
  siBukalapak,
  siGojek,
  siGrab,
  siKfc,
  siMcdonalds,
  siPaypal,
  siShopee,
  siStarbucks,
  siTiktok,
  siUber,
  siXendit
} from "simple-icons";

import type { TransactionWithRelations } from "@/types/app";

type MerchantIcon = {
  path: string;
  title: string;
  hex: string;
};

export type MerchantBrand = {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  accent: string;
  foreground: string;
  surface: string;
  monogram: string;
  icon?: MerchantIcon;
};

export type ResolvedMerchantBrand = MerchantBrand & {
  label: string;
  matchSource: "brand" | "fallback";
};

const COMMON_MERCHANTS: MerchantBrand[] = [
  {
    id: "shopeepay",
    name: "ShopeePay",
    category: "wallet",
    aliases: ["shopeepay", "shopee pay", "spaylater"],
    accent: "#EE4D2D",
    foreground: "#EE4D2D",
    surface: "linear-gradient(135deg, rgba(238,77,45,0.2), rgba(238,77,45,0.06))",
    monogram: "SP",
    icon: siShopee
  },
  {
    id: "shopee",
    name: "Shopee",
    category: "commerce",
    aliases: ["shopee", "shp", "sopi"],
    accent: "#EE4D2D",
    foreground: "#EE4D2D",
    surface: "linear-gradient(135deg, rgba(238,77,45,0.2), rgba(238,77,45,0.06))",
    monogram: "S",
    icon: siShopee
  },
  {
    id: "gopay",
    name: "GoPay",
    category: "wallet",
    aliases: ["gopay", "go pay", "gopaylater"],
    accent: "#00AED6",
    foreground: "#00AED6",
    surface: "linear-gradient(135deg, rgba(0,174,214,0.24), rgba(0,174,214,0.06))",
    monogram: "GP",
    icon: siGojek
  },
  {
    id: "gojek",
    name: "Gojek",
    category: "mobility",
    aliases: ["gojek", "goride", "gosend", "gotransit"],
    accent: "#00AA13",
    foreground: "#00AA13",
    surface: "linear-gradient(135deg, rgba(0,170,19,0.22), rgba(0,170,19,0.06))",
    monogram: "G",
    icon: siGojek
  },
  {
    id: "gofood",
    name: "GoFood",
    category: "food",
    aliases: ["gofood", "go food"],
    accent: "#EA4335",
    foreground: "#EA4335",
    surface: "linear-gradient(135deg, rgba(234,67,53,0.22), rgba(234,67,53,0.06))",
    monogram: "GF",
    icon: siGojek
  },
  {
    id: "grab",
    name: "Grab",
    category: "mobility",
    aliases: ["grab", "grabcar", "grab bike", "grabexpress"],
    accent: "#00B14F",
    foreground: "#00B14F",
    surface: "linear-gradient(135deg, rgba(0,177,79,0.24), rgba(0,177,79,0.06))",
    monogram: "G",
    icon: siGrab
  },
  {
    id: "grabfood",
    name: "GrabFood",
    category: "food",
    aliases: ["grabfood", "grab food"],
    accent: "#00B14F",
    foreground: "#00B14F",
    surface: "linear-gradient(135deg, rgba(0,177,79,0.24), rgba(0,177,79,0.06))",
    monogram: "GF",
    icon: siGrab
  },
  {
    id: "dana",
    name: "DANA",
    category: "wallet",
    aliases: ["dana", "saldo dana"],
    accent: "#108EE9",
    foreground: "#108EE9",
    surface: "linear-gradient(135deg, rgba(16,142,233,0.24), rgba(16,142,233,0.06))",
    monogram: "D"
  },
  {
    id: "ovo",
    name: "OVO",
    category: "wallet",
    aliases: ["ovo", "ovo cash", "ovo points"],
    accent: "#4C3494",
    foreground: "#7A5CE0",
    surface: "linear-gradient(135deg, rgba(122,92,224,0.24), rgba(122,92,224,0.06))",
    monogram: "O"
  },
  {
    id: "tokopedia",
    name: "Tokopedia",
    category: "commerce",
    aliases: ["tokopedia", "tokped", "toped"],
    accent: "#42B549",
    foreground: "#42B549",
    surface: "linear-gradient(135deg, rgba(66,181,73,0.22), rgba(66,181,73,0.06))",
    monogram: "T"
  },
  {
    id: "tiktok-shop",
    name: "TikTok Shop",
    category: "commerce",
    aliases: ["tiktok shop", "tiktokshop", "shop tokopedia", "shop by tokopedia"],
    accent: "#000000",
    foreground: "#FFFFFF",
    surface: "linear-gradient(135deg, rgba(17,17,17,0.84), rgba(39,39,42,0.58))",
    monogram: "TT",
    icon: siTiktok
  },
  {
    id: "traveloka",
    name: "Traveloka",
    category: "travel",
    aliases: ["traveloka", "xperience", "traveloka eats"],
    accent: "#2D9CDB",
    foreground: "#2D9CDB",
    surface: "linear-gradient(135deg, rgba(45,156,219,0.22), rgba(45,156,219,0.06))",
    monogram: "T"
  },
  {
    id: "blibli",
    name: "Blibli",
    category: "commerce",
    aliases: ["blibli"],
    accent: "#0095DA",
    foreground: "#0095DA",
    surface: "linear-gradient(135deg, rgba(0,149,218,0.22), rgba(0,149,218,0.06))",
    monogram: "B",
    icon: siBlibli
  },
  {
    id: "bukalapak",
    name: "Bukalapak",
    category: "commerce",
    aliases: ["bukalapak", "bl"],
    accent: "#E31E52",
    foreground: "#E31E52",
    surface: "linear-gradient(135deg, rgba(227,30,82,0.2), rgba(227,30,82,0.06))",
    monogram: "BL",
    icon: siBukalapak
  },
  {
    id: "starbucks",
    name: "Starbucks",
    category: "beverage",
    aliases: ["starbucks", "sbux"],
    accent: "#006241",
    foreground: "#006241",
    surface: "linear-gradient(135deg, rgba(0,98,65,0.22), rgba(0,98,65,0.06))",
    monogram: "SB",
    icon: siStarbucks
  },
  {
    id: "kopi-kenangan",
    name: "Kopi Kenangan",
    category: "beverage",
    aliases: ["kopi kenangan", "kenangan"],
    accent: "#8A5A44",
    foreground: "#8A5A44",
    surface: "linear-gradient(135deg, rgba(138,90,68,0.24), rgba(138,90,68,0.06))",
    monogram: "KK"
  },
  {
    id: "fore-coffee",
    name: "Fore Coffee",
    category: "beverage",
    aliases: ["fore coffee", "fore", "foresthree"],
    accent: "#F05A28",
    foreground: "#F05A28",
    surface: "linear-gradient(135deg, rgba(240,90,40,0.24), rgba(240,90,40,0.06))",
    monogram: "F"
  },
  {
    id: "janji-jiwa",
    name: "Janji Jiwa",
    category: "beverage",
    aliases: ["janji jiwa", "kopi janji jiwa"],
    accent: "#6E4A3A",
    foreground: "#6E4A3A",
    surface: "linear-gradient(135deg, rgba(110,74,58,0.22), rgba(110,74,58,0.06))",
    monogram: "JJ"
  },
  {
    id: "chatime",
    name: "Chatime",
    category: "beverage",
    aliases: ["chatime"],
    accent: "#6E3CBC",
    foreground: "#6E3CBC",
    surface: "linear-gradient(135deg, rgba(110,60,188,0.22), rgba(110,60,188,0.06))",
    monogram: "C"
  },
  {
    id: "mixue",
    name: "Mixue",
    category: "beverage",
    aliases: ["mixue"],
    accent: "#E93B3B",
    foreground: "#E93B3B",
    surface: "linear-gradient(135deg, rgba(233,59,59,0.2), rgba(233,59,59,0.06))",
    monogram: "M"
  },
  {
    id: "mcdonalds",
    name: "McDonald's",
    category: "food",
    aliases: ["mcd", "mcdonald", "mcdonalds", "mcdonald's", "mcd indonesia"],
    accent: "#FFC72C",
    foreground: "#D81F26",
    surface: "linear-gradient(135deg, rgba(255,199,44,0.22), rgba(216,31,38,0.06))",
    monogram: "M",
    icon: siMcdonalds
  },
  {
    id: "kfc",
    name: "KFC",
    category: "food",
    aliases: ["kfc", "kentucky fried chicken"],
    accent: "#C41230",
    foreground: "#C41230",
    surface: "linear-gradient(135deg, rgba(196,18,48,0.2), rgba(196,18,48,0.06))",
    monogram: "K",
    icon: siKfc
  },
  {
    id: "pizza-hut",
    name: "Pizza Hut",
    category: "food",
    aliases: ["pizza hut", "pizzahut", "phd"],
    accent: "#EE3124",
    foreground: "#EE3124",
    surface: "linear-gradient(135deg, rgba(238,49,36,0.2), rgba(238,49,36,0.06))",
    monogram: "PH"
  },
  {
    id: "familymart",
    name: "FamilyMart",
    category: "retail",
    aliases: ["familymart", "famima", "fam mart"],
    accent: "#00AEEF",
    foreground: "#00AEEF",
    surface: "linear-gradient(135deg, rgba(0,174,239,0.22), rgba(0,174,239,0.06))",
    monogram: "FM"
  },
  {
    id: "indomaret",
    name: "Indomaret",
    category: "retail",
    aliases: ["indomaret", "indo maret"],
    accent: "#0F56A7",
    foreground: "#0F56A7",
    surface: "linear-gradient(135deg, rgba(15,86,167,0.22), rgba(240,70,59,0.06))",
    monogram: "IM"
  },
  {
    id: "alfamart",
    name: "Alfamart",
    category: "retail",
    aliases: ["alfamart", "alfa mart"],
    accent: "#EE1D24",
    foreground: "#EE1D24",
    surface: "linear-gradient(135deg, rgba(238,29,36,0.2), rgba(255,193,7,0.06))",
    monogram: "AM"
  },
  {
    id: "bata",
    name: "Bata",
    category: "fashion",
    aliases: ["bata"],
    accent: "#EE3124",
    foreground: "#EE3124",
    surface: "linear-gradient(135deg, rgba(238,49,36,0.2), rgba(238,49,36,0.06))",
    monogram: "B",
    icon: siBata
  },
  {
    id: "uniqlo",
    name: "UNIQLO",
    category: "fashion",
    aliases: ["uniqlo"],
    accent: "#E60012",
    foreground: "#E60012",
    surface: "linear-gradient(135deg, rgba(230,0,18,0.2), rgba(230,0,18,0.06))",
    monogram: "U"
  },
  {
    id: "xendit",
    name: "Xendit",
    category: "payment",
    aliases: ["xendit"],
    accent: "#3D70F5",
    foreground: "#3D70F5",
    surface: "linear-gradient(135deg, rgba(61,112,245,0.22), rgba(61,112,245,0.06))",
    monogram: "X",
    icon: siXendit
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "payment",
    aliases: ["paypal", "pay pal"],
    accent: "#003087",
    foreground: "#003087",
    surface: "linear-gradient(135deg, rgba(0,48,135,0.22), rgba(0,156,222,0.06))",
    monogram: "PP",
    icon: siPaypal
  },
  {
    id: "uber",
    name: "Uber",
    category: "mobility",
    aliases: ["uber"],
    accent: "#000000",
    foreground: "#FFFFFF",
    surface: "linear-gradient(135deg, rgba(17,17,17,0.84), rgba(39,39,42,0.58))",
    monogram: "U",
    icon: siUber
  },
  {
    id: "qris",
    name: "QRIS",
    category: "payment",
    aliases: ["qris", "scan qris", "pay qris"],
    accent: "#1B6EF3",
    foreground: "#1B6EF3",
    surface: "linear-gradient(135deg, rgba(27,110,243,0.22), rgba(27,110,243,0.06))",
    monogram: "QR"
  },
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    category: "payment",
    aliases: ["bank transfer", "transfer bank", "bi-fast", "bifast", "transfer"],
    accent: "#374151",
    foreground: "#374151",
    surface: "linear-gradient(135deg, rgba(55,65,81,0.18), rgba(55,65,81,0.05))",
    monogram: "BT"
  }
];

const MATCHABLE_MERCHANTS = [...COMMON_MERCHANTS].sort(
  (left, right) =>
    Math.max(...right.aliases.map((alias) => alias.length)) -
    Math.max(...left.aliases.map((alias) => alias.length))
);

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatFallbackLabel(value: string) {
  const cleaned = value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 28);

  if (!cleaned) {
    return "Transaksi";
  }

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createFallbackBrand(transaction: Pick<TransactionWithRelations, "categoryColor" | "categoryName" | "note">): MerchantBrand {
  const label = formatFallbackLabel(transaction.note || transaction.categoryName);
  const monogram = label
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return {
    id: `fallback-${normalizeText(label).replace(/\s+/g, "-") || "transaction"}`,
    name: label,
    category: "custom",
    aliases: [],
    accent: transaction.categoryColor,
    foreground: transaction.categoryColor,
    surface: `linear-gradient(135deg, ${transaction.categoryColor}, rgba(255,255,255,0.03))`,
    monogram: monogram || "TX"
  };
}

function findBrandMatch(transaction: Pick<TransactionWithRelations, "note" | "categoryName" | "accountName">) {
  const searchable = normalizeText([transaction.note, transaction.categoryName, transaction.accountName].filter(Boolean).join(" "));

  return MATCHABLE_MERCHANTS.find((brand) => brand.aliases.some((alias) => searchable.includes(alias)));
}

export function listCommonMerchantBrands() {
  return COMMON_MERCHANTS;
}

export function resolveMerchantBrand(
  transaction: Pick<TransactionWithRelations, "note" | "categoryName" | "categoryColor" | "accountName">
): ResolvedMerchantBrand {
  const brand = findBrandMatch(transaction);

  if (brand) {
    return {
      ...brand,
      label: brand.name,
      matchSource: "brand"
    };
  }

  const fallback = createFallbackBrand(transaction);

  return {
    ...fallback,
    label: fallback.name,
    matchSource: "fallback"
  };
}

function isoDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatTransactionTimeLabel(createdAt: number, transactionDate: string) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (transactionDate === isoDateKey(now)) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(createdAt));
  }

  if (transactionDate === isoDateKey(yesterday)) {
    return "Kemarin";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short"
  }).format(new Date(transactionDate));
}
