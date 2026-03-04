const channels = new Map();

const wait = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

export const schedule = async (channel, task, minIntervalMs = 300) => {
  const state = channels.get(channel) ?? {
    lastRunAt: 0,
    tail: Promise.resolve(),
  };

  const run = async () => {
    const elapsed = Date.now() - state.lastRunAt;
    const remainingDelay = Math.max(0, minIntervalMs - elapsed);

    if (remainingDelay > 0) {
      await wait(remainingDelay);
    }

    const result = await task();
    state.lastRunAt = Date.now();
    return result;
  };

  const next = state.tail.then(run, run);
  state.tail = next.catch(() => undefined);
  channels.set(channel, state);

  return next;
};

