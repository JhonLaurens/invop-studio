import { useEffect, useState } from "react";

type Listener = (message: string) => void;
let listener: Listener | null = null;

export function announce(message: string) {
  listener?.(message);
}

export function StatusToast() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    listener = (next) => {
      setMessage("");
      window.setTimeout(() => setMessage(next), 20);
    };
    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 2800);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;
  return (
    <p className="status-toast" role="status">
      {message}
    </p>
  );
}
