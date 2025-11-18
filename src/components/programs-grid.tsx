"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Trophy, Medal } from "lucide-react";
import type { Program, ResultRecord } from "@/lib/types";

interface ProgramsGridProps {
  programs: Program[];
  results: ResultRecord[];
  programMap: Map<string, Program>;
}

const fadeIn = (direction: string, delay: number) => ({
  hidden: {
    opacity: 0,
    x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
    y: direction === "down" ? 50 : direction === "up" ? -50 : 0,
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: "easeOut",
    },
  },
});

export function ProgramsGrid({ programs, results, programMap }: ProgramsGridProps) {
  const [search, setSearch] = useState("");

  // Get unique programs that have results
  const programsWithResults = useMemo(() => {
    const programIds = new Set(results.map((r) => r.program_id));
    return programs.filter((p) => programIds.has(p.id));
  }, [programs, results]);

  const filteredPrograms = useMemo(() => {
    if (!search.trim()) {
      return programsWithResults.map((program, index) => ({
        id: program.id,
        program,
        index,
      }));
    }

    const normalized = search.toLowerCase();
    return programsWithResults
      .filter((program) => program.name.toLowerCase().includes(normalized))
      .map((program, index) => ({
        id: program.id,
        program,
        index,
      }));
  }, [search, programsWithResults]);

  // Get result count and medal info for each program
  const getProgramStats = (programId: string) => {
    const programResults = results.filter((r) => r.program_id === programId);
    const hasResults = programResults.length > 0;
    const program = programMap.get(programId);
    
    return {
      hasResults,
      section: program?.section || "general",
      category: program?.category || "none",
    };
  };

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            variants={fadeIn("left", 0.3)}
            initial="hidden"
            animate="show"
            className="font-bold text-center text-4xl md:text-5xl mb-4 bg-gradient-to-r from-fuchsia-400 to-rose-400 bg-clip-text text-transparent"
          >
            Explore Programs Results
          </motion.h1>
          <motion.p
            variants={fadeIn("down", 0.4)}
            initial="hidden"
            animate="show"
            className="text-center text-white/70 mb-10 text-lg"
          >
            Discover all approved results and winning moments
          </motion.p>

          <motion.div
            variants={fadeIn("down", 0.5)}
            initial="hidden"
            animate="show"
            className="mb-12"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search Programs..."
                className="w-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 h-14 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition duration-300 ease-in-out placeholder:text-white/40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </motion.div>

          {filteredPrograms.length > 0 && (
            <motion.div
              variants={fadeIn("up", 0.6)}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredPrograms.map(({ id, program, index }) => {
                const stats = getProgramStats(program.id);
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={`/results/${program.id}`}>
                      <div className="group cursor-pointer p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-fuchsia-500/50 relative overflow-hidden">
                        {/* Background gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/0 to-rose-500/0 group-hover:from-fuchsia-500/10 group-hover:to-rose-500/10 transition-all duration-300" />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-rose-500/20">
                                <Trophy className="w-5 h-5 text-fuchsia-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                                  {program.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 capitalize">
                                    {stats.section}
                                  </span>
                                  {stats.category !== "none" && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                                      Cat {stats.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Medal className="w-6 h-6 text-yellow-400/50 group-hover:text-yellow-400 transition-colors" />
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <span className="text-sm text-white/60">View Results</span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-colors">
                              <svg
                                className="w-4 h-4 text-white/70 group-hover:text-fuchsia-400 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {filteredPrograms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="flex flex-col items-center gap-4">
                <Search className="w-16 h-16 text-white/30" />
                <h3 className="text-xl font-semibold text-white/70">
                  No programs found
                </h3>
                <p className="text-white/50 max-w-md">
                  {search
                    ? `No programs match "${search}". Try a different search term.`
                    : "No approved results available yet. Check back soon!"}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-4 px-6 py-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

