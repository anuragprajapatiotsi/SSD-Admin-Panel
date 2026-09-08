type VersionedSubmission = { submissionVersion: number; isLatest?: boolean };

export function getLatestSubmission<T extends VersionedSubmission>(history: T[] = [], latest?: T): T | undefined {
  return latest ?? history.find((submission) => submission.isLatest)
    ?? history.reduce<T | undefined>((current, submission) => !current || submission.submissionVersion > current.submissionVersion ? submission : current, undefined);
}
