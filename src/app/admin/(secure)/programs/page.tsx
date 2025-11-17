import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createProgram,
  deleteProgramById,
  getPrograms,
  updateProgramById,
} from "@/lib/data";

const programSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Program name is required"),
  section: z.enum(["single", "group", "general"]),
  stage: z.enum(["true", "false"]),
  category: z.enum(["A", "B", "C", "none"]),
});

async function mutateProgram(
  formData: FormData,
  mode: "create" | "update",
) {
  const parsed = programSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    section: formData.get("section"),
    stage: formData.get("stage"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const payload = parsed.data;

  if (mode === "create") {
    await createProgram({
      name: payload.name,
      section: payload.section,
      stage: payload.stage === "true",
      category: payload.category,
    });
  } else {
    if (!payload.id) throw new Error("Program ID required");
    await updateProgramById(payload.id, {
      name: payload.name,
      section: payload.section,
      stage: payload.stage === "true",
      category: payload.category,
    });
  }

  revalidatePath("/admin/programs");
}

async function deleteProgramAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await deleteProgramById(id);
  revalidatePath("/admin/programs");
}

async function createProgramAction(formData: FormData) {
  "use server";
  await mutateProgram(formData, "create");
}

async function updateProgramAction(formData: FormData) {
  "use server";
  await mutateProgram(formData, "update");
}

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="space-y-10">
      <Card>
        <CardTitle>Create Program</CardTitle>
        <CardDescription className="mt-2">
          Add programs with section, stage and category metadata.
        </CardDescription>
        <form
          action={createProgramAction}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <Input name="name" placeholder="Program name" required />
          <Select name="section" defaultValue="single" required>
            <option value="single">Single</option>
            <option value="group">Group</option>
            <option value="general">General</option>
          </Select>
          <Select name="category" defaultValue="A">
            <option value="A">Category A</option>
            <option value="B">Category B</option>
            <option value="C">Category C</option>
            <option value="none">None</option>
          </Select>
          <Select name="stage" defaultValue="true">
            <option value="true">On Stage</option>
            <option value="false">Off Stage</option>
          </Select>
          <Button type="submit" className="md:col-span-2">
            Save Program
          </Button>
        </form>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program) => (
          <Card key={program.id} className="bg-slate-900/70">
            <CardTitle>{program.name}</CardTitle>
            <CardDescription className="mt-2">
              Section: {program.section} · Stage: {program.stage ? "Yes" : "No"} ·
              Category: {program.category}
            </CardDescription>
            <form
              action={updateProgramAction}
              className="mt-4 grid gap-3 text-sm text-white"
            >
              <input type="hidden" name="id" value={program.id} />
              <Input name="name" defaultValue={program.name} />
              <Select name="section" defaultValue={program.section}>
                <option value="single">Single</option>
                <option value="group">Group</option>
                <option value="general">General</option>
              </Select>
              <Select name="category" defaultValue={program.category}>
                <option value="A">Category A</option>
                <option value="B">Category B</option>
                <option value="C">Category C</option>
                <option value="none">None</option>
              </Select>
              <Select name="stage" defaultValue={program.stage ? "true" : "false"}>
                <option value="true">On Stage</option>
                <option value="false">Off Stage</option>
              </Select>
              <Button type="submit" variant="secondary">
                Update
              </Button>
            </form>
            <form action={deleteProgramAction} className="mt-3">
              <input type="hidden" name="id" value={program.id} />
              <Button type="submit" variant="danger">
                Delete
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}

