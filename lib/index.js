let session = null;

export const startTracking = () => {
  session = {
    start: new Date().toISOString(),
    end: null,
    duration: null,
  };
  console.log({ session });

  console.log("start session tracking");
};

export const stopTracking = () => {
  if (!session) return console.log("No session tracking!");

  session.end = new Date().toISOString();

  const startDate = new Date(session.start);
  const endDate = new Date(session.end);

  session.duration = (endDate - startDate) / 1000; // Durée en secondes

  console.log("stop session tracking");
  session = null;
};
