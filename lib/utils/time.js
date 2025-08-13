// @ts-nocheck
export const calculTotalDuration = (currentSession) => {
  const { start, end, pauses } = currentSession;

  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const totalDuration = (endDate - startDate) / 1000;

  const totalPauseDuration = getTotalPauseDuration(pauses, endDate);

  const net = totalDuration - totalPauseDuration;

  return Math.max(0, Math.round(net));
};

export const getTotalPauseDuration = (pauses, endDate = new Date()) => {
  if (!pauses || pauses.length === 0) return 0;

  return pauses.reduce((total, pause) => {
    if (pause.start) {
      const start = new Date(pause.start);
      const end = pause.end ? new Date(pause.end) : endDate;
      return total + (end - start) / 1000; // secondes
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
