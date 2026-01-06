"use client";

import React, { useState, useCallback, useEffect, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { printLineAction } from "@/actions/print-line";

export default function Typewriter() {
  const [line, setLine] = useState("");
  const [printedSections, setPrintedSections] = useState<string[][]>([[]]);
  const [optimisticSections, addOptimisticUpdate] = useOptimistic(
    printedSections,
    (state, update: string | { type: "cut" }) => {
      if (typeof update === "string") {
        // Add line to current section
        const newState = [...state];
        newState[newState.length - 1] = [
          ...newState[newState.length - 1],
          update,
        ];
        return newState;
      } else {
        // Add new section for cut
        return state[state.length - 1].length > 0 ? [...state, []] : state;
      }
    },
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!line.trim()) return;

    const formData = new FormData();
    formData.set("action", "print");
    formData.set("line", line);

    const lineToSubmit = line;
    setLine("");

    // Server action with optimistic update
    startTransition(async () => {
      // Optimistic update
      addOptimisticUpdate(lineToSubmit);

      const result = await printLineAction(formData);
      if (result.success && "line" in result && result.line) {
        setPrintedSections((prev) => {
          const newSections = [...prev];
          newSections[newSections.length - 1] = [
            ...newSections[newSections.length - 1],
            result.line,
          ];
          return newSections;
        });
      }
    });
  };

  const handleCut = useCallback(async () => {
    const formData = new FormData();
    formData.set("action", "cut");

    startTransition(async () => {
      // Optimistic update
      addOptimisticUpdate({ type: "cut" });

      const result = await printLineAction(formData);
      if (result.success && "cut" in result) {
        setPrintedSections((prev) => {
          if (prev[prev.length - 1].length > 0) {
            return [...prev, []];
          }
          return prev;
        });
      }
    });
  }, [addOptimisticUpdate]);

  // Keyboard shortcut for cut (Cmd+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCut();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleCut]);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Typewriter</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            name="line"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="Type a line and press Enter"
            className="grow"
            autoComplete="off"
          />
          <Button type="submit" className="whitespace-nowrap" disabled={isPending}>
            {isPending ? "Printing..." : "Print Line"}
          </Button>
        </div>
      </form>
      <Button onClick={handleCut} className="mt-4 w-full" disabled={isPending}>
        Cut Page (Cmd+Enter)
      </Button>
      {optimisticSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mt-8">
          {sectionIndex > 0 && <hr className="my-4 border-gray-300" />}
          {section.length > 0 && (
            <div>
              <pre className="whitespace-pre-wrap font-mono">
                {section.join("\n")}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
