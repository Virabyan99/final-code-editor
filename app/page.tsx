"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Trash2, Moon } from "lucide-react";
import CodeEditor from "@/components/Editor";
import Console from "@/components/Console";

export default function Home() {
  const [dividerX, setDividerX] = useState(50);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{ type: string; message: any[] }[]>([]);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [previousShowConsole, setPreviousShowConsole] = useState(false);

  // Clear console output when switching from console to reference mode
  useEffect(() => {
    if (!showConsole && previousShowConsole) {
      setConsoleOutput([]); // Clear console output when user starts typing
      setAiMessages([]); // Clear AI messages as well
    }
    setPreviousShowConsole(showConsole);
  }, [showConsole]);

  useEffect(() => {
    // Create Web Worker (corrected path to public/worker.js)
    const newWorker = new Worker(new URL("../public/worker.ts", import.meta.url), { type: "module" });

    newWorker.onmessage = (event) => {
      const { type, message } = event.data;
      if (type === "clear") {
        setConsoleOutput([]); // Clear console output on console.clear()
        setAiMessages([]); // Clear AI messages
      } else {
        setConsoleOutput((prev) => [...prev, { type, message }]);
        if (type === "error") {
          const explanation = explainError(message.join(" "));
          if (explanation) setAiMessages((prev) => [...prev, explanation]);
        }
      }
    };

    setWorker(newWorker);
    return () => newWorker.terminate();
  }, []);

  useEffect(() => {
    // Listen for messages from the Iframe
    const handleIframeMessage = (event) => {
      if (event.data?.type === "log") {
        setConsoleOutput((prev) => [...prev, { type: "log", message: [event.data.message] }]);
      } else if (event.data?.type === "error") {
        setConsoleOutput((prev) => [...prev, { type: "error", message: [event.data.message] }]);
        const explanation = explainError(event.data.message.join(" "));
        if (explanation) setAiMessages((prev) => [...prev, explanation]);
      }
    };

    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, []);

  // Function to execute code from the editor
  const executeCode = (code: string) => {
    setShowConsole(true); // Show console panel when "Run" is clicked

    if (code.includes("document") || code.includes("window")) {
      // Send to Iframe if it needs DOM access
      iframeRef.current?.contentWindow?.postMessage({ type: "execute", code }, "*");
    } else {
      // Otherwise, execute securely in the Web Worker
      worker?.postMessage(code);
    }
  };

  // Simulate AI-generated explanations (hardcoded for now)
  const explainError = (message: string) => {
    if (message.includes("is not defined")) {
      return "🟡 This means you're trying to use a variable that hasn’t been declared.";
    } else if (message.includes("Invalid or unexpected token")) {
      return "🟡 There’s a syntax error. Check for missing semicolons or brackets.";
    } else if (message.includes("Cannot read properties of undefined")) {
      return "🟡 You’re accessing a property of an undefined object. Ensure it’s defined.";
    } else if (message.length > 0) {
      return `🟡 This is a custom error message you logged: "${message}"`;
    }
    return "";
  };

  // Handle dragging of the divider
  const handleMouseMove = (e: MouseEvent) => {
    if (!dividerRef.current) return;
    setDividerX((e.clientX / window.innerWidth) * 100);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-200">
      {/* Main Editor Container */}
      <div className="w-[99%] h-[98%] bg-gray-300 rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Panel - Monaco Editor */}
        <div className="relative rounded-r-lg overflow-hidden" style={{ width: `${dividerX}%` }}>
          <CodeEditor onRun={executeCode} onContentChanged={() => setShowConsole(false)} />
        </div>
        {/* Draggable Divider */}
        <div ref={dividerRef} className="w-2 bg-gray-300 cursor-ew-resize" onMouseDown={handleMouseDown}></div>
        {/* Right Panel - Console/Reference */}
        <div className="flex-1 flex flex-col p-4 bg-neutral-900 relative rounded-l-lg">
          {showConsole ? (
            <Console logs={consoleOutput} clearLogs={() => { setConsoleOutput([]); setAiMessages([]); }} aiMessages={aiMessages} />
          ) : (
            <p className="text-gray-100">Reference Panel</p>
          )}
          <Moon className="absolute bottom-2 right-2 text-gray-100 opacity-50 hover:opacity-100 cursor-pointer" />
          {/* Hidden Iframe for DOM execution */}
          <iframe ref={iframeRef} src="/sandbox.html" style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}