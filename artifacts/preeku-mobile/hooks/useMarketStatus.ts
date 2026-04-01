import { useState, useEffect } from "react";

function getMarketStatus(): { isOpen: boolean; label: string } {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
  const day = ist.getDay(); // 0=Sun, 6=Sat
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 15;   // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM

  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && totalMinutes >= marketOpen && totalMinutes < marketClose;
  return { isOpen, label: isOpen ? "Live" : "Market Closed" };
}

export function useMarketStatus() {
  const [status, setStatus] = useState(getMarketStatus());

  useEffect(() => {
    const interval = setInterval(() => setStatus(getMarketStatus()), 30000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
