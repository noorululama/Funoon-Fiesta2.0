import { getApprovedResults, getLiveScores, getPrograms, getStudents, getTeams } from "@/lib/data";
import { ScoreboardTable } from "@/components/scoreboard-table";

async function getScoreboardData() {
  const [teams, programs, results, students, liveScores] = await Promise.all([
    getTeams(),
    getPrograms(),
    getApprovedResults(),
    getStudents(),
    getLiveScores(),
  ]);

  const scoreMap = new Map(liveScores.map((entry) => [entry.team_id, entry.total_points]));

  return { teams, programs, results, students, liveScores: scoreMap };
}

export default async function ScoreboardPage() {
  const data = await getScoreboardData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <ScoreboardTable
        teams={data.teams}
        programs={data.programs}
        results={data.results}
        students={data.students}
        liveScores={data.liveScores}
      />
    </main>
  );
}

