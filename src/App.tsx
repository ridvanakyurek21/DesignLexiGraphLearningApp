import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";

type IconName =
  | "arrow-left"
  | "bell"
  | "book"
  | "books"
  | "chevron"
  | "check"
  | "close"
  | "download"
  | "filter"
  | "home"
  | "language"
  | "layers"
  | "menu"
  | "progress"
  | "plus"
  | "search"
  | "sparkles"
  | "stack"
  | "target"
  | "tune"
  | "words";

function Icon({
  name,
  size = 22,
  strokeWidth = 1.8,
  className = "",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    "arrow-left": <path d="m15 18-6-6 6-6M9 12h12" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z" />
      </>
    ),
    books: (
      <>
        <path d="M3 5h7v7H3zM14 5h7v7h-7zM3 16h7v5H3zM14 16h7v5h-7z" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    download: (
      <>
        <path d="M12 3v12M7 10l5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    filter: <path d="M4 5h16l-6.5 7.2V19l-3 1.5v-8.3Z" />,
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-7h6v7" />
      </>
    ),
    language: (
      <>
        <path d="M5 4h8M9 4c0 7-3 10-6 11M6 9c2 3 4 5 7 6" />
        <path d="m14 20 4-10 4 10M15.5 17h5" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 9 5-9 5-9-5Z" />
        <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
      </>
    ),
    menu: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    progress: <path d="M5 20V10M12 20V4M19 20v-7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3Z" />
        <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z" />
      </>
    ),
    stack: (
      <>
        <path d="m12 3 9 5-9 5-9-5Z" />
        <path d="m3 13 9 5 9-5" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <path d="m15 9 6-6M17 3h4v4" />
      </>
    ),
    tune: (
      <>
        <path d="M4 6h5M15 6h5M12 3v6M4 18h5M15 18h5M12 15v6M4 12h11M19 12h1M18 9v6" />
      </>
    ),
    words: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {paths[name]}
    </svg>
  );
}

type LibraryItem = {
  id: string;
  title: string;
  author: string;
  level: string;
  genre: string;
  image: string;
  description: string;
  duration?: string;
};

type BookRecord = LibraryItem & {
  saved: boolean;
  imported: boolean;
  downloaded: boolean;
  progress: number;
  lastOpened: string;
  addedAt: string;
  fileType: "EPUB" | "PDF" | "TXT" | null;
  localFileAvailable: boolean;
  readCount: number;
  readingMinutes: number;
};

const LOCAL_BOOK_DB = "lexigraph-local-books";
const LOCAL_BOOK_STORE = "files";

function openLocalBookDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(LOCAL_BOOK_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(LOCAL_BOOK_STORE)) {
        request.result.createObjectStore(LOCAL_BOOK_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLocalBookFile(id: string, file: File) {
  const db = await openLocalBookDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(LOCAL_BOOK_STORE, "readwrite");
    transaction.objectStore(LOCAL_BOOK_STORE).put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function getLocalBookFile(id: string) {
  const db = await openLocalBookDb();
  const file = await new Promise<File | undefined>((resolve, reject) => {
    const request = db
      .transaction(LOCAL_BOOK_STORE, "readonly")
      .objectStore(LOCAL_BOOK_STORE)
      .get(id);
    request.onsuccess = () => resolve(request.result as File | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return file;
}

async function removeLocalBookFile(id: string) {
  const db = await openLocalBookDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(LOCAL_BOOK_STORE, "readwrite");
    transaction.objectStore(LOCAL_BOOK_STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

const books: BookRecord[] = [
  {
    id: "little-prince",
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    level: "A2",
    genre: "Klasik",
    image: "/assets/covers/night-walk.jpg",
    description: "Dostluk, merak ve büyümek üzerine zamansız bir yolculuk.",
    saved: true,
    imported: false,
    downloaded: false,
    progress: 0,
    lastOpened: "2026-03-08",
    addedAt: "2026-02-18",
    fileType: "EPUB",
    localFileAvailable: false,
    readCount: 18420,
    readingMinutes: 15,
  },
  {
    id: "secret-garden",
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    level: "A2",
    genre: "Gizem",
    image: "/assets/covers/secret-garden.jpg",
    description: "Unutulmuş bir bahçenin kapısını açan umut dolu bir İngiliz klasiği.",
    saved: true,
    imported: false,
    downloaded: true,
    progress: 0,
    lastOpened: "2026-03-10",
    addedAt: "2026-02-22",
    fileType: "EPUB",
    localFileAvailable: true,
    readCount: 14860,
    readingMinutes: 18,
  },
  {
    id: "room-with-view",
    title: "A Room with a View",
    author: "E. M. Forster",
    level: "A2",
    genre: "Romantik",
    image: "/assets/covers/room-with-view.jpg",
    description: "Floransa sokaklarında özgürlük ve aşk arasında zarif bir hikâye.",
    saved: false,
    imported: false,
    downloaded: false,
    progress: 0,
    lastOpened: "2026-01-22",
    addedAt: "2026-01-22",
    fileType: "EPUB",
    localFileAvailable: false,
    readCount: 9320,
    readingMinutes: 22,
  },
  {
    id: "quiet-lake",
    title: "The Quiet Lake",
    author: "Eleanor Moss",
    level: "A1",
    genre: "Günlük Yaşam",
    image: "/assets/covers/lake-house.jpg",
    description: "Göl kenarında geçen sade, sıcak ve kolay takip edilen bir yaşam öyküsü.",
    saved: false,
    imported: false,
    downloaded: false,
    progress: 0,
    lastOpened: "2026-01-18",
    addedAt: "2026-01-18",
    fileType: "TXT",
    localFileAvailable: false,
    readCount: 5210,
    readingMinutes: 10,
  },
  {
    id: "midnight-express",
    title: "Midnight Express",
    author: "Daniel North",
    level: "A2",
    genre: "Macera",
    image: "/assets/covers/night-train.jpg",
    description: "Gece yarısı treninde başlayan tempolu ve sürükleyici bir macera.",
    saved: true,
    imported: false,
    downloaded: true,
    progress: 0,
    lastOpened: "2026-03-04",
    addedAt: "2026-02-25",
    fileType: "PDF",
    localFileAvailable: true,
    readCount: 11740,
    readingMinutes: 14,
  },
  {
    id: "moonwood",
    title: "Moonwood",
    author: "Clara Reed",
    level: "A2",
    genre: "Fantastik",
    image: "/assets/covers/moon-forest.jpg",
    description: "Ay ışığının yol gösterdiği büyülü bir ormanda unutulmaz bir keşif.",
    saved: false,
    imported: false,
    downloaded: false,
    progress: 0,
    lastOpened: "2026-01-14",
    addedAt: "2026-01-14",
    fileType: "EPUB",
    localFileAvailable: false,
    readCount: 7640,
    readingMinutes: 20,
  },
  {
    id: "alpine-letter",
    title: "The Alpine Letter",
    author: "Helen Ward",
    level: "B1",
    genre: "Klasik",
    image: "/assets/covers/alpine-letter.jpg",
    description: "Dağ kasabasına ulaşan gizemli bir mektup geçmişi yeniden canlandırır.",
    saved: false,
    imported: false,
    downloaded: false,
    progress: 0,
    lastOpened: "2026-01-10",
    addedAt: "2026-01-10",
    fileType: "EPUB",
    localFileAvailable: false,
    readCount: 6890,
    readingMinutes: 25,
  },
];

const shortStories: LibraryItem[] = [
  {
    id: "last-night-train",
    title: "Son Gece Treni",
    author: "LexiGraph Short Reads",
    level: "A2",
    genre: "Macera",
    image: "/assets/covers/night-train.jpg",
    duration: "16 dk",
    description: "Son seferini yapan bir trende tesadüflerle örülü kısa bir macera.",
  },
  {
    id: "moonlit-path",
    title: "Ay Işığındaki Patika",
    author: "LexiGraph Short Reads",
    level: "A2",
    genre: "Fantastik",
    image: "/assets/covers/moon-forest.jpg",
    duration: "12 dk",
    description: "Ormanın içinde yalnızca ay doğduğunda beliren gizli bir patika.",
  },
  {
    id: "quiet-garden",
    title: "Sessiz Bahçe",
    author: "LexiGraph Short Reads",
    level: "A1",
    genre: "Gizem",
    image: "/assets/covers/secret-garden.jpg",
    duration: "10 dk",
    description: "Her sabah farklı bir çiçeğin açtığı küçük ve gizemli bir bahçe.",
  },
  {
    id: "night-walk",
    title: "Gece Yürüyüşü",
    author: "LexiGraph Short Reads",
    level: "A2",
    genre: "Günlük Yaşam",
    image: "/assets/covers/night-walk.jpg",
    duration: "14 dk",
    description: "Şehrin ışıklarından uzakta düşüncelerle yapılan sakin bir yürüyüş.",
  },
];

const searchResults = [
  {
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    level: "A2",
    genre: "Gizem",
    cover: "garden",
  },
  {
    title: "The Garden Party",
    author: "Katherine Mansfield",
    level: "B1",
    genre: "Klasik",
    cover: "party",
  },
  {
    title: "A Garden in Winter",
    author: "Elizabeth von Arnim",
    level: "A2",
    genre: "Yaşam",
    cover: "winter",
  },
  {
    title: "The Forgotten Garden",
    author: "Kate Morton",
    level: "B1",
    genre: "Dram",
    cover: "forgotten",
  },
];

function Logo() {
  return (
    <div className="logo" aria-label="LexiGraph">
      <span className="logo-mark">
        <i />
        <i />
      </span>
      <strong>LexiGraph</strong>
    </div>
  );
}

function NavBar() {
  const items = [
    ["Bugün", "home"],
    ["Kitaplık", "book"],
    ["Kelimeler", "words"],
    ["AI Asistan", "sparkles"],
    ["İlerleme", "progress"],
  ] as const;

  return (
    <nav className="bottom-nav" aria-label="Ana menü">
      {items.map(([label, icon]) => (
        <button
          aria-current={label === "Kitaplık" ? "page" : undefined}
          className={label === "Kitaplık" ? "active" : ""}
          key={label}
          type="button"
        >
          <span className="nav-icon">
            <Icon name={icon} size={22} />
          </span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

function BookCover({
  variant,
  title,
  compact = false,
}: {
  variant: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <div className={`book-cover cover-${variant} ${compact ? "compact" : ""}`}>
      <span className="cover-kicker">
        {variant === "prince" ? "A timeless story" : "LexiGraph Edition"}
      </span>
      <span className="cover-title">{title}</span>
      <span className="cover-art" />
    </div>
  );
}

function Hero({ onSearch, onOpenFilters }: { onSearch: () => void; onOpenFilters: () => void }) {
  return (
    <header className="hero">
      <div className="hero-art" />
      <div className="hero-shade" />
      <div className="hero-content page-width">
        <div className="topbar" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-inspiration">
            Bir hikâyeyle başla,
            <span>yeni bir dünyaya açıl.</span>
          </p>
        </div>
        <div className="library-search">
          <button className="library-search-field" onClick={onSearch} type="button">
            <Icon name="search" size={19} />
            <span>Kitap, yazar veya tür ara...</span>
          </button>
          <button
            className="library-filter"
            onClick={onOpenFilters}
            aria-label="Kitaplık ayarlarını aç"
            type="button"
          >
            <Icon name="tune" size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}

function DiscoveryCover({ item }: { item: LibraryItem }) {
  return (
    <div className="discovery-cover">
      <img alt="" src={item.image} />
      <span>LEXIGRAPH EDITION</span>
    </div>
  );
}

function DiscoveryCard({
  item,
  onSelect,
  story = false,
}: {
  item: LibraryItem;
  onSelect: (item: LibraryItem) => void;
  story?: boolean;
}) {
  return (
    <button
      className={`discovery-card ${story ? "story-discovery-card" : ""}`}
      onClick={() => onSelect(item)}
      type="button"
    >
      <DiscoveryCover item={item} />
      <span className="discovery-meta">
        <strong>{item.title}</strong>
        <small>
          <b>{item.duration || item.level}</b>
          <i />
          {item.duration ? item.level : item.genre}
        </small>
      </span>
    </button>
  );
}

function BookDetail({
  item,
  onClose,
  languageSupport,
  onStart,
}: {
  item: LibraryItem;
  onClose: () => void;
  languageSupport: string;
  onStart?: (item: LibraryItem) => void;
}) {
  return (
    <section className="detail-view" aria-label={`${item.title} kitap detayı`}>
      <button className="overlay-back" onClick={onClose} aria-label="Kitaplığa dön" type="button">
        <Icon name="arrow-left" size={21} />
      </button>
      <div className="detail-art">
        <img alt={`${item.title} kapak görseli`} src={item.image} />
        <div />
      </div>
      <div className="detail-content">
        <p className="section-kicker">LEXIGRAPH EDITION</p>
        <h2>{item.title}</h2>
        <p className="detail-author">{item.author}</p>
        <div className="detail-tags">
          <span>{item.level}</span>
          <span>{item.genre}</span>
          {item.duration && <span>{item.duration}</span>}
          <span>{languageSupport}</span>
        </div>
        <p className="detail-description">
          {languageSupport === "Yalnızca İngilizce"
            ? "This story is presented entirely in English, without Turkish reading hints."
            : item.description}
        </p>
        <button className="detail-cta" onClick={() => onStart?.(item)} type="button">
          {languageSupport === "Yalnızca İngilizce" ? "Start Reading" : "Okumaya Başla"}
          <Icon name="chevron" size={18} />
        </button>
      </div>
    </section>
  );
}

function CollectionView({
  title,
  eyebrow,
  items,
  story,
  onBack,
  onSelect,
}: {
  title: string;
  eyebrow: string;
  items: LibraryItem[];
  story: boolean;
  onBack: () => void;
  onSelect: (item: LibraryItem) => void;
}) {
  return (
    <section className="collection-view" aria-label={title}>
      <header className="collection-header">
        <button onClick={onBack} aria-label="Kitaplığa dön" type="button">
          <Icon name="arrow-left" size={21} />
        </button>
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </header>
      <div className="collection-grid">
        {items.map((item) => (
          <DiscoveryCard item={item} key={item.title} onSelect={onSelect} story={story} />
        ))}
      </div>
    </section>
  );
}

function LibraryTabs({
  active,
  onChange,
}: {
  active: "discover" | "mine" | "downloads";
  onChange: (tab: "discover" | "mine" | "downloads") => void;
}) {
  const tabs = [
    ["discover", "Keşfet", "sparkles"],
    ["mine", "Kitaplarım", "book"],
    ["downloads", "İndirilenler", "download"],
  ] as const;

  return (
    <div className="library-tabs" role="tablist" aria-label="Kitaplık bölümleri">
      {tabs.map(([id, label, icon]) => (
        <button
          aria-selected={active === id}
          className={active === id ? "active" : ""}
          key={id}
          onClick={() => onChange(id)}
          role="tab"
          type="button"
        >
          <Icon name={icon} size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function PersonalBookRow({
  book,
  onOpen,
}: {
  book: BookRecord;
  onOpen: (book: BookRecord) => void;
}) {
  return (
    <button className="personal-book" onClick={() => onOpen(book)} type="button">
      <img alt="" src={book.image} />
      <span className="personal-book-copy">
        <strong>{book.title}</strong>
        <small>{book.author}</small>
        <span className="personal-progress">
          <i style={{ width: `${book.progress}%` }} />
        </span>
        <em>{book.progress > 0 ? `%${book.progress} okundu` : "Henüz başlanmadı"}</em>
      </span>
      <Icon name="chevron" size={18} />
    </button>
  );
}

function ImportFlow({
  onClose,
  onAdd,
  onRead,
}: {
  onClose: () => void;
  onAdd: (book: BookRecord, file: File) => void;
  onRead: (book: BookRecord) => void;
}) {
  const [step, setStep] = useState<"select" | "processing" | "details" | "success">("select");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState("İngilizce");
  const [level, setLevel] = useState("Belirtilmedi");
  const [cover, setCover] = useState("/assets/covers/lake-house.jpg");
  const [createdBook, setCreatedBook] = useState<BookRecord | null>(null);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const extension = selected.name.split(".").pop()?.toUpperCase();
    if (!["EPUB", "PDF", "TXT"].includes(extension || "")) return;
    setFile(selected);
    setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    setStep("processing");
    window.setTimeout(() => setStep("details"), 1300);
  };

  const selectCover = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) setCover(URL.createObjectURL(selected));
  };

  const addBook = () => {
    if (!file || !title.trim()) return;
    const extension = file.name.split(".").pop()?.toUpperCase() as "EPUB" | "PDF" | "TXT";
    const book: BookRecord = {
      id: `import-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || "Bilinmeyen yazar",
      level,
      genre: "Eklenenler",
      image: cover,
      description:
        language === "İngilizce"
          ? "Kullanıcının yerel cihazından eklediği İngilizce kitap."
          : "Kullanıcının yerel cihazından eklediği kitap.",
      saved: true,
      imported: true,
      downloaded: true,
      progress: 0,
      lastOpened: new Date().toISOString(),
      addedAt: new Date().toISOString(),
      fileType: extension,
      localFileAvailable: true,
      readCount: 0,
      readingMinutes: 20,
    };
    onAdd(book, file);
    setCreatedBook(book);
    setStep("success");
  };

  return (
    <section className="import-view" aria-label="Kitap içe aktar">
      <header className="import-header">
        <button onClick={onClose} aria-label="İçe aktarmayı kapat" type="button">
          <Icon name="close" size={21} />
        </button>
        <div>
          <h2>Kitap içe aktar</h2>
          <p>Kendi kitaplarını ekle, oku ve İngilizceni geliştir.</p>
        </div>
      </header>

      {step === "select" && (
        <div className="import-stage">
          <span className="import-symbol">
            <Icon name="plus" size={28} />
          </span>
          <h3>Dosya seç</h3>
          <p>Dosyan cihazında kalır ve herhangi bir sunucuya yüklenmez.</p>
          <div className="file-types">
            <span>EPUB</span>
            <span>PDF</span>
            <span>TXT</span>
          </div>
          <label className="file-select">
            Dosya seç
            <input accept=".epub,.pdf,.txt" onChange={selectFile} type="file" />
          </label>
        </div>
      )}

      {step === "processing" && (
        <div className="import-stage processing-stage">
          <span className="processing-ring" />
          <h3>Kitap hazırlanıyor...</h3>
          {[
            "Dosya kontrol ediliyor",
            "Kitap bilgileri okunuyor",
            "Kapak hazırlanıyor",
            "Okuma içeriği hazırlanıyor",
          ].map((label, index) => (
            <div key={label} style={{ animationDelay: `${index * 180}ms` }}>
              <Icon name="check" size={15} /> {label}
            </div>
          ))}
        </div>
      )}

      {step === "details" && (
        <div className="import-form">
          <div className="import-cover-field">
            <img alt="Seçilen kitap kapağı" src={cover} />
            <label>
              Kapağı değiştir
              <input accept="image/*" onChange={selectCover} type="file" />
            </label>
          </div>
          <label>
            Kitap adı
            <input onChange={(e) => setTitle(e.target.value)} value={title} />
          </label>
          <label>
            Yazar
            <input
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Yazar adı"
              value={author}
            />
          </label>
          <label>
            Dil
            <select onChange={(e) => setLanguage(e.target.value)} value={language}>
              <option>İngilizce</option>
              <option>Türkçe</option>
              <option>Diğer</option>
            </select>
          </label>
          <label>
            İngilizce seviyesi <small>İsteğe bağlı</small>
            <select onChange={(e) => setLevel(e.target.value)} value={level}>
              <option>Belirtilmedi</option>
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button className="import-primary" onClick={addBook} type="button">
            Kitaplığıma ekle
          </button>
        </div>
      )}

      {step === "success" && createdBook && (
        <div className="import-stage success-stage">
          <span className="success-check">
            <Icon name="check" size={28} />
          </span>
          <h3>Kitabın başarıyla eklendi.</h3>
          <p>{createdBook.title}, Kitaplarım → Eklediklerim bölümünde hazır.</p>
          <button className="import-primary" onClick={() => onRead(createdBook)} type="button">
            Okumaya başla
          </button>
        </div>
      )}
    </section>
  );
}

function ReaderView({
  book,
  file,
  onClose,
  onProgress,
}: {
  book: BookRecord;
  file?: File;
  onClose: () => void;
  onProgress: (id: string, progress: number) => void;
}) {
  const [text, setText] = useState("Bu kitap için yerel okuma önizlemesi hazırlanıyor.");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (book.fileType === "TXT" && file) {
      file.text().then((content) => setText(content.slice(0, 12000)));
    } else if (book.fileType === "PDF") {
      setText(
        "PDF metin çıkarımı bu prototipte sınırlıdır. Taranmış veya korumalı PDF dosyaları için okunabilir metin bulunamayabilir.",
      );
    } else if (book.fileType === "EPUB" && book.imported) {
      setText("Yerel EPUB dosyan hazır. Tam EPUB ayrıştırıcısı bu prototipte etkin değil.");
    } else {
      setText(book.description);
    }
  }, [book, file]);

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.slice(0, 600)));
    setNotice("Sesli okuma başlatıldı.");
  };

  return (
    <section className="reader-view" aria-label={`${book.title} okuyucu`}>
      <header>
        <button
          onClick={() => {
            onProgress(book.id, Math.min(100, book.progress + 5));
            onClose();
          }}
          aria-label="Kitaplığa dön"
          type="button"
        >
          <Icon name="arrow-left" size={21} />
        </button>
        <div>
          <strong>{book.title}</strong>
          <span>Yerel okuma önizlemesi</span>
        </div>
        <button onClick={speak} aria-label="Sesli oku" type="button">
          <Icon name="sparkles" size={20} />
        </button>
      </header>
      <article>
        <p>{text}</p>
      </article>
      <div className="reader-tools">
        <button onClick={() => setNotice("Seçili metin için çeviri paneli hazır.")} type="button">
          Çeviri
        </button>
        <button onClick={() => setNotice("Kelime listene kaydedildi.")} type="button">
          Kelime kaydet
        </button>
        <button
          onClick={() => setNotice("AI Asistan çevrimiçi bağlantı gerektirir.")}
          type="button"
        >
          AI Asistan
        </button>
        <button onClick={speak} type="button">
          Sesli oku
        </button>
      </div>
      {notice && <p className="reader-notice">{notice}</p>}
    </section>
  );
}

function Library({
  onSearch,
  onOpenFilters,
  allLevels,
  userLevel,
  filterLevel,
  activeGenre,
  readingDuration,
  languageSupport,
  searchQuery,
  setSearchQuery,
  setAllLevels,
  setFilterLevel,
  setActiveGenre,
  setReadingDuration,
  setLanguageSupport,
  clearFilters,
}: {
  onSearch: () => void;
  onOpenFilters: () => void;
  allLevels: boolean;
  userLevel: string;
  filterLevel: string | null;
  activeGenre: string;
  readingDuration: string;
  languageSupport: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  setAllLevels: (value: boolean) => void;
  setFilterLevel: (value: string | null) => void;
  setActiveGenre: (value: string) => void;
  setReadingDuration: (value: string) => void;
  setLanguageSupport: (value: string) => void;
  clearFilters: () => void;
}) {
  const [libraryTab, setLibraryTab] = useState<"discover" | "mine" | "downloads">("discover");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [selectedReader, setSelectedReader] = useState<BookRecord | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [mineFilter, setMineFilter] = useState<"all" | "saved" | "imported">("all");
  const [sortBy, setSortBy] = useState("Son açılan");
  const [resultPreset, setResultPreset] = useState<"level" | "short" | "all" | null>(null);
  const [downloadMenu, setDownloadMenu] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<Record<string, File>>({});
  const [personalBooks, setPersonalBooks] = useState<BookRecord[]>(() => {
    try {
      const catalogState = JSON.parse(
        localStorage.getItem("lexigraph-catalog-state") || "{}",
      ) as Record<string, Partial<BookRecord>>;
      const defaults = books
        .map((book) => ({ ...book, ...catalogState[book.id] }))
        .filter((book) => book.saved || book.imported || book.progress > 0);
      const stored = JSON.parse(
        localStorage.getItem("lexigraph-imported-books") || "[]",
      ) as BookRecord[];
      const restored = stored.map((book) => ({
        ...book,
        downloaded: false,
        localFileAvailable: false,
        image: book.image.startsWith("blob:") ? "/assets/covers/lake-house.jpg" : book.image,
      }));
      return [
        ...defaults,
        ...restored.filter((item) => !defaults.some((book) => book.id === item.id)),
      ];
    } catch {
      return books.filter((book) => book.saved || book.imported);
    }
  });
  const levelOrder: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  const profileBooks = books
    .filter((book) => levelOrder[book.level] <= levelOrder[userLevel])
    .sort((a, b) => Number(b.level === userLevel) - Number(a.level === userLevel));
  const effectiveLevel = filterLevel || userLevel;
  const filteredBooks = books
    .filter((book) => allLevels || levelOrder[book.level] <= levelOrder[effectiveLevel])
    .filter((book) => activeGenre === "Tümü" || book.genre === activeGenre)
    .filter((book) => {
      if (readingDuration === "10 dk altı") return book.readingMinutes <= 10;
      if (readingDuration === "10–20 dk") {
        return book.readingMinutes > 10 && book.readingMinutes <= 20;
      }
      if (readingDuration === "20 dk üzeri") return book.readingMinutes > 20;
      return true;
    })
    .filter((book) => {
      const query = searchQuery.trim().toLocaleLowerCase("tr");
      if (!query) return true;
      return [book.title, book.author, book.genre].some((value) =>
        value.toLocaleLowerCase("tr").includes(query),
      );
    })
    .sort((a, b) => Number(b.level === effectiveLevel) - Number(a.level === effectiveLevel));
  const shortBreakStories = shortStories
    .filter((story) => levelOrder[story.level] <= levelOrder[userLevel])
    .filter((story) => {
      const minutes = Number.parseInt(story.duration || "0", 10);
      return minutes >= 5 && minutes <= 15;
    });
  const hasCustomFilters =
    allLevels ||
    filterLevel !== null ||
    activeGenre !== "Tümü" ||
    readingDuration !== "Tümü" ||
    languageSupport !== "Türkçe Açık" ||
    searchQuery.trim().length > 0;
  const resultMode = hasCustomFilters || resultPreset !== null;
  const resultBooks: LibraryItem[] =
    resultPreset === "short"
      ? shortBreakStories
      : resultPreset === "level" || resultPreset === "all"
        ? profileBooks
        : filteredBooks;
  const filteredPersonal = personalBooks
    .filter((book) => {
      if (mineFilter === "saved") return book.saved;
      if (mineFilter === "imported") return book.imported;
      return book.saved || book.imported;
    })
    .sort((a, b) => {
      if (sortBy === "Ada göre") return a.title.localeCompare(b.title);
      if (sortBy === "Son eklenen") return b.addedAt.localeCompare(a.addedAt);
      if (sortBy === "Okuma ilerlemesi") return b.progress - a.progress;
      return b.lastOpened.localeCompare(a.lastOpened);
    });
  const downloadedBooks = personalBooks.filter(
    (book) => book.downloaded && book.localFileAvailable,
  );
  const lastReadBook = [...personalBooks]
    .filter((book) => book.progress > 0)
    .sort((a, b) => b.lastOpened.localeCompare(a.lastOpened))[0];
  const filterTags: Array<{ key: string; label: string; remove: () => void }> = [];
  if (searchQuery.trim()) {
    filterTags.push({
      key: "query",
      label: `“${searchQuery.trim()}”`,
      remove: () => setSearchQuery(""),
    });
  }
  if (allLevels || filterLevel) {
    filterTags.push({
      key: "level",
      label: allLevels ? "Tüm seviyeler" : `${effectiveLevel} ve altı`,
      remove: () => {
        setAllLevels(false);
        setFilterLevel(null);
      },
    });
  }
  if (activeGenre !== "Tümü") {
    filterTags.push({
      key: "genre",
      label: activeGenre,
      remove: () => setActiveGenre("Tümü"),
    });
  }
  if (readingDuration !== "Tümü") {
    filterTags.push({
      key: "duration",
      label: readingDuration,
      remove: () => setReadingDuration("Tümü"),
    });
  }
  if (languageSupport !== "Türkçe Açık") {
    filterTags.push({
      key: "language",
      label: languageSupport,
      remove: () => setLanguageSupport("Türkçe Açık"),
    });
  }

  const resetResults = () => {
    clearFilters();
    setSearchQuery("");
    setResultPreset(null);
  };

  useEffect(() => {
    const imported = personalBooks
      .filter((book) => book.imported)
      .map((book) => ({
        ...book,
        image: book.image.startsWith("blob:") ? "/assets/covers/lake-house.jpg" : book.image,
      }));
    try {
      localStorage.setItem("lexigraph-imported-books", JSON.stringify(imported));
      const catalogState = Object.fromEntries(
        personalBooks
          .filter((book) => !book.imported)
          .map((book) => [
            book.id,
            {
              saved: book.saved,
              downloaded: book.downloaded,
              progress: book.progress,
              lastOpened: book.lastOpened,
              localFileAvailable: book.localFileAvailable,
            },
          ]),
      );
      localStorage.setItem("lexigraph-catalog-state", JSON.stringify(catalogState));
    } catch {
      // The selected local file remains available for this session.
    }
  }, [personalBooks]);

  useEffect(() => {
    const importedIds = personalBooks.filter((book) => book.imported).map((book) => book.id);
    if (!importedIds.length || !("indexedDB" in window)) return;
    Promise.all(importedIds.map(async (id) => [id, await getLocalBookFile(id)] as const))
      .then((entries) => {
        const available = entries.filter((entry): entry is readonly [string, File] =>
          Boolean(entry[1]),
        );
        if (!available.length) return;
        setLocalFiles(Object.fromEntries(available));
        const availableIds = new Set(available.map(([id]) => id));
        setPersonalBooks((current) =>
          current.map((book) =>
            availableIds.has(book.id)
              ? { ...book, downloaded: true, localFileAvailable: true }
              : book,
          ),
        );
      })
      .catch(() => {
        // Downloads correctly stay hidden when their local file cannot be verified.
      });
  }, []);

  const openReader = (book: BookRecord) => {
    setPersonalBooks((current) =>
      current.map((item) =>
        item.id === book.id ? { ...item, lastOpened: new Date().toISOString() } : item,
      ),
    );
    setSelectedReader(book);
  };

  const updateProgress = (id: string, progress: number) => {
    setPersonalBooks((current) =>
      current.map((book) => (book.id === id ? { ...book, progress } : book)),
    );
  };

  const startCatalogBook = (item: LibraryItem) => {
    const catalogBook = books.find((book) => book.id === item.id);
    if (!catalogBook) return;
    const startedBook = {
      ...catalogBook,
      saved: true,
      lastOpened: new Date().toISOString(),
    };
    setPersonalBooks((current) => [
      ...current.filter((book) => book.id !== startedBook.id),
      startedBook,
    ]);
    setSelectedItem(null);
    setSelectedReader(startedBook);
  };

  return (
    <main className="app-screen library-screen">
      <Hero onOpenFilters={onOpenFilters} onSearch={onSearch} />
      <div className="library-content page-width">
        {lastReadBook && (
          <div className="continue-reading">
            <div
              className="reading-cover"
              aria-hidden="true"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent, rgba(4, 25, 24, .25)), url(${lastReadBook.image})`,
              }}
            >
              <span>{lastReadBook.title}</span>
            </div>
            <div className="reading-details">
              <div className="reading-label">
                <span>SON OKUNAN</span>
              </div>
              <strong>{lastReadBook.title}</strong>
              <div
                className="reading-progress"
                aria-label={`Okuma ilerlemesi: yüzde ${lastReadBook.progress}`}
              >
                <i style={{ width: `${lastReadBook.progress}%` }} />
              </div>
              <div className="reading-foot">
                <small>{lastReadBook.fileType || "Kitap"} · Kaldığın yerden devam et</small>
                <b>%{lastReadBook.progress}</b>
              </div>
            </div>
            <button
              className="continue-button"
              onClick={() => openReader(lastReadBook)}
              type="button"
            >
              <span>Devam Et</span>
              <Icon name="chevron" size={17} />
            </button>
          </div>
        )}
        <LibraryTabs active={libraryTab} onChange={setLibraryTab} />

        {libraryTab === "discover" && (
          <div className="library-tab-content">
            {!resultMode ? (
              <div className="discovery-mode">
                <section className="editorial-section" aria-labelledby="level-title">
                  <div className="section-heading">
                    <div>
                      <h2 id="level-title">Senin seviyende</h2>
                      <p>Sana uygun hikâyeler</p>
                    </div>
                    <button onClick={() => setResultPreset("level")} type="button">
                      Tümünü gör <Icon name="chevron" size={15} />
                    </button>
                  </div>
                  <div className="book-carousel level-book-shelf hide-scrollbar">
                    {profileBooks.map((book) => (
                      <DiscoveryCard item={book} key={book.id} onSelect={setSelectedItem} />
                    ))}
                  </div>
                </section>

                <section className="editorial-section" aria-labelledby="break-title">
                  <div className="section-heading">
                    <div>
                      <h2 id="break-title">10 dakikalık hikâyeler</h2>
                      <p>Az zamanda yeni bir dünya keşfet</p>
                    </div>
                    <button onClick={() => setResultPreset("short")} type="button">
                      Tümünü gör <Icon name="chevron" size={15} />
                    </button>
                  </div>
                  <div className="book-carousel level-book-shelf hide-scrollbar">
                    {shortBreakStories.map((story) => (
                      <DiscoveryCard item={story} key={story.id} onSelect={setSelectedItem} />
                    ))}
                  </div>
                </section>

                <section
                  className="editorial-section genre-discovery"
                  aria-labelledby="genre-title"
                >
                  <div className="section-heading">
                    <div>
                      <h2 id="genre-title">Türüne göre keşfet</h2>
                    </div>
                  </div>
                  <div className="genre-discovery-grid">
                    {[
                      ["Gizem", "Gizem"],
                      ["Macera", "Macera"],
                      ["Klasikler", "Klasik"],
                      ["Günlük yaşam", "Günlük Yaşam"],
                      ["Romantik", "Romantik"],
                      ["Fantastik", "Fantastik"],
                    ].map(([label, value]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setActiveGenre(value);
                          setResultPreset(null);
                        }}
                        type="button"
                      >
                        <Icon name="book" size={15} />
                        {label}
                        <Icon name="chevron" size={14} />
                      </button>
                    ))}
                  </div>
                </section>

                <button
                  className="explore-all-link"
                  onClick={() => setResultPreset("all")}
                  type="button"
                >
                  Tüm kitapları keşfet <Icon name="chevron" size={15} />
                </button>
              </div>
            ) : (
              <section className="result-mode" aria-labelledby="results-title">
                <div className="result-mode-heading">
                  <div>
                    <h2 id="results-title">Aradığın kitaplar</h2>
                    <p>{resultBooks.length} kitap bulundu</p>
                  </div>
                  <button onClick={resetResults} type="button">
                    Filtreleri temizle
                  </button>
                </div>

                <div className="result-filter-tags">
                  {resultPreset && (
                    <button onClick={() => setResultPreset(null)} type="button">
                      {resultPreset === "short"
                        ? "10 dakikalık hikâyeler"
                        : resultPreset === "level"
                          ? `${userLevel} ve altı`
                          : "Tüm uygun kitaplar"}
                      <Icon name="close" size={12} />
                    </button>
                  )}
                  {filterTags.map((tag) => (
                    <button key={tag.key} onClick={tag.remove} type="button">
                      {tag.label} <Icon name="close" size={12} />
                    </button>
                  ))}
                </div>

                {resultBooks.length ? (
                  <div className="catalog-grid result-grid">
                    {resultBooks.map((book) => (
                      <DiscoveryCard item={book} key={book.id} onSelect={setSelectedItem} />
                    ))}
                  </div>
                ) : (
                  <div className="result-empty">
                    <Icon name="search" size={28} />
                    <strong>Bu filtrelere uygun kitap bulunamadı.</strong>
                    <div>
                      <button onClick={onOpenFilters} type="button">
                        Filtreleri düzenle
                      </button>
                      <button onClick={resetResults} type="button">
                        Filtreleri temizle
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {libraryTab === "mine" && (
          <section className="personal-library">
            <div className="personal-header">
              <h2>Kitaplarım</h2>
              <button onClick={() => setImportOpen(true)} type="button">
                <Icon name="plus" size={16} /> İçe aktar
              </button>
            </div>
            <div className="personal-toolbar">
              <div className="personal-filters">
                {[
                  ["all", "Tümü"],
                  ["saved", "Kaydedilenler"],
                  ["imported", "Eklediklerim"],
                ].map(([id, label]) => (
                  <button
                    className={mineFilter === id ? "active" : ""}
                    key={id}
                    onClick={() => setMineFilter(id as "all" | "saved" | "imported")}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                <option>Son açılan</option>
                <option>Son eklenen</option>
                <option>Ada göre</option>
                <option>Okuma ilerlemesi</option>
              </select>
            </div>
            <div className="personal-list">
              {filteredPersonal.length ? (
                filteredPersonal.map((book) => (
                  <PersonalBookRow book={book} key={book.id} onOpen={openReader} />
                ))
              ) : (
                <div className="library-empty">
                  <Icon name="book" size={28} />
                  <strong>Bu bölüm henüz boş</strong>
                  <p>Kitap kaydet veya kendi EPUB, PDF ya da TXT dosyanı içe aktar.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {libraryTab === "downloads" && (
          <section className="downloads-library">
            <div className="personal-header">
              <div>
                <h2>İndirilenler</h2>
                <p>Çevrimdışı okumaya hazır kitaplar.</p>
              </div>
            </div>
            {downloadedBooks.length ? (
              <div className="download-list">
                {downloadedBooks.map((book) => (
                  <article className="download-book" key={book.id}>
                    <img alt="" src={book.image} />
                    <div>
                      <span className="download-ready">
                        <Icon name="check" size={12} /> Cihazda hazır
                      </span>
                      <h3>{book.title}</h3>
                      <p>
                        {book.fileType} · %{book.progress} okundu
                      </p>
                    </div>
                    <button
                      onClick={() => setDownloadMenu(downloadMenu === book.id ? null : book.id)}
                      aria-label={`${book.title} menüsü`}
                      type="button"
                    >
                      <Icon name="menu" size={19} />
                    </button>
                    {downloadMenu === book.id && (
                      <div className="download-menu">
                        <button onClick={() => openReader(book)} type="button">
                          Kitabı aç
                        </button>
                        <button
                          onClick={() => {
                            if (book.imported && "indexedDB" in window) {
                              removeLocalBookFile(book.id).catch(() => undefined);
                            }
                            setPersonalBooks((current) =>
                              current.map((item) =>
                                item.id === book.id
                                  ? { ...item, downloaded: false, localFileAvailable: false }
                                  : item,
                              ),
                            );
                            setDownloadMenu(null);
                          }}
                          type="button"
                        >
                          İndirmeyi kaldır
                        </button>
                        <button onClick={() => setSelectedItem(book)} type="button">
                          Kitap detayları
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="library-empty">
                <Icon name="download" size={28} />
                <strong>İndirilen kitap yok</strong>
                <p>Çevrimdışı okumak istediğin kitaplar burada görünür.</p>
              </div>
            )}
          </section>
        )}
      </div>

      {selectedItem && (
        <BookDetail
          item={selectedItem}
          languageSupport={languageSupport}
          onClose={() => setSelectedItem(null)}
          onStart={startCatalogBook}
        />
      )}
      {importOpen && (
        <ImportFlow
          onAdd={(book, file) => {
            setPersonalBooks((current) => [...current.filter((item) => item.id !== book.id), book]);
            setLocalFiles((current) => ({ ...current, [book.id]: file }));
            if ("indexedDB" in window) {
              saveLocalBookFile(book.id, file).catch(() => undefined);
            }
          }}
          onClose={() => setImportOpen(false)}
          onRead={(book) => {
            setImportOpen(false);
            openReader(book);
          }}
        />
      )}
      {selectedReader && (
        <ReaderView
          book={selectedReader}
          file={localFiles[selectedReader.id]}
          onClose={() => setSelectedReader(null)}
          onProgress={updateProgress}
        />
      )}
      <NavBar />
    </main>
  );
}

function SearchScreen({
  onBack,
  query,
  setQuery,
  allLevels,
  userLevel,
  filterLevel,
  activeGenre,
  readingDuration,
  languageSupport,
}: {
  onBack: () => void;
  query: string;
  setQuery: (value: string) => void;
  allLevels: boolean;
  userLevel: string;
  filterLevel: string | null;
  activeGenre: string;
  readingDuration: string;
  languageSupport: string;
}) {
  const [tab, setTab] = useState("Kitaplar");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const levels: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  const effectiveLevel = filterLevel || userLevel;
  const matchingBooks = books
    .filter((book) => allLevels || levels[book.level] <= levels[effectiveLevel])
    .filter((book) => activeGenre === "Tümü" || book.genre === activeGenre)
    .filter((book) => {
      if (readingDuration === "10 dk altı") return book.readingMinutes <= 10;
      if (readingDuration === "10–20 dk") {
        return book.readingMinutes > 10 && book.readingMinutes <= 20;
      }
      if (readingDuration === "20 dk üzeri") return book.readingMinutes > 20;
      return true;
    })
    .filter((book) => {
      const normalizedQuery = query.trim().toLocaleLowerCase("tr");
      if (!normalizedQuery) return true;
      return [book.title, book.author, book.genre].some((value) =>
        value.toLocaleLowerCase("tr").includes(normalizedQuery),
      );
    });
  const authors = [...new Set(matchingBooks.map((book) => book.author))];
  const genres = [...new Set(matchingBooks.map((book) => book.genre))];

  return (
    <main className="app-screen search-screen">
      <div className="search-hero">
        <div className="search-hero-art" />
        <div className="search-hero-shade" />
        <div className="search-topbar page-width">
          <button onClick={onBack} aria-label="Geri dön" type="button">
            <Icon name="arrow-left" size={24} />
          </button>
          <h1>Arama</h1>
          <span />
        </div>
      </div>
      <div className="search-content page-width">
        <div className="large-search">
          <Icon name="search" size={22} />
          <input
            autoFocus
            aria-label="Kitaplarda ara"
            onChange={(event) => setQuery(event.target.value)}
            value={query}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Aramayı temizle" type="button">
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
        <div className="tabs" role="tablist" aria-label="Arama sonuç türü">
          {[
            ["Kitaplar", matchingBooks.length],
            ["Yazarlar", authors.length],
            ["Türler", genres.length],
          ].map(([item, count]) => (
            <button
              aria-selected={tab === item}
              className={tab === item ? "active" : ""}
              key={String(item)}
              onClick={() => setTab(String(item))}
              role="tab"
              type="button"
            >
              {item} ({count})
            </button>
          ))}
        </div>
        <div className="result-summary">
          <span>{query ? `“${query}” için sonuçlar` : "Filtrelerine uygun sonuçlar"}</span>
          <span>{matchingBooks.length} kitap</span>
        </div>
        <div className="results">
          {tab === "Kitaplar" ? (
            matchingBooks.map((book) => (
              <button
                className="result-row"
                key={book.id}
                onClick={() => setSelectedItem(book)}
                type="button"
              >
                <img className="search-result-cover" alt="" src={book.image} />
                <span className="result-copy">
                  <strong>{book.title}</strong>
                  <small>{book.author}</small>
                  <span className="result-tags">
                    <i>{book.level}</i>
                    <i>{book.genre}</i>
                  </span>
                </span>
                <Icon name="chevron" size={20} />
              </button>
            ))
          ) : (
            <div className="empty-tab">
              <Icon name={tab === "Yazarlar" ? "book" : "layers"} size={30} />
              <strong>
                {tab === "Yazarlar"
                  ? authors.join(", ") || "Yazar bulunamadı"
                  : genres.join(", ") || "Tür bulunamadı"}
              </strong>
              <span>
                {query ? `“${query}” aramanla eşleşen sonuçlar` : "Aktif filtre sonuçları"}
              </span>
            </div>
          )}
        </div>
      </div>
      {selectedItem && (
        <BookDetail
          item={selectedItem}
          languageSupport={languageSupport}
          onClose={() => setSelectedItem(null)}
        />
      )}
      <NavBar />
    </main>
  );
}

function SettingsSheet({
  onClose,
  allLevels,
  setAllLevels,
  userLevel,
  filterLevel,
  setFilterLevel,
  activeGenre,
  setActiveGenre,
  readingDuration,
  setReadingDuration,
  languageSupport,
  setLanguageSupport,
}: {
  onClose: () => void;
  allLevels: boolean;
  setAllLevels: (value: boolean) => void;
  userLevel: string;
  filterLevel: string | null;
  setFilterLevel: (value: string | null) => void;
  activeGenre: string;
  setActiveGenre: (value: string) => void;
  readingDuration: string;
  setReadingDuration: (value: string) => void;
  languageSupport: string;
  setLanguageSupport: (value: string) => void;
}) {
  const [draftAllLevels, setDraftAllLevels] = useState(allLevels);
  const [level, setLevel] = useState(filterLevel || userLevel);
  const [draftGenre, setDraftGenre] = useState(activeGenre);
  const [draftDuration, setDraftDuration] = useState(readingDuration);
  const [draftLanguage, setDraftLanguage] = useState(languageSupport);
  const genreOptions = [
    "Tümü",
    "Macera",
    "Gizem",
    "Klasik",
    "Romantik",
    "Günlük Yaşam",
    "Fantastik",
  ];
  const durationOptions = ["Tümü", "10 dk altı", "10–20 dk", "20 dk üzeri"];
  const languageOptions = ["Türkçe Açık", "Yalnızca İngilizce"];
  const nextOption = (options: string[], current: string) =>
    options[(options.indexOf(current) + 1) % options.length];

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="settings-title"
        aria-modal="true"
        className="settings-sheet"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="drag-handle" />
        <div className="sheet-header">
          <div>
            <span className="sheet-icon">
              <Icon name="filter" size={18} />
            </span>
            <h2 id="settings-title">Kitaplık Ayarları</h2>
          </div>
          <button onClick={onClose} aria-label="Ayarları kapat" type="button">
            <Icon name="close" size={22} />
          </button>
        </div>

        <div className="sheet-scroll">
          <div className="settings-section">
            <h3>Görüntülenen Seviyeler</h3>
            <p>Hangi seviyedeki kitapları görmek istiyorsun?</p>
            <button
              className={`choice-card ${!draftAllLevels ? "selected" : ""}`}
              onClick={() => setDraftAllLevels(false)}
              type="button"
            >
              <Icon name="book" size={25} />
              <span>
                <strong>Seviyeme uygun kitaplar</strong>
                <small>A1 – {level} (Önerilen)</small>
              </span>
              <i className="radio">{!draftAllLevels && "✓"}</i>
            </button>
            <button
              className={`choice-card ${draftAllLevels ? "selected" : ""}`}
              onClick={() => setDraftAllLevels(true)}
              type="button"
            >
              <Icon name="layers" size={25} />
              <span>
                <strong>Tüm seviyeler</strong>
                <small>A1 – C2 (Daha fazla keşfet)</small>
              </span>
              <i className="radio">{draftAllLevels && "✓"}</i>
            </button>
          </div>

          <div className="settings-section">
            <h3>Seviye Filtresi</h3>
            <div className="level-selector">
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((item) => (
                <button
                  className={level === item ? "active" : ""}
                  key={item}
                  onClick={() => setLevel(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Diğer Filtreler</h3>
            <div className="filter-list">
              <button
                onClick={() => setDraftGenre(nextOption(genreOptions, draftGenre))}
                type="button"
              >
                <Icon name="book" size={21} />
                <strong>Tür</strong>
                <span>{draftGenre}</span>
                <Icon name="chevron" size={17} />
              </button>
              <button
                onClick={() => setDraftDuration(nextOption(durationOptions, draftDuration))}
                type="button"
              >
                <Icon name="menu" size={21} />
                <strong>Uzunluk</strong>
                <span>{draftDuration}</span>
                <Icon name="chevron" size={17} />
              </button>
              <button
                onClick={() => setDraftLanguage(nextOption(languageOptions, draftLanguage))}
                type="button"
              >
                <Icon name="language" size={21} />
                <strong>Dil Desteği</strong>
                <span>{draftLanguage}</span>
                <Icon name="chevron" size={17} />
              </button>
            </div>
          </div>
        </div>
        <div className="sheet-footer">
          <button
            className="apply-button"
            onClick={() => {
              setAllLevels(draftAllLevels);
              setFilterLevel(level);
              setActiveGenre(draftGenre);
              setReadingDuration(draftDuration);
              setLanguageSupport(draftLanguage);
              onClose();
            }}
            type="button"
          >
            Uygula
          </button>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<"library" | "search">("library");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allLevels, setAllLevels] = useState(false);
  const [userLevel, setUserLevel] = useState("A2");
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [activeGenre, setActiveGenre] = useState("Tümü");
  const [readingDuration, setReadingDuration] = useState("Tümü");
  const [languageSupport, setLanguageSupport] = useState("Türkçe Açık");
  const [searchQuery, setSearchQuery] = useState("");

  const clearFilters = () => {
    setAllLevels(false);
    setFilterLevel(null);
    setActiveGenre("Tümü");
    setReadingDuration("Tümü");
    setLanguageSupport("Türkçe Açık");
  };

  return (
    <div className="app-root">
      {screen === "library" ? (
        <Library
          activeGenre={activeGenre}
          allLevels={allLevels}
          clearFilters={clearFilters}
          filterLevel={filterLevel}
          languageSupport={languageSupport}
          onOpenFilters={() => setSettingsOpen(true)}
          onSearch={() => setScreen("search")}
          readingDuration={readingDuration}
          searchQuery={searchQuery}
          setActiveGenre={setActiveGenre}
          setAllLevels={setAllLevels}
          setFilterLevel={setFilterLevel}
          setLanguageSupport={setLanguageSupport}
          setReadingDuration={setReadingDuration}
          setSearchQuery={setSearchQuery}
          userLevel={userLevel}
        />
      ) : (
        <SearchScreen
          activeGenre={activeGenre}
          allLevels={allLevels}
          filterLevel={filterLevel}
          languageSupport={languageSupport}
          onBack={() => setScreen("library")}
          query={searchQuery}
          readingDuration={readingDuration}
          setQuery={setSearchQuery}
          userLevel={userLevel}
        />
      )}
      {settingsOpen && (
        <SettingsSheet
          activeGenre={activeGenre}
          allLevels={allLevels}
          filterLevel={filterLevel}
          languageSupport={languageSupport}
          onClose={() => setSettingsOpen(false)}
          readingDuration={readingDuration}
          setActiveGenre={setActiveGenre}
          setAllLevels={setAllLevels}
          setFilterLevel={setFilterLevel}
          setLanguageSupport={setLanguageSupport}
          setReadingDuration={setReadingDuration}
          userLevel={userLevel}
        />
      )}
    </div>
  );
}
