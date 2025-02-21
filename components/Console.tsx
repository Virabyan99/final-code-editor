import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

export default function Console({
  logs,
  clearLogs,
  aiMessages,
}: {
  logs: string[];
  clearLogs: () => void;
  aiMessages: string[]; // Added to receive AI messages from page.tsx
}) {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest log
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs, aiMessages]);

  return (
    <div className="h-full overflow-clip transition-opacity duration-300">
      <div className="flex justify-between items-center">
        <p className="text-neutral-400">Console Output</p>
        <Trash2
          className="opacity-100 hover:opacity-50 text-gray-100 cursor-pointer"
          onClick={() => {
            clearLogs(); // Clears both logs and AI messages via page.tsx
          }}
        />
      </div>
      <div ref={consoleRef} className="mt-2 h-full overflow-y-auto">
        {logs.map((msg, index) => (
          <p
            key={index}
            className={`${msg.includes("Error") ? "text-red-500" : msg.includes("Warning") ? "text-yellow-400" : "text-white"}`}
          >
            {msg}
          </p>
        ))}
        {aiMessages.map((msg, index) => (
          <p key={index} className="text-blue-300">{msg}</p>
        ))}
      </div>
    </div>
  );
}