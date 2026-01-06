import { useState, useEffect, useCallback, useRef } from "react";
import { Form, useSubmit, data } from "react-router";
import type { Route } from "./+types/typewriter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { encoder } from "@/lib/encoder";
import { createAndPrintJob } from "@/api/requests";
import { commonReplacements } from "@/lib/html-to-esc-pos";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action");
  const line = formData.get("line");

  if (action === "print" && typeof line === "string") {
    let replacedLine = line;
    commonReplacements.forEach(({ search, replace }) => {
      replacedLine = replacedLine.replace(search, replace);
    });
    const escPosCommands = encoder.initialize().line(replacedLine).encode();
    await createAndPrintJob(escPosCommands);
    return data({ success: true as const, line: replacedLine });
  } else if (action === "cut") {
    const escPosCommands = encoder.initialize().cut().encode();
    await createAndPrintJob(escPosCommands);
    return data({ success: true as const, cut: true as const });
  }

  return data({ success: false as const });
};

export default function Typewriter({ actionData }: Route.ComponentProps) {
  const [line, setLine] = useState("");
  const [printedSections, setPrintedSections] = useState<string[][]>([[]]);
  const submit = useSubmit();
  const lastActionRef = useRef<typeof actionData>(null);

  const handleSubmit = (e: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement;
  }) => {
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
    if (!actionData?.success || actionData === lastActionRef.current) {
      return;
    }

    lastActionRef.current = actionData;

    if ("line" in actionData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrintedSections((prev) => {
        const newSections = [...prev];
        const lastSection = newSections[newSections.length - 1];
        if (!lastSection.includes(actionData.line)) {
          newSections[newSections.length - 1] = [
            ...lastSection,
            actionData.line,
          ];
        }
        return newSections;
      });
    } else if ("cut" in actionData) {
      setPrintedSections((prev) => {
        if (prev[prev.length - 1].length > 0) {
          return [...prev, []];
        }
        return prev;
      });
    }
  }, [actionData]);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Typewriter</h1>
      <Form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            name="line"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="Type a line and press Enter"
            className="grow"
          />
          <input type="hidden" name="action" value="print" />
          <Button type="submit" className="whitespace-nowrap">
            Print Line
          </Button>
        </div>
      </Form>
      <Button onClick={handleCut} className="mt-4 w-full">
        Cut Page (Cmd+Enter)
      </Button>
      {printedSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mt-8">
          {sectionIndex > 0 && <hr className="my-4 border-gray-300" />}
          {section.length > 0 && (
            <div>
              <pre className="font-mono whitespace-pre-wrap">
                {section.join("\n")}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
