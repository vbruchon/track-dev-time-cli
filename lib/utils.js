//@ts-nocheck

export const calculTotalDuration = (currentSession) => {
  const { start, end, pauses } = currentSession;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const totalDuration = (endDate - startDate) / 1000;

  const totalPauseDuration = (pauses || []).reduce((acc, pause) => {
    if (!pause.start || !pause.end) {
      return acc;
    }
    const pauseStart = new Date(pause.start);
    const pauseEnd = new Date(pause.end);
    return acc + (pauseEnd - pauseStart) / 1000;
  }, 0);

  const net = totalDuration - totalPauseDuration;

  return Math.round(net * 100) / 100;
};

export const getTotalPauseDuration = (pauses) => {
  if (!pauses || pauses.length === 0) return 0;
  return pauses.reduce((total, pause) => {
    if (pause.start && pause.end) {
      return total + pause.duration;
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
