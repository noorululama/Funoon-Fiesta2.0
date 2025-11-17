import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  getApprovedResults,
  getJuries,
  getPrograms,
  getStudents,
  getTeams,
} from "@/lib/data";

export default async function ApprovedResultsAdminPage() {
  const [results, programs, students, teams, juries] = await Promise.all([
    getApprovedResults(),
    getPrograms(),
    getStudents(),
    getTeams(),
    getJuries(),
  ]);

  const programMap = new Map(programs.map((program) => [program.id, program]));
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const juryMap = new Map(juries.map((jury) => [jury.id, jury]));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Approved Results</h1>
      {results.length === 0 && (
        <Card>
          <CardTitle>No approved entries</CardTitle>
          <CardDescription>Approve pending results to publish.</CardDescription>
        </Card>
      )}
      <div className="space-y-5">
        {results.map((result) => (
          <Card key={result.id} className="bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{programMap.get(result.program_id)?.name}</CardTitle>
                <CardDescription>
                  Jury · {juryMap.get(result.jury_id)?.name}
                </CardDescription>
              </div>
              <p className="text-xs text-white/50">
                Approved on {new Date(result.submitted_at).toLocaleString()}
              </p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {result.entries.map((entry) => {
                const student = entry.student_id
                  ? studentMap.get(entry.student_id)
                  : undefined;
                const team = entry.team_id
                  ? teamMap.get(entry.team_id)
                  : student
                    ? teamMap.get(student.team_id)
                    : undefined;
                return (
                  <div
                    key={`${result.id}-${entry.position}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm uppercase text-white/50">
                      {entry.position === 1
                        ? "1st Place"
                        : entry.position === 2
                          ? "2nd Place"
                          : "3rd Place"}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {student?.name ?? team?.name ?? "—"}
                    </p>
                    {student && (
                      <p className="text-xs text-white/60">
                        Chest #{student.chest_no}
                      </p>
                    )}
                    {team && (
                      <p className="text-xs text-white/50">{team.name}</p>
                    )}
                    <p className="mt-2 text-sm text-emerald-200">
                      Score: {entry.score}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

