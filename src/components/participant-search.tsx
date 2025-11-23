"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRScanner } from "./qr-scanner";

interface SearchResult {
  id: string;
  name: string;
  chest_no: string;
  team_id: string;
}

export function ParticipantSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/participants/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      handleSearch(value);
    } else {
      setResults([]);
    }
  };

  const handleSelectParticipant = (chestNumber: string) => {
    startTransition(() => {
      router.push(`/participant/${chestNumber}`);
    });
  };

  const handleQRScan = (chestNumber: string) => {
    setShowScanner(false);
    startTransition(() => {
      router.push(`/participant/${chestNumber}`);
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by chest number or name..."
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              Scan QR
            </Button>
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectParticipant(result.chest_no)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Chest: {result.chest_no}
                        </p>
                      </div>
                      <Badge variant="secondary">View Profile</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No participants found
            </p>
          )}
        </div>
      </Card>

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

