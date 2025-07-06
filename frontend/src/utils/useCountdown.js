import { useEffect, useState } from "react";

export default function useCountdown(seconds = 900) {
  const [remain, setRemain] = useState(seconds);
  useEffect(() => {
    if (remain <= 0) return;
    const id = setInterval(() => setRemain((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [remain]);
  return remain;
}
