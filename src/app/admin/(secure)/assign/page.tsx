import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SearchSelect } from "@/components/ui/search-select";
import { AssignmentManager } from "@/components/assignment-manager";
import {
  assignProgramToJury,
  deleteAssignment,
  getApprovedResults,
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
  try {
    await assignProgramToJury(payload.program_id, payload.jury_id);
  } catch (error: any) {
    // Handle duplicate assignment error
    if (error.message.includes("already assigned")) {
      // Silently succeed if already assigned (idempotent operation)
      // Could show a success message instead if desired
    } else if (error.message.includes("already published")) {
      // Show error for approved programs
      throw new Error(error.message);
    } else {
      throw new Error(`Failed to assign program: ${error.message}`);
    }
  }
  revalidatePath("/admin/assign");
}

async function deleteAssignmentAction(formData: FormData) {
  "use server";
  const programId = String(formData.get("program_id") ?? "");
  const juryId = String(formData.get("jury_id") ?? "");
  
  if (!programId || !juryId) {
    throw new Error("Program ID and Jury ID are required");
  }

  await deleteAssignment(programId, juryId);
  revalidatePath("/admin/assign");
}

export default async function AssignProgramPage() {
  const [programs, juries, assignments, approvedResults] = await Promise.all([
    getPrograms(),
    getJuries(),
    getAssignments(),
    getApprovedResults(),
  ]);

  // Filter out programs that are already approved/published
  const approvedProgramIds = new Set(approvedResults.map((result) => result.program_id));
  const availablePrograms = programs.filter((p) => !approvedProgramIds.has(p.id));

  // Ensure we have valid data
  const validPrograms = availablePrograms.filter((p) => p?.id && p?.name);
  const validJuries = juries.filter((j) => j?.id && j?.name);
  const validAssignments = assignments.filter(
    (a) => a?.program_id && a?.jury_id && a?.status,
  );

  const programOptions = validPrograms.map((program) => ({
    value: program.id,
    label: program.name,
    meta: `${program.section} · Cat ${program.category}${program.stage ? " · On stage" : " · Off stage"}`,
  }));
  const juryOptions = validJuries.map((jury) => ({
    value: jury.id,
    label: jury.name,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-row gap-4">
        <Card className="flex-1">
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
      </div>

      <AssignmentManager
        assignments={validAssignments}
        programs={validPrograms}
        juries={validJuries}
        deleteAction={deleteAssignmentAction}
      />
    </div>
  );
}

