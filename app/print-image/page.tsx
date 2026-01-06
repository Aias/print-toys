"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { printImageAction } from "@/actions/print-image";

export default function PrintImage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!fileInputRef.current?.files?.[0]) return;

      const formData = new FormData();
      formData.append("image", fileInputRef.current.files[0]);

      startTransition(async () => {
        try {
          const result = await printImageAction(formData);
          if (result.success) {
            setMessage({
              type: "success",
              text: `Image print submitted successfully (Job ID: ${result.jobId})`,
            });
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
        } catch (error) {
          setMessage({
            type: "error",
            text:
              error instanceof Error ? error.message : "Failed to print image",
          });
        }
      });
    },
    [],
  );

  const handlePasteImage = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const formData = new FormData();
            formData.append("image", blob, "clipboard-image.png");

            startTransition(async () => {
              try {
                const result = await printImageAction(formData);
                if (result.success) {
                  setMessage({
                    type: "success",
                    text: `Clipboard image print submitted successfully (Job ID: ${result.jobId})`,
                  });
                }
              } catch (error) {
                setMessage({
                  type: "error",
                  text:
                    error instanceof Error
                      ? error.message
                      : "Failed to print clipboard image",
                });
              }
            });
            return;
          }
        }
      }
      setMessage({
        type: "error",
        text: "No image found in clipboard",
      });
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      setMessage({
        type: "error",
        text: "Failed to read clipboard. Make sure you've granted clipboard permissions.",
      });
    }
  }, []);

  return (
    <div className="mx-auto max-w-[720px] p-4">
      <h1 className="mb-4 text-2xl font-bold">Print Image</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            name="image"
            accept="image/*"
            required
            className="grow"
            ref={fileInputRef}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Printing..." : "Print Image"}
          </Button>
        </div>
      </form>
      <Button onClick={handlePasteImage} className="mt-4 w-full" disabled={isPending}>
        Print Clipboard Image
      </Button>
      {message && (
        <p
          className={`mt-4 ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
