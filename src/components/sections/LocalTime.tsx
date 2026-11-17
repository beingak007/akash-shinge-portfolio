import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Current time in Pune — updates every 20 seconds. */
export function LocalTime() {
  const [time, setTime] = useState(() => format.format(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(format.format(new Date()));
    }, 20_000);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  return <time>{time}</time>;
}
