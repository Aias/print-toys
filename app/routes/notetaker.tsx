import { useState } from "react";
import { Form, useSubmit, SubmitOptions } from "react-router";
import type { Route } from "./+types/notetaker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mdPatternLanguage, mdWithImage } from "@/test-data/markdown-examples";
import { action as printMarkdownAction } from "./actions.print-markdown";

export const action = printMarkdownAction;

const submitOptions: SubmitOptions = { method: "post", encType: "text/plain" };

export default function Notetaker({ actionData }: Route.ComponentProps) {
  const [markdownText, setMarkdownText] = useState("");
  const submit = useSubmit();

  const handleSubmit = (e: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement;
  }) => {
    e.preventDefault();
    submit(markdownText, submitOptions);
  };

  const handleTestPrint = (testContent: string) => {
    submit(testContent, submitOptions);
  };

  return (
    <div className="mx-auto max-w-[720px] p-4">
      <h1 className="mb-4 text-2xl font-bold">Notetaker</h1>

      {/* Main content area */}
      <Form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <Textarea
          name="markdownText"
          value={markdownText}
          onChange={(e) => setMarkdownText(e.target.value)}
          placeholder="Type your note in Markdown format"
          className="h-64"
        />
        <Button type="submit" className="w-full">
          Print Note
        </Button>
      </Form>

      {actionData && (
        <p
          className={`mt-4 ${
            actionData.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {actionData.message}
        </p>
      )}

      {/* Testing area */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Test Prints</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleTestPrint(mdPatternLanguage)}
            variant="secondary"
          >
            Test Pattern Language
          </Button>
          <Button
            onClick={() => handleTestPrint(mdWithImage)}
            variant="secondary"
          >
            Test With Image
          </Button>
        </div>
      </div>
    </div>
  );
}
