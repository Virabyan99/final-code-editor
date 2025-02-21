import { useEffect, useState, useRef } from "react";
import { Trash2 } from "lucide-react";

export default function Console({ logs, clearLogs }: { logs: string[]; clearLogs: () => void }) {
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const explainError = (message: string) => {
      if (message.includes("is not defined")) {
        return "🟡 This means you're trying to use a variable that hasn't been declared.";
      }
      return "";
    };

    const logHandler = (message: any, type: "log" | "warn" | "error") => {
      const formattedMessage =
        type === "log"
          ? message
          : type === "warn"
          ? `⚠️ Warning: ${message}`
          : `❌ Error: ${message}`;

      if (type === "error") {
        const explanation = explainError(message);
        if (explanation) setAiMessages((prev) => [...prev, explanation]);
      }
    };

    // Override console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (msg) => logHandler(msg, "log");
    console.warn = (msg) => logHandler(msg, "warn");
    console.error = (msg) => logHandler(msg, "error");

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  // Auto-scroll to the latest log
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs, aiMessages]);

  return (
    <div className="h-full  overflow-clip transition-opacity duration-300">
      <div className="flex justify-between items-center">
        <p className="text-neutral-400">Console Output</p>
        <Trash2
          className="opacity-100 hover:opacity-50 text-gray-100 cursor-pointer"
          onClick={() => {
            clearLogs();
            setAiMessages([]); // Clear AI explanations when clearing logs
          }}
        />
      </div>
      <div ref={consoleRef} className="mt-2 h-full overflow-y-auto">
        {logs.map((msg, index) => (
          <p key={index} className={`${msg.includes("Error") ? "text-red-500" : msg.includes("Warning") ? "text-yellow-400" : "text-white"}`}>
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
