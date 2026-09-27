import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Archive,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  LogOut,
  Pencil,
  PhoneCall,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";

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

type MessageStatus = "new" | "in_progress" | "completed" | "archived";

type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  subject: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
};

const STATUS_META: Record<
  MessageStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  new: {
    label: "جدید",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  in_progress: {
    label: "در حال پیگیری",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    dotClass: "bg-blue-500",
  },
  completed: {
    label: "تکمیل شده",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  archived: {
    label: "آرشیو",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

const STATUS_ORDER: MessageStatus[] = ["new", "in_progress", "completed", "archived"];

const faDigits = (value: string) => value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);

const formatDate = (iso: string) =>
  faDigits(
    new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso)),
  );

const getAuthErrorMessage = (error: { code: unknown; message: string }) => {
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
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ContactMessage | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMessages = async () => {
    setMessagesLoading(true);
    setMessagesError(null);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setMessagesError("خطا در دریافت پیام‌ها. لطفاً دوباره تلاش کنید.");
    } else {
      setMessages((data ?? []) as unknown as ContactMessage[]);
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

  const statusCounts = useMemo(() => {
    const counts: Record<MessageStatus, number> = {
      new: 0,
      in_progress: 0,
      completed: 0,
      archived: 0,
    };
    for (const m of messages) {
      if (counts[m.status] !== undefined) counts[m.status] += 1;
    }
    return counts;
  }, [messages]);

  const filteredMessages = useMemo(
    () => (statusFilter === "all" ? messages : messages.filter((m) => m.status === statusFilter)),
    [messages, statusFilter],
  );

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

  const handleSetStatus = async (id: string, status: MessageStatus) => {
    setUpdatingStatusId(id);
    setActionError(null);
    const { error } = await supabase
      .from("contact_messages")
      .update({ status } as never)
      .eq("id", id);
    if (error) {
      setActionError("تغییر وضعیت انجام نشد. دسترسی ویرایش در دیتابیس فعال نیست یا دوباره تلاش کنید.");
    } else {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    }
    setUpdatingStatusId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionError(null);
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      setActionError("حذف پیام انجام نشد. دسترسی حذف در دیتابیس فعال نیست یا دوباره تلاش کنید.");
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setActionError(null);
    const { error } = await supabase
      .from("contact_messages")
      .update({
        name: editing.name,
        phone: editing.phone,
        subject: editing.subject,
        message: editing.message,
      })
      .eq("id", editing.id);
    if (error) {
      setActionError("ویرایش پیام انجام نشد. دسترسی ویرایش در دیتابیس فعال نیست یا دوباره تلاش کنید.");
    } else {
      setMessages((prev) => prev.map((m) => (m.id === editing.id ? editing : m)));
      setEditing(null);
    }
    setSavingEdit(false);
  };

  const handleExportExcel = () => {
    const rows = filteredMessages.map((m) => ({
      "نام": m.name,
      "شماره تماس": m.phone,
      "موضوع": m.subject ?? "",
      "پیام": m.message,
      "وضعیت": STATUS_META[m.status]?.label ?? m.status,
      "تاریخ ثبت": formatDate(m.created_at),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 20 }, { wch: 16 }, { wch: 24 }, { wch: 60 }, { wch: 14 }, { wch: 22 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "پیام‌ها");
    XLSX.writeFile(workbook, "arsam-contact-messages.xlsx");
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
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">پیام‌های فرم تماس</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={filteredMessages.length === 0}
            >
              <FileSpreadsheet className="size-4" />
              خروجی اکسل
            </Button>
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
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            همه ({faDigits(String(messages.length))})
          </button>
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                statusFilter === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span className={`size-2 rounded-full ${STATUS_META[status].dotClass}`} />
              {STATUS_META[status].label} ({faDigits(String(statusCounts[status]))})
            </button>
          ))}
        </div>

        {messagesError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {messagesError}
          </div>
        ) : null}

        {actionError ? (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        {!messagesLoading && !messagesError && filteredMessages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            {statusFilter === "all"
              ? "هنوز پیامی ثبت نشده است."
              : `پیامی با وضعیت «${STATUS_META[statusFilter].label}» وجود ندارد.`}
          </div>
        ) : null}

        <ul className="space-y-4">
          {filteredMessages.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-bold text-foreground">{item.name}</span>
                  <a
                    href={`tel:${item.phone}`}
                    dir="ltr"
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {faDigits(item.phone)}
                  </a>
                  <span
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_META[item.status]?.badgeClass ?? ""}`}
                  >
                    <span className={`size-1.5 rounded-full ${STATUS_META[item.status]?.dotClass ?? ""}`} />
                    {STATUS_META[item.status]?.label ?? item.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <time className="text-xs text-muted-foreground">{formatDate(item.created_at)}</time>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing({ ...item })}
                    aria-label="ویرایش پیام"
                  >
                    <Pencil className="size-4" />
                    ویرایش
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmDeleteId(item.id)}
                    aria-label="حذف پیام"
                  >
                    <Trash2 className="size-4" />
                    حذف
                  </Button>
                </div>
              </div>
              {item.subject ? (
                <p className="mt-3 text-sm font-medium text-foreground">موضوع: {item.subject}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {item.message}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="text-xs font-medium text-muted-foreground">تغییر وضعیت:</span>
                {updatingStatusId === item.id ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  STATUS_ORDER.filter((s) => s !== item.status).map((status) => {
                    const Icon =
                      status === "new"
                        ? Sparkles
                        : status === "in_progress"
                          ? PhoneCall
                          : status === "completed"
                            ? CheckCircle2
                            : Archive;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void handleSetStatus(item.id, status)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition hover:opacity-80 ${STATUS_META[status].badgeClass}`}
                      >
                        <Icon className="size-3.5" />
                        {STATUS_META[status].label}
                      </button>
                    );
                  })
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>

      {confirmDeleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold text-foreground">حذف پیام</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              آیا از حذف این پیام مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                انصراف
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === confirmDeleteId}
                onClick={() => void handleDelete(confirmDeleteId)}
              >
                {deletingId === confirmDeleteId ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                حذف شود
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">ویرایش پیام</h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="بستن"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium text-foreground">
                    نام
                  </label>
                  <input
                    id="edit-name"
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-phone" className="text-sm font-medium text-foreground">
                    شماره تماس
                  </label>
                  <input
                    id="edit-phone"
                    dir="ltr"
                    required
                    value={editing.phone}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-left text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-subject" className="text-sm font-medium text-foreground">
                  موضوع
                </label>
                <input
                  id="edit-subject"
                  value={editing.subject ?? ""}
                  onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-message" className="text-sm font-medium text-foreground">
                  پیام
                </label>
                <textarea
                  id="edit-message"
                  required
                  rows={5}
                  value={editing.message}
                  onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
                  انصراف
                </Button>
                <Button type="submit" size="sm" disabled={savingEdit}>
                  {savingEdit ? <Loader2 className="size-4 animate-spin" /> : null}
                  ذخیره تغییرات
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
