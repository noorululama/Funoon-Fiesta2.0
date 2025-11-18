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

const csvRowSchema = z.object({
  name: z.string().min(2, "Program name is required"),
  section: z.enum(["single", "group", "general"], {
    errorMap: () => ({ message: "section must be single | group | general" }),
  }),
  stage: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .refine((value) => ["true", "false"].includes(value), {
      message: "stage must be true or false",
    })
    .transform((value) => value === "true")
    .pipe(z.boolean()),
  category: z.enum(["A", "B", "C", "none"], {
    errorMap: () => ({ message: "category must be A | B | C | none" }),
  }),
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

function parseCsv(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [];
  }
  const [headerLine, ...rows] = lines;
  const headers = headerLine
    .split(",")
    .map((header) => header.trim().toLowerCase());
  const requiredHeaders = ["name", "section", "stage", "category"];
  for (const column of requiredHeaders) {
    if (!headers.includes(column)) {
      throw new Error(`Missing "${column}" column in CSV header.`);
    }
  }
  const indices = requiredHeaders.map((column) => headers.indexOf(column));
  return rows.map((row, index) => {
    const cells = row.split(",").map((cell) => cell.trim());
    if (cells.length < headers.length) {
      throw new Error(`Row ${index + 2} is incomplete.`);
    }
    const data = Object.fromEntries(
      requiredHeaders.map((column, idx) => [column, cells[indices[idx]] ?? ""]),
    );
    return { row: index + 2, data };
  });
}

async function importProgramsAction(formData: FormData) {
  "use server";
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please upload a CSV file.");
  }
  const text = await file.text();
  const entries = parseCsv(text);
  if (entries.length === 0) {
    throw new Error("CSV file does not contain any data rows.");
  }
  for (const entry of entries) {
    const parsed = csvRowSchema.safeParse(entry.data);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(", ");
      throw new Error(`Row ${entry.row}: ${message}`);
    }
    await createProgram({
      name: parsed.data.name,
      section: parsed.data.section,
      stage: parsed.data.stage,
      category: parsed.data.category,
    });
  }
  revalidatePath("/admin/programs");
}

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="space-y-10">
      <Card>
        <CardTitle>Bulk Import (CSV)</CardTitle>
        <CardDescription className="mt-2">
          Required columns: <code>name, section, stage, category</code>
        </CardDescription>
        <form
          action={importProgramsAction}
          className="mt-6 flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="text-sm font-semibold text-white/70">
              CSV File
            </label>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
            />
          </div>
          <Button type="submit">Import CSV</Button>
        </form>
      </Card>

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

