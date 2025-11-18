import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SearchSelect } from "@/components/ui/search-select";
import {
  assignProgramToJury,
  getAssignments,
  getJuries,
  getPrograms,
} from "@/lib/data";

const assignmentSchema = z.object({
  program_id: z.string().min(2),
  jury_id: z.string().min(2),
});

async function assignProgramAction(formData: FormData) {
  "use server";
  const parsed = assignmentSchema.safeParse({
    program_id: formData.get("program_id"),
    jury_id: formData.get("jury_id"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const payload = parsed.data;
  await assignProgramToJury(payload.program_id, payload.jury_id);
  revalidatePath("/admin/assign");
}

export default async function AssignProgramPage() {
  const [programs, juries, assignments] = await Promise.all([
    getPrograms(),
    getJuries(),
    getAssignments(),
  ]);
  const programMap = new Map(programs.map((program) => [program.id, program]));
  const juryMap = new Map(juries.map((jury) => [jury.id, jury]));
  const programOptions = programs.map((program) => ({
    value: program.id,
    label: program.name,
    meta: `${program.section} · Cat ${program.category}${program.stage ? " · On stage" : " · Off stage"}`,
  }));
  const juryOptions = juries.map((jury) => ({
    value: jury.id,
    label: jury.name,
  }));

  return (
    <div className="space-y-8">
      <Card>
        <CardTitle>Assign Program to Jury</CardTitle>
        <CardDescription className="mt-2">
          Each pairing stays unique to avoid duplicate evaluations.
        </CardDescription>
        <form
          action={assignProgramAction}
          className="mt-6 grid gap-4 md:grid-cols-3"
        >
          <SearchSelect
            name="program_id"
            required
            options={programOptions}
            defaultValue={programOptions[0]?.value}
            placeholder="Search program..."
          />
          <SearchSelect
            name="jury_id"
            required
            options={juryOptions}
            defaultValue={juryOptions[0]?.value}
            placeholder="Search jury..."
          />
          <Button type="submit">Assign</Button>
        </form>
      </Card>

      <Card className="bg-slate-900/70">
        <CardTitle>Assignments</CardTitle>
        <CardDescription className="mt-2">
          Status auto-updates when jury submits.
        </CardDescription>
        <div className="mt-6 space-y-3">
          {assignments.map((assignment) => (
            <div
              key={`${assignment.program_id}-${assignment.jury_id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-sm text-white/60">
                  {programMap.get(assignment.program_id)?.name}
                </p>
                <p className="text-xs text-white/40">
                  Jury · {juryMap.get(assignment.jury_id)?.name}
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs uppercase tracking-wide">
                {assignment.status}
              </span>
            </div>
          ))}
          {assignments.length === 0 && (
            <p className="text-sm text-white/60">No assignments yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

