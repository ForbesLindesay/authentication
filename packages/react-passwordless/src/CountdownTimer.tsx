// @public

import * as React from 'react';

function useForceUpdate() {
  const [, forceUpdate] = React.useState(false);
  return React.useCallback(() => forceUpdate((v) => !v), [forceUpdate]);
}

function getIntervalFrequency(delta: number) {
  if (delta < 90000) {
    return 100;
  }
  if (delta < 90 * 60 * 1000) {
    return 1_000;
  }
  if (delta < 72 * 60 * 60 * 1000) {
    return 10_000;
  }
  return 30_000;
}

export default function CountdownTimer({time}: {time: number}) {
  const forceUpdate = useForceUpdate();
  const delta = time - Date.now();
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, getIntervalFrequency(delta));
    return () => clearInterval(interval);
  }, [getIntervalFrequency(delta)]);

  if (delta < 1500) {
    return <React.Fragment>1 second</React.Fragment>;
  }
  if (delta < 90000) {
    return <React.Fragment>{Math.round(delta / 1000)} seconds</React.Fragment>;
  }
  if (delta < 90 * 60 * 1000) {
    return (
      <React.Fragment>{Math.round(delta / (60 * 1000))} minutes</React.Fragment>
    );
  }
  if (delta < 72 * 60 * 60 * 1000) {
    return (
      <React.Fragment>
        {Math.round(delta / (60 * 60 * 1000))} hours
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {Math.round(delta / (24 * 60 * 60 * 1000))} days
    </React.Fragment>
  );
}
