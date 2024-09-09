import { useState } from "react";
import { Form, useSubmit, useActionData } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

type ActionData = { success: boolean; message: string };

const testMarkdown = `# Test Markdown

This is a **bold** test with some *italic* text.
This should render as a new line.
And this another line.
But no newlines between elements should be printed.

## Subheading

- List item 1
- List item 2

[A link](https://example.com)

---

> A blockquote

\`\`\`
Some code
\`\`\`
`;

export const action = async ({ request }: ActionFunctionArgs) => {
  const markdownText = await request.text();

  const response = await fetch("/actions/print-markdown", {
    method: "POST",
    body: markdownText,
    headers: {
      "Content-Type": "text/plain",
    },
  });

  const result = await response.json();
  return json<ActionData>(result);
};

export default function Notetaker() {
  const [markdownText, setMarkdownText] = useState("");
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(markdownText, { method: "post", encType: "text/plain" });
  };

  const handleTestPrint = () => {
    submit(testMarkdown, { method: "post", encType: "text/plain" });
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
