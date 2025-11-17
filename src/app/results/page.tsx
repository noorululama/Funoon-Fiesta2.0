import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getApprovedResults,
  getJuries,
  getPrograms,
  getStudents,
  getTeams,
} from "@/lib/data";

interface ResultsPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function getData(query: string | undefined) {
  const [results, programs, students, teams, juries] = await Promise.all([
    getApprovedResults(),
    getPrograms(),
    getStudents(),
    getTeams(),
    getJuries(),
  ]);

  const programMap = new Map(programs.map((p) => [p.id, p]));
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const juryMap = new Map(juries.map((j) => [j.id, j]));

  const normalized = query?.trim().toLowerCase();
  const filtered = normalized
    ? results.filter((result) => {
        const program = programMap.get(result.program_id);
        const programMatch = program?.name.toLowerCase().includes(normalized);
        const entryMatch = result.entries.some((entry) => {
          const student = entry.student_id
            ? studentMap.get(entry.student_id)
            : undefined;
          const team = entry.team_id ? teamMap.get(entry.team_id) : undefined;
          return (
            student?.name.toLowerCase().includes(normalized ?? "") ||
            student?.chest_no.toLowerCase().includes(normalized ?? "") ||
            team?.name.toLowerCase().includes(normalized ?? "")
          );
        });
        return Boolean(programMatch || entryMatch);
      })
    : results;

  return {
    results: filtered,
    programMap,
    studentMap,
    teamMap,
    juryMap,
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { q } = await searchParams;
  const data = await getData(q);

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-5 py-16 md:px-8">
      <div className="space-y-4">
        <Badge tone="amber">Results Board</Badge>
        <h1 className="text-4xl font-bold text-white">Approved Results</h1>
        <p className="text-white/70">
          Search by student name, chest number, or program to relive the winning
          moments. All entries here are reviewed and locked.
        </p>
      </div>

      <form method="GET" className="flex flex-col gap-4 md:flex-row">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search student, chest no, or program..."
          className="flex-1"
        />
        <button className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10">
          Search
        </button>
      </form>

      <div className="space-y-6">
        {data.results.length === 0 && (
          <Card>
            <CardTitle>No approved results yet</CardTitle>
            <CardDescription className="mt-2">
              Keep an eye out — once the jury submits and admin approves, you’ll see
              the podium placements here.
            </CardDescription>
            <Link
              href="/scoreboard"
              className="mt-6 inline-flex text-sm text-cyan-300 hover:text-cyan-200"
            >
              Go to live scoreboard →
            </Link>
          </Card>
        )}

        {data.results.map((result) => {
          const program = data.programMap.get(result.program_id);
          const juryName =
            data.juryMap.get(result.jury_id)?.name ?? result.submitted_by;
          return (
            <Card key={result.id} className="border-white/5 bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle>{program?.name}</CardTitle>
                  <CardDescription>
                    Section: {program?.section ?? "—"} · Category:{" "}
                    {program?.category ?? "—"}
                  </CardDescription>
                </div>
                <Badge tone="cyan">Jury: {juryName}</Badge>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {result.entries.map((entry) => {
                  const student = entry.student_id
                    ? data.studentMap.get(entry.student_id)
                    : undefined;
                  const team = entry.team_id
                    ? data.teamMap.get(entry.team_id)
                    : student
                      ? data.teamMap.get(student.team_id)
                      : undefined;
                  return (
                    <div
                      key={`${result.id}-${entry.position}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-sm uppercase text-white/60">
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
                        <p className="text-sm text-white/70">
                          Chest #{student.chest_no}
                        </p>
                      )}
                      {team && (
                        <p className="text-xs uppercase text-white/50">
                          {team.name}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-emerald-200">
                        Score: {entry.score}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-white/50">
                Approved on {new Date(result.submitted_at).toLocaleString()}
              </p>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

