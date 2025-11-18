import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createStudent,
  deleteStudentById,
  getStudents,
  getTeams,
  updateStudentById,
} from "@/lib/data";

const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  team_id: z.string().min(2),
  chest_no: z.string().min(1),
});

const csvStudentSchema = z.object({
  name: z.string().min(2, "Student name is required"),
  team_id: z.string().min(2, "team_id is required"),
  chest_no: z.string().min(1, "Chest number is required"),
});

async function upsertStudent(formData: FormData, mode: "create" | "update") {
  const parsed = studentSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    team_id: formData.get("team_id"),
    chest_no: formData.get("chest_no"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }
  const payload = parsed.data;

  if (mode === "create") {
    await createStudent({
      name: payload.name,
      team_id: payload.team_id,
      chest_no: payload.chest_no,
    });
  } else {
    if (!payload.id) throw new Error("Student ID missing");
    await updateStudentById(payload.id, {
      name: payload.name,
      team_id: payload.team_id,
      chest_no: payload.chest_no,
    });
  }

  revalidatePath("/admin/students");
}

async function deleteStudentAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await deleteStudentById(id);
  revalidatePath("/admin/students");
}

async function createStudentAction(formData: FormData) {
  "use server";
  await upsertStudent(formData, "create");
}

async function updateStudentAction(formData: FormData) {
  "use server";
  await upsertStudent(formData, "update");
}

function parseStudentCsv(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const [headerLine, ...rows] = lines;
  const headers = headerLine
    .split(",")
    .map((header) => header.trim().toLowerCase());
  const requiredHeaders = ["name", "team_id", "chest_no"];
  for (const column of requiredHeaders) {
    if (!headers.includes(column)) {
      throw new Error(`Missing "${column}" column in CSV header.`);
    }
  }
  const indexes = requiredHeaders.map((column) => headers.indexOf(column));
  return rows.map((row, index) => {
    const cells = row.split(",").map((cell) => cell.trim());
    if (cells.length < headers.length) {
      throw new Error(`Row ${index + 2} is incomplete.`);
    }
    const data = Object.fromEntries(
      requiredHeaders.map((column, idx) => [column, cells[indexes[idx]] ?? ""]),
    );
    return { row: index + 2, data };
  });
}

async function importStudentsAction(formData: FormData) {
  "use server";
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please upload a CSV file.");
  }
  const text = await file.text();
  const entries = parseStudentCsv(text);
  if (entries.length === 0) {
    throw new Error("CSV file does not contain any data rows.");
  }
  const teams = await getTeams();
  const teamIds = new Set(teams.map((team) => team.id));
  for (const entry of entries) {
    const parsed = csvStudentSchema.safeParse(entry.data);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(", ");
      throw new Error(`Row ${entry.row}: ${message}`);
    }
    if (!teamIds.has(parsed.data.team_id)) {
      throw new Error(`Row ${entry.row}: team_id "${parsed.data.team_id}" not found.`);
    }
    await createStudent({
      name: parsed.data.name,
      team_id: parsed.data.team_id,
      chest_no: parsed.data.chest_no,
    });
  }
  revalidatePath("/admin/students");
}

interface StudentsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const { q } = await searchParams;
  const [students, teams] = await Promise.all([
    getStudents(),
    getTeams(),
  ]);
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const query = q?.trim().toLowerCase();
  const filtered = query
    ? students.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.chest_no.toLowerCase().includes(query),
      )
    : students;

  return (
    <div className="space-y-8">
      <Card>
        <CardTitle>Bulk Import Students (CSV)</CardTitle>
        <CardDescription className="mt-2">
          Required columns: <code>name, team_id, chest_no</code>
        </CardDescription>
        <form
          action={importStudentsAction}
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
        <CardTitle>Add Student</CardTitle>
        <CardDescription className="mt-2">
          Maintain a searchable roster for quick result entry.
        </CardDescription>
        <form
          action={createStudentAction}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <Input name="name" placeholder="Student name" required />
          <Input name="chest_no" placeholder="Chest number" required />
          <Select name="team_id" defaultValue={teams[0]?.id} required>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          <Button type="submit" className="md:col-span-2">
            Save Student
          </Button>
        </form>
      </Card>

      <form method="GET" className="flex gap-3">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name or chest number"
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="space-y-4">
        {filtered.map((student) => (
          <Card key={student.id} className="bg-slate-900/70">
            <CardTitle>{student.name}</CardTitle>
            <CardDescription className="mt-1">
              Chest #{student.chest_no} · {teamMap.get(student.team_id)?.name}
            </CardDescription>
            <form
              action={updateStudentAction}
              className="mt-4 grid gap-3 md:grid-cols-3"
            >
              <input type="hidden" name="id" value={student.id} />
              <Input name="name" defaultValue={student.name} />
              <Input name="chest_no" defaultValue={student.chest_no} />
              <Select name="team_id" defaultValue={student.team_id}>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary" className="md:col-span-3">
                Update
              </Button>
            </form>
            <form action={deleteStudentAction} className="mt-3">
              <input type="hidden" name="id" value={student.id} />
              <Button type="submit" variant="danger">
                Delete
              </Button>
            </form>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-white/60">No students match the query.</p>
        )}
      </div>
    </div>
  );
}

