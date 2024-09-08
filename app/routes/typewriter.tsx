import { useState, useEffect, useCallback } from "react";
import { Form, useSubmit, useActionData } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PrismaClient } from "@prisma/client";
import { encoder } from "~/lib/encoder";

const prisma = new PrismaClient();

type ActionData =
  | { success: true; line: string }
  | { success: true; cut: true }
  | { success: false };

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action");
  const line = formData.get("line");

  if (action === "print" && typeof line === "string") {
    const escPosCommands = encoder.initialize().line(line).encode();
    await prisma.printJob.create({
      data: {
        escPosCommands: Buffer.from(escPosCommands),
        cutAfterPrint: false,
      },
    });
    return json<ActionData>({ success: true, line });
  } else if (action === "cut") {
    await prisma.printJob.create({
      data: {
        escPosCommands: Buffer.from([]),
        cutAfterPrint: true,
      },
    });
    return json<ActionData>({ success: true, cut: true });
  }

  return json<ActionData>({ success: false });
};

export default function Typewriter() {
  const [line, setLine] = useState("");
  const [printedLines, setPrintedLines] = useState<string[]>([]);
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(e.currentTarget, { method: "post" });
    setLine("");
  };

  const handleCut = useCallback(() => {
    submit({ action: "cut" }, { method: "post" });
  }, [submit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCut();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCut]);

  useEffect(() => {
    if (actionData?.success && "line" in actionData) {
      setPrintedLines((prev) => [...prev, actionData.line]);
    }
  }, [actionData]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Typewriter</h1>
      <Form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            name="line"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="Type a line and press Enter"
            className="flex-grow"
          />
          <input type="hidden" name="action" value="print" />
          <Button type="submit" className="whitespace-nowrap">
            Print Line
          </Button>
        </div>
      </Form>
      <Button onClick={handleCut} className="w-full mt-4">
        Cut Page (Cmd+Enter)
      </Button>
      {printedLines.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Printed Lines:</h2>
          <ul className="list-disc pl-5">
            {printedLines.map((printedLine, index) => (
              <li key={index}>{printedLine}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
