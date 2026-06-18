import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface Scan {
  scanned_at: string;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export const ScanStreak = ({ scans }: { scans: Scan[] }) => {
  const now = new Date();
  // start at Sunday of current week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const scannedDays = new Set(scans.map((s) => s.scanned_at.slice(0, 10)));
  const dayFilled = days.map((d) => scannedDays.has(d.toISOString().slice(0, 10)));

  // current streak: walk backwards from today
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (scannedDays.has(key)) streak++;
    else if (i > 0) break;
    else break; // no scan today → streak 0 from today onwards
  }

  const todayKey = now.toISOString().slice(0, 10);
  const scannedToday = scannedDays.has(todayKey);
  const todayIdx = now.getDay();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 sm:p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Scan streak</h2>
          <p className="text-xs text-muted-foreground">A scan a day keeps phishers away.</p>
        </div>
        <div className="font-mono text-2xl font-bold text-primary flex items-center gap-1">
          {streak}
          <Flame className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {days.map((d, i) => {
          const filled = dayFilled[i];
          const isToday = i === todayIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={[
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all",
                  filled
                    ? "bg-primary border-primary shadow-lg shadow-primary/30"
                    : "bg-transparent border-border",
                  isToday && !filled ? "border-primary/50" : "",
                ].join(" ")}
                title={d.toDateString()}
              />
              <span className={`text-[10px] ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-center">
        {scannedToday ? (
          <>
            <span className="font-semibold">{streak}-day scan streak</span> 🔥 Keep it up!
          </>
        ) : (
          <span className="text-muted-foreground">You haven't scanned anything today — stay vigilant!</span>
        )}
      </p>
    </motion.section>
  );
};
