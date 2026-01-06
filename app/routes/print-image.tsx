import { useFetcher } from "react-router";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { action as printImageAction } from "./actions.print-image";

export default function PrintImage() {
  const fetcher = useFetcher<typeof printImageAction>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (event: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
      event.preventDefault();
      if (fileInputRef.current?.files?.[0]) {
        const formData = new FormData();
        formData.append("image", fileInputRef.current.files[0]);
        fetcher.submit(formData, {
          method: "post",
          action: "/actions/print-image",
          encType: "multipart/form-data",
        });
      }
    },
    [fetcher],
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
            fetcher.submit(formData, {
              method: "post",
              action: "/actions/print-image",
              encType: "multipart/form-data",
            });
            return;
          }
        }
      }
      alert("No image found in clipboard");
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  }, [fetcher]);

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
          />
          <Button type="submit">Print Image</Button>
        </div>
      </form>
      <Button onClick={handlePasteImage} className="mt-4 w-full">
        Print Clipboard Image
      </Button>
      {fetcher.data?.success && (
        <p className="mt-4 text-green-600">{fetcher.data.message}</p>
      )}
      {fetcher.data?.success === false && (
        <p className="mt-4 text-red-600">Error: {fetcher.data.message}</p>
      )}
    </div>
  );
}
