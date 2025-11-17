import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  getApprovedResults,
  getPendingResults,
  getPrograms,
  getStudents,
  getTeams,
} from "@/lib/data";

async function getDashboardData() {
  const [programs, students, pending, approved, teams] = await Promise.all([
    getPrograms(),
    getStudents(),
    getPendingResults(),
    getApprovedResults(),
    getTeams(),
  ]);

  return {
    stats: [
      { label: "Total Programs", value: programs.length },
      { label: "Participants", value: students.length },
      { label: "Pending Results", value: pending.length },
      { label: "Approved Results", value: approved.length },
    ],
    teams,
    pending,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-900/70">
            <p className="text-sm uppercase text-white/60">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5">
          <CardTitle>Team Highlights</CardTitle>
          <CardDescription className="mt-2">Quick roster overview</CardDescription>
          <div className="mt-6 space-y-4">
            {data.teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-lg font-semibold text-white">{team.name}</p>
                  <p className="text-xs text-white/60">Leader · {team.leader}</p>
                </div>
                <p className="text-2xl font-bold text-amber-200">
                  {team.total_points}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white/5">
          <CardTitle>Latest Pending Results</CardTitle>
          <CardDescription className="mt-2">
            Approve or reject from the Pending Results tab.
          </CardDescription>
          <div className="mt-6 space-y-4">
            {data.pending.slice(0, 5).map((result) => (
              <div
                key={result.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-sm text-white/60">Program #{result.program_id}</p>
                <p className="font-semibold text-white">
                  Submitted by {result.submitted_by}
                </p>
                <p className="text-xs text-white/50">
                  {new Date(result.submitted_at).toLocaleString()}
                </p>
              </div>
            ))}
            {data.pending.length === 0 && (
              <p className="text-sm text-white/60">No pending entries.</p>
            )}
          </div>
        </Card>
      </section>
    </>
  );
}

