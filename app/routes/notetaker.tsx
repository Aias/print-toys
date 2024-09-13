import { useState } from "react";
import {
  Form,
  useSubmit,
  useActionData,
  SubmitOptions,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { mdPatternLanguage, mdWithImage } from "~/test-data/markdown-examples";
import { action as printMarkdownAction } from "./actions.print-markdown";

export const action = printMarkdownAction;

const submitOptions: SubmitOptions = { method: "post", encType: "text/plain" };

export default function Notetaker() {
  const [markdownText, setMarkdownText] = useState("");
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(markdownText, submitOptions);
  };

  const handleTestPrint = (testContent: string) => {
    submit(testContent, submitOptions);
  };

  return (
    <div className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notetaker</h1>

      {/* Main content area */}
      <Form onSubmit={handleSubmit} className="space-y-4 mb-8">
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
        <h2 className="text-xl font-semibold mb-4">Test Prints</h2>
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
