import { data } from "react-router";
import type { Route } from "./+types/actions.print-markdown";
import { markdown, convertUrlsToImageMarkdown } from "~/lib/markdown";
import { htmlToEscPos } from "~/lib/html-to-esc-pos";
import { createAndPrintJob } from "~/api/requests";

export const action = async ({ request }: Route.ActionArgs) => {
  const markdownText = await request.text();

  try {
    const html = await markdown.parse(convertUrlsToImageMarkdown(markdownText));
    const escPosCommands = await htmlToEscPos(html);

    await createAndPrintJob(escPosCommands);
    return data({ success: true, message: "Note printed successfully" });
  } catch (error) {
    console.error("Error in action:", error);
    return data(
      {
        success: false,
        message: `Failed to print note: ${(error as Error).message}`,
      },
      { status: 500 },
    );
  }
};
