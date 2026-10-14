"use client";

import { useEffect, useState } from "react";

export function useIntroDone() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "done") {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener("les-intro-done", onDone);
    return () => window.removeEventListener("les-intro-done", onDone);
  }, []);

  return done;
}
