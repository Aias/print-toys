'use server';

import { createPrintJob, printJobImmediately } from '@/api/requests';
import { encoder } from '@/lib/encoder';
import { ServerActionError } from '@/lib/errors';
import { commonReplacements } from '@/lib/html-to-esc-pos';
import { fireAndForget } from '@/lib/server-actions';

export async function printLineAction(formData: FormData) {
  const action = formData.get('action');
  const line = formData.get('line');

  if (action === 'print' && typeof line === 'string') {
    // Apply replacements
    let replacedLine = line;
    commonReplacements.forEach(({ search, replace }) => {
      replacedLine = replacedLine.replace(search, replace);
    });

    // Generate ESC/POS commands
    const escPosCommands = encoder.initialize().line(replacedLine).encode();

    // Create DB record (await this)
    const job = await createPrintJob(escPosCommands);

    // Fire-and-forget print using after() API
    fireAndForget(
      () => printJobImmediately(job.jobId, escPosCommands),
      (error) => console.error(`[Print failed for job ${job.jobId}]:`, error)
    );

    return { success: true, line: replacedLine };
  }

  if (action === 'cut') {
    const escPosCommands = encoder.initialize().cut().encode();
    const job = await createPrintJob(escPosCommands);

    fireAndForget(
      () => printJobImmediately(job.jobId, escPosCommands),
      (error) => console.error(`[Cut failed for job ${job.jobId}]:`, error)
    );

    return { success: true, cut: true };
  }

  throw new ServerActionError('Invalid action', 'INVALID_ACTION');
}
