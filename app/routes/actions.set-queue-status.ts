import { json, type ActionFunction } from "@remix-run/node";
import { setQueueEnabled } from "~/api/requests";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const enableQueue = formData.get("enable") === "true";

    await setQueueEnabled(enableQueue);

    return json({ queueEnabled: enableQueue });
  } catch (error) {
    console.error("Error setting queue state:", error);
    return json({ error: "Failed to set queue state." }, { status: 500 });
  }
};
