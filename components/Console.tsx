import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

export default function Console({
  logs,
  clearLogs,
  aiMessages,
}: {
  logs: { type: string; message: any[] }[];
  clearLogs: () => void;
  aiMessages: string[];
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
      <div className="flex justify-end items-center">
        <Trash2
          className="opacity-50 hover:opacity-100 text-gray-100 cursor-pointer"
          onClick={clearLogs} // Clears both logs and AI messages
        />
      </div>
      <div ref={consoleRef} className="mt-2 leading-loose h-full overflow-y-auto">
        {logs.map((entry, index) => (
          <div
            key={index}
            className={`text-[14px] ${
              entry.type === "error"
                ? "text-red-500"
                : entry.type === "warn"
                ? "text-yellow-400"
                : entry.type === "info"
                ? "text-blue-400"
                : "text-white"
            }`}
          >
            {entry.message.map((msg, i) =>
              typeof msg === "object" && msg !== null ? (
                <pre key={i} className="bg-neutral-800 p-2 rounded-md text-[14px]">
                  {JSON.stringify(msg, null, 2)}
                </pre>
              ) : (
                <span key={i}>{msg !== null && msg !== undefined ? msg.toString() : String(msg)}</span>
              )
            )}
          </div>
        ))}
        {aiMessages.map((msg, index) => (
          <p key={index} className="text-blue-300 text-[14px]">{msg}</p>
        ))}
      </div>
    </div>
  );
}