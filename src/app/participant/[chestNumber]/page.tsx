import { notFound } from "next/navigation";
import { getParticipantProfile } from "@/lib/participant-service";
import { ParticipantProfileDisplay } from "@/components/participant-profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ParticipantPageProps {
  params: Promise<{ chestNumber: string }>;
}

export default async function ParticipantPage({ params }: ParticipantPageProps) {
  const { chestNumber } = await params;
  const profile = await getParticipantProfile(chestNumber);

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/participant">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </Link>
      </div>
      <ParticipantProfileDisplay profile={profile} />
    </div>
  );
}

