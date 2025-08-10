// @ts-nocheck
export const calculTotalDuration = (currentSession) => {
  const { start, end, pauses } = currentSession;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const totalDuration = (endDate - startDate) / 1000;

  const totalPauseDuration = getTotalPauseDuration(pauses);

  const net = totalDuration - totalPauseDuration;

  return Math.round(net);
};

export const getTotalPauseDuration = (pauses) => {
  if (!pauses || pauses.length === 0) return 0;
  return pauses.reduce((total, pause) => {
    if (pause.start && pause.end) {
      const start = new Date(pause.start);
      const end = new Date(pause.end);
      return total + (end - start) / 1000; //in secondes
    }
    return total;
  }, 0);
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? h + "h " : ""}${m}m`;
};
