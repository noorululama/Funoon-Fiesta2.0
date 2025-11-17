import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ADMIN_COOKIE } from "@/lib/config";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/jury", label: "Jury" },
  { href: "/admin/assign", label: "Assignments" },
  { href: "/admin/add-result", label: "Add Result" },
  { href: "/admin/pending-results", label: "Pending Results" },
  { href: "/admin/approved-results", label: "Approved Results" },
];

async function logoutAction() {
  "use server";
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export default function AdminSecureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950/95 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10 md:px-8">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase text-white/60">Admin Deck</p>
            <h1 className="text-2xl font-semibold">Fest Command Center</h1>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </header>
        <nav className="flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <section className="space-y-10">{children}</section>
      </div>
    </div>
  );
}

