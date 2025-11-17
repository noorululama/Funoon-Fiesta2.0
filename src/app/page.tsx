import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getLiveScores, getTeams } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

async function getHomeData() {
  const [teams, live] = await Promise.all([
    getTeams(),
    getLiveScores(),
  ]);

  const scoreMap = new Map(live.map((item) => [item.team_id, item.total_points]));
  const sorted = [...teams].sort(
    (a, b) =>
      (scoreMap.get(b.id) ?? b.total_points) -
      (scoreMap.get(a.id) ?? a.total_points),
  );

  return { teams: sorted, live: scoreMap };
}

export default async function HomePage() {
  const { teams, live } = await getHomeData();

  const highlight = teams[0];

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-5 py-16 md:px-8">
      <section className="grid gap-10 rounded-[32px] border border-white/10 bg-gradient-to-r from-indigo-950/80 via-fuchsia-900/40 to-emerald-900/30 p-10 text-white shadow-[0_25px_120px_rgba(236,72,153,0.25)] backdrop-blur-2xl md:grid-cols-2">
        <div className="space-y-6">
          <Badge tone="cyan">Nusa Arts Fest 2025</Badge>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Celebrate teams, talent, and the spirit of Kerala&apos;s biggest arts
            showdown.
          </h1>
          <p className="text-lg text-white/80">
            Follow the live scoreboard, discover the creative squads, and cheer for
            your favourites. Admins and Jury members can manage programs, students,
            and results from their secure portals.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/results">
              <Button>View Approved Results</Button>
            </Link>
            <Link href="/scoreboard">
              <Button variant="secondary">Scoreboards</Button>
            </Link>
          </div>
        </div>
        {highlight && (
          <Card className="h-full bg-white/10">
            <CardTitle>Live leaders — {highlight.name}</CardTitle>
            <CardDescription className="mt-2">
              {highlight.description}
            </CardDescription>
            <div className="mt-8 flex flex-wrap gap-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-white/60">
                  Total Points
                </p>
                <p className="text-5xl font-bold text-rose-200">
                  {formatNumber(live.get(highlight.id) ?? highlight.total_points)}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-white/60">
                  Captain
                </p>
                <p className="text-2xl font-semibold">{highlight.leader}</p>
              </div>
            </div>
          </Card>
        )}
      </section>

      <section className="space-y-6">
        <div>
          <Badge tone="pink">Live Score Pulse</Badge>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Six powerhouse teams. One trophy.
          </h2>
          <p className="text-white/70">
            Points auto-sync once results are approved. Track the frenzy below.
          </p>
        </div>
        <div className="section-grid">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="relative overflow-hidden border border-white/5 bg-slate-900/60"
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ background: `linear-gradient(135deg, ${team.color}, #0f172a)` }}
              />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={`${team.leader_photo}?auto=format&fit=facearea&facepad=2&w=120&h=120`}
                    alt={team.leader}
                    width={72}
                    height={72}
                    className="rounded-2xl border-2 border-white/20 object-cover"
                  />
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>Leader · {team.leader}</CardDescription>
                  </div>
                </div>
                <CardDescription>{team.description}</CardDescription>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white">
                  <div>
                    <p className="text-xs uppercase text-white/60">Contact</p>
                    <p className="font-semibold">{team.contact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-white/60">Points</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(live.get(team.id) ?? team.total_points)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <Badge tone="amber">About The Fest</Badge>
          <h2 className="mt-3 text-3xl font-semibold text-white">Why Arts Fest?</h2>
          <p className="text-white/70">
            A three-day carnival of talent across music, dance, theatre, visual arts,
            and general events. Spread across multiple stages, each moment is judged
            transparently and scored instantly.
          </p>
        </div>
        <div className="section-grid">
          {[
            { title: "Transparency First", copy: "All scoring rules are codified in the platform. Every entry is auto-scored before humans review.", tag: "Automated scoring" },
            { title: "Three Portals", copy: "Public scoreboard, secure admin control, and jury workspace ensure seamless collaboration.", tag: "Role-based access" },
            { title: "Live Updates", copy: "Once admins approve submissions, both team and student scores refresh in seconds.", tag: "Realtime sync" },
          ].map((item) => (
            <Card key={item.title}>
              <Badge tone="emerald">{item.tag}</Badge>
              <CardTitle className="mt-4">{item.title}</CardTitle>
              <CardDescription className="mt-2">{item.copy}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl md:flex md:items-center md:justify-between">
        <div>
          <Badge tone="cyan">Need help?</Badge>
          <h2 className="mt-4 text-3xl font-semibold">Fest Control Room</h2>
          <p className="text-white/70">
            +91 884 776 2234 · festcontrol@nusa.edu · College Stadium, Kochi
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/login">
            <Button variant="secondary">Admin Login</Button>
          </Link>
          <Link href="/jury/login">
            <Button variant="ghost">Jury Login</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
