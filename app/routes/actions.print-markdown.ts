import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { markdown } from "~/lib/markdown";
import { htmlToEscPos } from "~/lib/htmlToEscPos";
import { createPrintJob } from "~/api/requests";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const markdownText = await request.text();

  try {
    const html = await markdown.parse(markdownText);
    const escPosCommands = htmlToEscPos(html);

    await createPrintJob(context.cloudflare.env, Buffer.from(escPosCommands));
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

export default action;
