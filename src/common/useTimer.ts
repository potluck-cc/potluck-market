import { useState } from "react";

export function useTimer() {
  const [timeElapsed, setTimeElapsed] = useState(new Date().getTime());

  function start() {
    setTimeElapsed(new Date().getTime());
  }

  function end() {
    const endTime = new Date().getTime();
    let difference = endTime - timeElapsed;
    difference /= 1000;
    setTimeElapsed(difference);
    return difference;
  }

  return {
    start,
    end,
    timeElapsed
  };
}
