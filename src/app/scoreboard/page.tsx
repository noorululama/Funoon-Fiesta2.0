import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getLiveScores, getStudents, getTeams } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

async function getScoreboards() {
  const [students, liveScores, teams] = await Promise.all([
    getStudents(),
    getLiveScores(),
    getTeams(),
  ]);

  const studentBoard = [...students]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 20);

  const scoreMap = new Map(liveScores.map((entry) => [entry.team_id, entry]));
  const teamBoard = [...teams].sort(
    (a, b) =>
      (scoreMap.get(b.id)?.total_points ?? b.total_points) -
      (scoreMap.get(a.id)?.total_points ?? a.total_points),
  );

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  return { studentBoard, teamBoard, scoreMap, teamMap };
}

export default async function ScoreboardPage() {
  const data = await getScoreboards();

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-5 py-16 md:px-8">
      <header className="space-y-4">
        <Badge tone="cyan">Live Leaderboard</Badge>
        <h1 className="text-4xl font-bold text-white">
          Student & Team Scoreboard
        </h1>
        <p className="text-white/70">
          Rankings refresh the moment an admin approves results. Keep cheering!
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        <Card className="bg-slate-900/70">
          <CardTitle>Student Leaderboard</CardTitle>
          <CardDescription className="mt-1">
            Sorted by total individual points across events.
          </CardDescription>
          <div className="mt-6 space-y-3">
            {data.studentBoard.map((student, index) => {
              const team = data.teamMap.get(student.team_id);
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-white/60">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{student.name}</p>
                      <p className="text-xs text-white/50">
                        Chest #{student.chest_no} · {team?.name ?? "N/A"}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-emerald-200">
                    {formatNumber(student.total_points)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-slate-900/70">
          <CardTitle>Team Scoreboard</CardTitle>
          <CardDescription className="mt-1">
            Aggregated totals streamed from the live scoring service.
          </CardDescription>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="text-xs uppercase text-white/60">
                <tr>
                  <th className="px-3 py-2">Rank</th>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-3 py-2">Leader</th>
                  <th className="px-3 py-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {data.teamBoard.map((team, index) => (
                  <tr key={team.id} className="border-t border-white/10">
                    <td className="px-3 py-2 font-semibold text-white/70">
                      #{index + 1}
                    </td>
                    <td className="px-3 py-2">{team.name}</td>
                    <td className="px-3 py-2">{team.leader}</td>
                    <td className="px-3 py-2 text-right font-bold text-amber-200">
                      {formatNumber(
                        data.scoreMap.get(team.id)?.total_points ?? team.total_points,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </main>
  );
}

