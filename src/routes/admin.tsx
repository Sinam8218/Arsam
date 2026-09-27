import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "پنل مدیریت پیام‌ها | آرسام انرژی صنعت" },
      { name: "description", content: "مشاهده و مدیریت پیام‌های ارسال‌شده از فرم تماس وب‌سایت آرسام انرژی صنعت." },
      { property: "og:title", content: "پنل مدیریت پیام‌ها | آرسام انرژی صنعت" },
      { property: "og:description", content: "ورود امن مدیر برای مشاهده پیام‌های وب‌سایت آرسام انرژی صنعت." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  subject: string | null;
  message: string;
  created_at: string;
};

const faDigits = (value: string) => value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);

const formatDate = (iso: string) =>
  faDigits(
    new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso)),
  );

const getAuthErrorMessage = (error: { code?: string; message?: string }) => {
  if (error.code === "email_provider_disabled" || error.message?.includes("Email logins are disabled")) {
    return "ورود با ایمیل در تنظیمات سرویس غیرفعال است. لطفاً روش Email را در بخش Authentication روشن کنید.";
  }
  if (error.code === "email_not_confirmed") {
    return "ایمیل این حساب هنوز تأیید نشده است.";
  }
  if (error.code === "invalid_credentials") {
    return "ایمیل یا رمز عبور اشتباه است.";
  }
  if (error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit") {
    return "تعداد تلاش‌ها زیاد بوده است. چند دقیقه دیگر دوباره امتحان کنید.";
  }
  return "ورود انجام نشد. اتصال اینترنت و تنظیمات حساب را بررسی کنید.";
};

function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const loadMessages = async () => {
    setMessagesLoading(true);
    setMessagesError(null);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, phone, subject, message, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setMessagesError("خطا در دریافت پیام‌ها. لطفاً دوباره تلاش کنید.");
    } else {
      setMessages(data ?? []);
    }
    setMessagesLoading(false);
  };

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setLoggedIn(!error && Boolean(data.user));
      setCheckingSession(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setLoggedIn(Boolean(session));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loggedIn) void loadMessages();
  }, [loggedIn]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(getAuthErrorMessage(error));
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessages([]);
  };

  if (checkingSession) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">ورود به پنل مدیریت</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            برای مشاهده پیام‌های فرم تماس وارد شوید.
          </p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium text-foreground">
                ایمیل
              </label>
              <input
                id="admin-email"
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-left text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                رمز عبور
              </label>
              <input
                id="admin-password"
                type="password"
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-left text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
            {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? <Loader2 className="size-4 animate-spin" /> : "ورود"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">پیام‌های فرم تماس</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadMessages()} disabled={messagesLoading}>
              {messagesLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              به‌روزرسانی
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
              <LogOut className="size-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {messagesError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {messagesError}
          </div>
        ) : null}

        {!messagesLoading && !messagesError && messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            هنوز پیامی ثبت نشده است.
          </div>
        ) : null}

        <ul className="space-y-4">
          {messages.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-foreground">{item.name}</span>
                  <a
                    href={`tel:${item.phone}`}
                    dir="ltr"
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {faDigits(item.phone)}
                  </a>
                </div>
                <time className="text-xs text-muted-foreground">{formatDate(item.created_at)}</time>
              </div>
              {item.subject ? (
                <p className="mt-3 text-sm font-medium text-foreground">موضوع: {item.subject}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {item.message}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
