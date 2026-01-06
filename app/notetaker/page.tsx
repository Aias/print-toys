"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { printMarkdownAction } from "@/actions/print-markdown";
import {
  mdPatternLanguage,
  mdWithImage,
} from "@/test-data/markdown-examples";

export default function Notetaker() {
  const [markdownText, setMarkdownText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!markdownText.trim()) return;

    const textToSubmit = markdownText;

    startTransition(async () => {
      try {
        const result = await printMarkdownAction(textToSubmit);
        if (result.success) {
          setMarkdownText("");
          setMessage({
            type: "success",
            text: `Print job submitted successfully (Job ID: ${result.jobId})`,
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to print markdown",
        });
      }
    });
  };

  const handleTestPrint = (testContent: string) => {
    startTransition(async () => {
      try {
        const result = await printMarkdownAction(testContent);
        if (result.success) {
          setMessage({
            type: "success",
            text: `Test print submitted successfully (Job ID: ${result.jobId})`,
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Failed to print test",
        });
      }
    });
  };

  return (
    <div className="mx-auto max-w-[720px] p-4">
      <h1 className="mb-4 text-2xl font-bold">Notetaker</h1>

      {/* Main content area */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <Textarea
          name="markdownText"
          value={markdownText}
          onChange={(e) => setMarkdownText(e.target.value)}
          placeholder="Type your note in Markdown format"
          className="h-64"
          disabled={isPending}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !markdownText.trim()}
        >
          {isPending ? "Printing..." : "Print Note"}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-4 ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Testing area */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Test Prints</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleTestPrint(mdPatternLanguage)}
            variant="secondary"
            disabled={isPending}
          >
            Test Pattern Language
          </Button>
          <Button
            onClick={() => handleTestPrint(mdWithImage)}
            variant="secondary"
            disabled={isPending}
          >
            Test With Image
          </Button>
        </div>
      </div>
    </div>
  );
}
