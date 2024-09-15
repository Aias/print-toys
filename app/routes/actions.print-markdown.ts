import { json, type ActionFunctionArgs } from "@remix-run/node";
import { markdown, convertUrlsToImageMarkdown } from "~/lib/markdown";
import { htmlToEscPos } from "~/lib/html-to-esc-pos";
import { createPrintJob } from "~/api/requests";

export const action = async ({ request }: ActionFunctionArgs) => {
  const markdownText = await request.text();

  try {
    const html = await markdown.parse(convertUrlsToImageMarkdown(markdownText));
    const escPosCommands = await htmlToEscPos(html);

    await createPrintJob(Buffer.from(escPosCommands));
    return json({ success: true, message: "Note printed successfully" });
  } catch (error) {
    console.error("Error in action:", error);
    return json(
      {
        success: false,
        message: `Failed to print note: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
};
