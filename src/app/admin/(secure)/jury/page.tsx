import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createJury,
  deleteJuryById,
  getJuries,
  updateJuryById,
} from "@/lib/data";

const jurySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  password: z.string().min(4),
});

async function upsertJury(formData: FormData, mode: "create" | "update") {
  const parsed = jurySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }
  const payload = parsed.data;

  if (mode === "create") {
    await createJury({
      name: payload.name,
      password: payload.password,
    });
  } else {
    if (!payload.id) throw new Error("Jury ID required");
    await updateJuryById(payload.id, {
      name: payload.name,
      password: payload.password,
    });
  }

  revalidatePath("/admin/jury");
}

async function deleteJuryAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await deleteJuryById(id);
  revalidatePath("/admin/jury");
}

async function createJuryAction(formData: FormData) {
  "use server";
  await upsertJury(formData, "create");
}

async function updateJuryAction(formData: FormData) {
  "use server";
  await upsertJury(formData, "update");
}

export default async function JuryManagementPage() {
  const juryList = await getJuries();

  return (
    <div className="space-y-8">
      <Card>
        <CardTitle>Add Jury</CardTitle>
        <CardDescription className="mt-2">
          Generate credentials for jury login portal.
        </CardDescription>
        <form action={createJuryAction} className="mt-6 grid gap-4 md:grid-cols-3">
          <Input name="name" placeholder="Full name" required />
          <Input name="password" placeholder="Password" required />
          <Button type="submit">Create Jury</Button>
        </form>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {juryList.map((jury) => (
          <Card key={jury.id} className="bg-slate-900/70">
            <CardTitle>{jury.name}</CardTitle>
            <CardDescription className="mt-1">
              Jury ID: {jury.id} · Password: {jury.password}
            </CardDescription>
            <form
              action={updateJuryAction}
              className="mt-4 grid gap-3 text-sm text-white"
            >
              <input type="hidden" name="id" value={jury.id} />
              <Input name="name" defaultValue={jury.name} />
              <Input name="password" defaultValue={jury.password} />
              <Button type="submit" variant="secondary">
                Update
              </Button>
            </form>
            <form action={deleteJuryAction} className="mt-3">
              <input type="hidden" name="id" value={jury.id} />
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

