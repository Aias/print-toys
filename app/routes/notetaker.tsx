import { useState } from "react";
import {
  Form,
  useSubmit,
  useActionData,
  SubmitOptions,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { mdExampleText } from "~/lib/markdown";
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

  const handleTestPrint = () => {
    submit(mdExampleText, submitOptions);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notetaker</h1>
      <Form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          name="markdownText"
          value={markdownText}
          onChange={(e) => setMarkdownText(e.target.value)}
          placeholder="Type your note in Markdown format"
          className="h-64"
        />
        <div className="flex space-x-4">
          <Button type="submit" className="flex-grow">
            Print Note
          </Button>
          <Button type="button" onClick={handleTestPrint} variant="secondary">
            Test Print
          </Button>
        </div>
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
    </div>
  );
}
