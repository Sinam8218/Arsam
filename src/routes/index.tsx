import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Factory,
  Flame,
  FlaskConical,
  Layers3,
  Mail,
  Menu,
  PenTool,
  Phone,
  Settings2,
  ShieldCheck,
  Pill,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import heroImage from "../assets/plate-heat-exchanger-hero.jpg";
import industriesImage from "../assets/industrial-applications.jpg";
import brandSymbolUrl from "../assets/arsam-logo-symbol.png";
const brandSymbolAsset = { url: brandSymbolUrl };
import brandLockupUrl from "../assets/arsam-logo-full.png";
const brandLockupAsset = { url: brandLockupUrl };
import { Button } from "../components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "آرسام انرژی صنعت | طراحی و ساخت تجهیزات حرارتی" },
      {
        name: "description",
        content:
          "آرسام انرژی صنعت؛ طراحی و ساخت مبدل‌های حرارتی صفحه‌ای، قالب پلیت و تجهیزات فرایندی برای صنایع ایران.",
      },
      { property: "og:title", content: "آرسام انرژی صنعت | تجهیزات حرارتی" },
      {
        property: "og:description",
        content: "راهکارهای مهندسی برای طراحی و تولید مبدل حرارتی صفحه‌ای و پلیت.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const services = [
  {
    icon: Layers3,
    number: "۰۱",
    title: "طراحی و تولید مبدل صفحه‌ای",
    description:
      "طراحی حرارتی و مکانیکی بر اساس شرایط واقعی فرایند، انتخاب متریال و ساخت متناسب با نیاز هر پروژه.",
  },
  {
    icon: PenTool,
    number: "۰۲",
    title: "طراحی قالب پلیت",
    description:
      "طراحی مهندسی الگوی پلیت و قالب‌های فرم‌دهی با تمرکز بر توزیع جریان، انتقال حرارت و قابلیت تولید.",
  },
  {
    icon: Factory,
    number: "۰۳",
    title: "تولید پلیت مبدل",
    description:
      "ساخت پلیت‌های مبدل صفحه‌ای با کنترل ابعادی و بررسی کیفیت سطح، متناسب با مشخصات فنی سفارش.",
  },
  {
    icon: Settings2,
    number: "۰۴",
    title: "مشاوره و طراحی",
    description:
      "بررسی فنی فرایند، بهینه‌سازی تجهیزات موجود و ارائه راهکار برای افزایش بازده و کاهش اتلاف انرژی.",
  },
];

const industryGroups = [
  {
    icon: Flame,
    title: "انرژی",
    items: ["پالایش نفت", "تولید قیر", "تولید اتانول"],
  },
  {
    icon: Building2,
    title: "تأسیسات، گرمایش و تبرید",
    items: [
      "تأمین آب گرم مصرفی (DHW)",
      "گرمایش استخر، جکوزی و سونا",
      "حرارت مرکزی؛ گرمایش آب رادیاتور و فن‌کویل‌ها",
    ],
  },
  {
    icon: Sparkles,
    title: "صنایع غذایی",
    items: ["فراوری محصولات لبنی", "فراوری روغن خوراکی (Edible Oil Processing)"],
  },
  {
    icon: FlaskConical,
    title: "صنایع شیمیایی",
    items: ["فرایندهای شیمیایی و پتروشیمی"],
  },
  {
    icon: Pill,
    title: "صنایع دارویی",
    items: ["فرایندهای تولید دارو"],
  },
];

const process = [
  { number: "۱", title: "دریافت اطلاعات", text: "بررسی شرایط کاری، سیالات، دما، فشار و ظرفیت مورد نیاز" },
  { number: "۲", title: "مهندسی و طراحی", text: "محاسبات حرارتی، انتخاب آرایش مناسب و طراحی مکانیکی" },
  { number: "۳", title: "ساخت و کنترل", text: "تولید مطابق مشخصات تأییدشده و اجرای کنترل‌های کیفی" },
  { number: "۴", title: "تحویل و پشتیبانی", text: "ارائه مستندات فنی، تحویل تجهیز و همراهی پس از اجرا" },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<"empty" | "failed" | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const industry = String(data.get("industry") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !phone || !message) {
      setSubmitError("empty");
      return;
    }
    setSending(true);
    setSubmitError(null);
    const subject = [company, industry].filter(Boolean).join(" — ") || null;
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, phone, subject, message });
    setSending(false);
    if (error) {
      console.error("contact_messages insert failed:", error);
      setSubmitError("failed");
      return;
    }
    form.reset();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="brand-lockup" aria-label="آرسام انرژی صنعت — صفحه اصلی">
            <BrandLockup />
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="منوی اصلی">
            {[
              ["خدمات", "#services"],
              ["توانمندی‌ها", "#capabilities"],
              ["صنایع", "#industries"],
              ["فرایند همکاری", "#process"],
              ["درباره ما", "#about"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="text-sm font-semibold text-foreground/75 transition-colors hover:text-primary">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button asChild variant="accent">
              <a href="#contact">درخواست مشاوره <ArrowLeft className="size-4" /></a>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-14 shrink-0 rounded-xl border-2 border-primary/20 bg-surface text-primary shadow-sm lg:hidden"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="size-8" strokeWidth={2.25} /> : <Menu className="size-8" strokeWidth={2.25} />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="border-t border-border bg-background px-5 py-5 lg:hidden" aria-label="منوی موبایل">
            <div className="mx-auto grid max-w-7xl gap-1">
              {[
                ["خدمات", "#services"],
                ["توانمندی‌ها", "#capabilities"],
                ["صنایع", "#industries"],
                ["فرایند همکاری", "#process"],
                ["درباره ما", "#about"],
                ["تماس با ما", "#contact"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border/60 py-3 text-sm font-semibold last:border-0"
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <section id="top" className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-foreground">
        <img
          src={heroImage}
          alt="مبدل حرارتی صفحه‌ای در محیط صنعتی"
          width={1600}
          height={1100}
          fetchPriority="high"
          className="hero-image absolute inset-0 size-full object-cover object-[38%_center] opacity-70"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-16 lg:px-8">
          <div className="max-w-3xl text-primary-foreground">
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-safety">
              <span className="h-px w-12 bg-safety" />
              طراحی مهندسی برای صنایع ایران
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.35] sm:text-5xl lg:text-6xl lg:leading-[1.3]">
              طراحی و ساخت تجهیزات
              <span className="block text-accent">حرارتی و فرایندی</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base font-light leading-9 text-primary-foreground/80 sm:text-lg">
              راهکارهای یکپارچه مهندسی؛ از تحلیل مسئله و محاسبات دقیق تا طراحی، ساخت و پشتیبانی فنی.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <a href="#contact">مشاوره مهندسی <ArrowLeft className="size-5" /></a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/45 bg-transparent text-primary-foreground hover:border-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <a href="#services">مشاهده خدمات</a>
              </Button>
            </div>
          </div>
        </div>
        <div className="hero-values absolute inset-x-0 bottom-0 hidden border-t border-primary-foreground/15 bg-primary/75 backdrop-blur-md lg:block">
          <div className="mx-auto grid max-w-7xl grid-cols-4 px-8">
            {["طراحی و مهندسی", "ساخت و تولید", "تأمین و بازرگانی", "پشتیبانی فنی"].map((item, index) => (
              <div key={item} className="flex items-center gap-4 border-l border-primary-foreground/15 px-7 py-6 last:border-r">
                <span className="text-xs font-bold text-accent">۰{index + 1}</span>
                <span className="text-sm font-semibold text-primary-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <a
          href="#intro"
          aria-label="ادامه صفحه"
          className="absolute bottom-28 left-8 hidden flex-col items-center gap-2 text-primary-foreground/60 md:flex"
        >
          <span className="text-xs">ادامه</span>
          <ChevronDown className="size-5 animate-bounce" />
        </a>
      </section>

      <section id="intro" className="border-b border-border bg-background py-20 lg:py-28">
        <div className="reveal mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8">
          <div>
            <SectionLabel>تخصص ما، بهره‌وری انرژی شما</SectionLabel>
            <h2 className="mt-5 text-3xl font-extrabold leading-[1.5] sm:text-4xl">مهندسی دقیق برای یک مسئله واقعی</h2>
          </div>
          <div className="border-r-2 border-industrial pr-6">
            <p className="text-base leading-9 text-muted-foreground sm:text-lg">
              انتخاب یک مبدل حرارتی مناسب تنها به ظرفیت اسمی محدود نیست. نوع سیال، دما، فشار، رسوب‌گذاری، افت فشار مجاز و شرایط نگهداری، همگی باید در طراحی دیده شوند. ما مسئله را از نگاه فرایند بررسی می‌کنیم و راهکاری متناسب با همان پروژه ارائه می‌دهیم.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["طراحی مبتنی بر داده", "ساخت متناسب با سفارش", "همراهی فنی پروژه"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-bold">
                  <CheckCircle2 className="size-5 shrink-0 text-industrial" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="brand-statement bg-primary py-16 text-primary-foreground lg:py-20">
        <div className="reveal mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-safety">
            <span className="h-px w-12 bg-safety" />
            تعهد آرسام
          </div>
          <p className="mt-6 max-w-4xl text-2xl font-extrabold leading-[1.8] sm:text-3xl lg:text-4xl">
            مشکلات صنعتی شما و مسائلی که برای حل آن‌ها به یک تیم مهندسی قدرتمند نیاز دارید، <span className="text-accent">اینجا حل می‌شود.</span>
          </p>
        </div>
      </section>

      <section id="services" className="industrial-grid bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="reveal max-w-2xl">
            <SectionLabel>حوزه‌های فعالیت</SectionLabel>
            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">راهکارهای تخصصی آرسام</h2>
            <p className="mt-4 leading-8 text-muted-foreground">تمرکز ما بر زنجیره کامل طراحی تا تولید مبدل‌های حرارتی صفحه‌ای و اجزای اصلی آن است.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="service-card reveal group relative flex h-full flex-col rounded-xl border border-border bg-background p-7 transition-all" style={{ animationDelay: `${index * 90}ms` }}>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl font-light text-muted-foreground/40 group-hover:text-primary-foreground/30">{service.number}</span>
                    <span className="grid size-12 place-items-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground">
                      <Icon className="size-6" strokeWidth={1.7} />
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-extrabold leading-8 group-hover:text-primary-foreground">{service.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground group-hover:text-primary-foreground/75">{service.description}</p>
                  <a href="#contact" className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold text-primary opacity-70 transition-opacity hover:opacity-100 group-hover:text-safety group-hover:opacity-100">
                    بررسی نیاز پروژه <ArrowUpLeft className="size-4" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="capabilities" className="capabilities-section relative overflow-hidden py-20 text-primary-foreground lg:py-28">
        <div className="pointer-events-none absolute -left-32 top-1/3 size-96 rounded-full bg-industrial/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-safety/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="reveal">
            <SectionLabel light>دقت در تمام مراحل</SectionLabel>
            <h2 className="mt-5 text-3xl font-extrabold leading-[1.5] sm:text-4xl">از محاسبه تا کنترل نهایی، یک مسیر مهندسی منسجم</h2>
            <p className="mt-6 leading-9 text-primary-foreground/70">
              هدف ما ارائه تجهیزی است که در شرایط واقعی کار کند؛ بنابراین تصمیم‌های طراحی، انتخاب مواد، روش تولید و کنترل‌های نهایی در یک زنجیره پیوسته دیده می‌شوند.
            </p>
            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {[
                [ClipboardCheck, "بررسی مشخصات فنی", "ثبت و کنترل داده‌های کلیدی هر پروژه"],
                [Layers3, "طراحی یکپارچه", "هماهنگی طراحی حرارتی و مکانیکی"],
                [ShieldCheck, "کنترل کیفیت", "کنترل ابعادی و ارزیابی مراحل ساخت"],
                [Wrench, "پشتیبانی فنی", "همراهی در انتخاب، نصب و بهره‌برداری"],
              ].map(([Icon, title, text]) => {
                const CapabilityIcon = Icon as typeof ClipboardCheck;
                return (
                  <div key={title as string} className="flex gap-4 border-t border-primary-foreground/15 pt-5">
                    <CapabilityIcon className="mt-1 size-6 shrink-0 text-safety" strokeWidth={1.7} />
                    <div>
                      <h3 className="font-bold">{title as string}</h3>
                      <p className="mt-2 text-xs leading-6 text-primary-foreground/60">{text as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            <div className="reveal relative overflow-hidden rounded-2xl border border-primary-foreground/15 bg-gradient-to-bl from-primary-foreground/10 via-primary-foreground/5 to-transparent p-6 shadow-2xl backdrop-blur-sm sm:p-10">
             <div className="absolute -right-px top-0 h-20 w-1 rounded-full bg-safety" />
             <p className="text-sm font-bold text-safety">اطلاعات فنی پروژه</p>
             <div className="mt-7 space-y-6">
               {[
                 ["نوع و ترکیب سیالات", "مبنای انتخاب متریال و طراحی مسیر جریان"],
                 ["دبی، دما و فشار", "ورودی محاسبات انتقال حرارت و استحکام"],
                 ["افت فشار مجاز", "عامل تعیین‌کننده آرایش و سطح انتقال"],
                 ["شرایط بهره‌برداری", "مبنای دسترسی، نظافت و نگهداری تجهیز"],
               ].map(([title, text], index) => (
                 <div key={title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                   <span className="grid size-10 place-items-center rounded-xl border border-safety/40 bg-safety/10 text-sm font-bold text-safety">{["۰۱", "۰۲", "۰۳", "۰۴"][index]}</span>
                  <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-xs leading-6 text-primary-foreground/55">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="industries" className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="reveal grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="lg:pl-8">
              <SectionLabel>صنایع و کاربردها</SectionLabel>
              <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">کاربردها در صنایع مختلف</h2>
              <p className="mt-5 leading-8 text-muted-foreground">از تأمین آب گرم مصرفی تا فرایندهای پالایش نفت؛ مبدل‌های صفحه‌ای هر جا که تبادل حرارت دقیق و ابعاد فشرده اهمیت دارد به کار می‌روند.</p>
            </div>
            <figure className="group relative aspect-[16/8.5] overflow-hidden rounded-2xl bg-surface shadow-xl">
              <img
                src={industriesImage}
                alt="مبدل حرارتی صفحه‌ای در یک مجموعه صنعتی مدرن"
                width={1600}
                height={1000}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-y-0 right-0 w-1.5 bg-accent" />
            </figure>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industryGroups.map(({ icon: Icon, title, items }, index) => (
              <div key={title} className="reveal overflow-hidden rounded-xl border border-industrial/15 bg-gradient-to-bl from-secondary via-surface to-background p-7 transition-all duration-300 hover:-translate-y-1 hover:border-industrial/30 hover:shadow-lg" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-industrial/10 text-industrial">
                    <Icon className="size-5" strokeWidth={1.7} />
                  </span>
                  <h3 className="font-extrabold">{title}</h3>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-7 text-muted-foreground">
                      <span className="mt-3 size-1.5 shrink-0 rounded-full bg-safety" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="border-y border-border bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="reveal text-center">
            <SectionLabel>فرایند همکاری</SectionLabel>
            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">مسیر روشن از نیاز تا راهکار</h2>
          </div>
          <div className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-4">
            <div className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-border md:block" />
            {process.map((item, index) => (
              <div key={item.number} className="reveal relative text-center" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="relative mx-auto grid size-14 place-items-center rounded-full border-2 border-industrial bg-surface text-lg font-extrabold text-industrial">{item.number}</span>
                <h3 className="mt-6 font-extrabold">{item.title}</h3>
                <p className="mx-auto mt-3 max-w-56 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-background py-20 lg:py-28">
        <div className="reveal mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12">
            <BrandMark decorative />
            <p className="text-sm font-bold text-safety">چشم‌انداز مجموعه</p>
            <blockquote className="relative mt-5 text-2xl font-bold leading-[1.7] sm:text-3xl">
              بهتر برای انرژی، روشن‌تر برای آینده
            </blockquote>
          </div>
          <div>
            <SectionLabel>درباره آرسام انرژی صنعت</SectionLabel>
            <h2 className="mt-5 text-3xl font-extrabold leading-[1.5] sm:text-4xl">دانش مهندسی، تجربه صنعتی و نگاه ساخت‌محور</h2>
            <p className="mt-6 leading-9 text-muted-foreground">
              تیم ما دانش‌آموختگان مهندسی مکانیک در گرایش‌های طراحی کاربردی، ساخت و تولید و حرارت و سیالات است؛ با سابقه کار در صنایع مختلف حرارتی و در شرکت تولیدکننده مبدل حرارتی.
            </p>
            <p className="mt-4 rounded-lg border-r-2 border-safety bg-surface p-4 text-sm leading-7 text-muted-foreground">
              آرسام انرژی صنعت با تمرکز بر کیفیت طراحی، قابلیت ساخت و عملکرد پایدار تجهیزات، برای مسائل واقعی صنعت راهکار ارائه می‌دهد.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section bg-primary py-20 text-primary-foreground lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="reveal">
            <SectionLabel light>تماس و مشاوره</SectionLabel>
            <h2 className="mt-5 text-3xl font-extrabold leading-[1.5] sm:text-4xl">مسئله صنعتی شما، نقطه شروع همکاری ماست.</h2>
            <p className="mt-5 leading-8 text-primary-foreground/70">برای شروع، مشخصات سیال، دبی، دما و فشار کاری را در اختیار ما قرار دهید تا امکان بررسی اولیه فراهم شود.</p>
            <div className="mt-9 space-y-4">
              <div className="flex items-center gap-4 border-t border-primary-foreground/15 pt-4">
                <Phone className="size-5 text-safety" />
                <div>
                  <p className="text-xs text-primary-foreground/50">شماره تماس</p>
                  <a href="tel:+989014587151" dir="ltr" className="mt-1 block text-sm font-bold transition-colors hover:text-safety">۰۹۰۱ ۴۵۸ ۷۱ ۵۱</a>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="reveal rounded-2xl bg-background p-6 text-foreground shadow-xl sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی" name="name" placeholder="نام شما" />
              <Field label="نام شرکت" name="company" placeholder="نام مجموعه" />
              <Field label="شماره تماس" name="phone" placeholder="۰۹۱۲ ..." inputMode="tel" />
              <Field label="حوزه صنعت" name="industry" placeholder="مثلاً پتروشیمی" />
            </div>
            <label className="mt-5 block text-sm font-bold">
              توضیح کوتاه پروژه
              <textarea name="message" rows={4} placeholder="نیاز یا مسئله فنی خود را بنویسید" className="mt-2 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </label>
            {submitted ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-industrial bg-secondary p-4 text-sm leading-7">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-industrial" />
                پیام شما ثبت شد؛ به‌زودی برای بررسی نیاز پروژه با شما تماس می‌گیریم.
              </div>
            ) : (
              <>
                {submitError === "empty" && (
                  <p className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    لطفاً نام، شماره تماس و توضیح پروژه را کامل کنید و دوباره تلاش کنید.
                  </p>
                )}
                {submitError === "failed" && (
                  <p className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید یا با شماره ۰۹۰۱ ۴۵۸ ۷۱ ۵۱ تماس بگیرید.
                  </p>
                )}
                <Button type="submit" variant="accent" size="lg" disabled={sending} className="mt-6 w-full sm:w-auto">
                  {sending ? "در حال ارسال..." : "ثبت درخواست بررسی"} <ArrowLeft className="size-5" />
                </Button>
              </>
            )}
          </form>
        </div>
      </section>

      <footer className="bg-foreground py-10 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 text-center sm:flex-row sm:text-right lg:px-8">
          <div className="brand-lockup brand-lockup-light">
            <BrandLockup footer />
          </div>
          <p className="text-xs text-primary-foreground/45">طراحی و ساخت تجهیزات و سیستم‌های انرژی</p>
        </div>
      </footer>
    </main>
  );
}

function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-xs font-extrabold ${light ? "text-safety" : "text-industrial"}`}>
      <span className={`h-px w-9 ${light ? "bg-safety" : "bg-industrial"}`} />
      {children}
    </div>
  );
}

function BrandMark({ decorative = false }: { decorative?: boolean }) {
  return (
    <span className={decorative ? "brand-mark brand-mark-decorative" : "brand-mark"} aria-hidden="true">
      <img src={brandSymbolAsset.url} alt="" className="size-full object-contain" />
    </span>
  );
}

function BrandLockup({ footer = false }: { footer?: boolean }) {
  return (
    <img
      src={brandLockupAsset.url}
      alt="آرسام انرژی صنعت — طراحی و ساخت تجهیزات و سیستم‌های انرژی"
      className={footer ? "brand-lockup-image brand-lockup-image-footer" : "brand-lockup-image"}
    />
  );
}

function Field({
  label,
  name,
  placeholder,
  inputMode,
}: {
  label: string;
  name: string;
  placeholder: string;
  inputMode?: "tel";
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input name={name} inputMode={inputMode} placeholder={placeholder} className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20" />
    </label>
  );
}