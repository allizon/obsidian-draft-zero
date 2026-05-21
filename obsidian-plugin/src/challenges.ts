export interface ChallengeConfig {
  noDelete: boolean;
  invisibleInk: boolean;
}

export const defaultChallengeConfig: ChallengeConfig = {
  noDelete: false,
  invisibleInk: false,
};

export function isChallengeActive(config: ChallengeConfig): boolean {
  return config.noDelete || config.invisibleInk;
}

export function challengeLabel(config: ChallengeConfig): string {
  const labels: string[] = [];
  if (config.noDelete) labels.push("no-delete");
  if (config.invisibleInk) labels.push("invisible-ink");
  return labels.join(", ");
}
