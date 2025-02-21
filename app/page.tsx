"use client";
import { useState, useRef } from "react";
import { Play, Trash2, Moon } from "lucide-react";
import CodeEditor from "@/components/Editor";
import Console from "@/components/Console";

export default function Home() {
  const [dividerX, setDividerX] = useState(50);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState<string[]>([]);

  // Function to execute code from the editor
  const executeCode = (code: string) => {
    setShowConsole(true); // Show console panel when "Run" is clicked
    setConsoleOutput([]); // Clear previous logs
    setAiMessages([]); // Clear previous AI messages

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => {
        logs.push(args.join(" "));
        originalLog(...args);
      };

      console.warn = (...args) => {
        logs.push(`⚠️ Warning: ${args.join(" ")}`);
        originalWarn(...args);
      };

      console.error = (...args) => {
        const message = args.join(" ");
        logs.push(`❌ Error: ${message}`);
        const explanation = explainError(message); // Simulate AI explanation
        if (explanation) setAiMessages((prev) => [...prev, explanation]);
        // Avoid calling originalError to prevent Next.js overlay
      };

      // Execute the JavaScript code
      (function executeSafely() {
        try {
          eval(code);
        } catch (error) {
          logs.push(`❌ Error: ${error.message}`);
          const explanation = explainError(error.message);
          if (explanation) setAiMessages((prev) => [...prev, explanation]);
        }
      })();

      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      setConsoleOutput(logs);
    } catch (error) {
      setConsoleOutput([`❌ Error: ${error.message}`]);
      const explanation = explainError(error.message);
      if (explanation) setAiMessages((prev) => [...prev, explanation]);
    }
  };

  // Simulate AI-generated explanations (hardcoded for now; replace with Biome/AI integration later)
  const explainError = (message: string) => {
    // TODO: Integrate Biome or AI API (e.g., xAI's Grok) to dynamically generate these
    if (message.includes("is not defined")) {
      return "🟡 This means you're trying to use a variable that hasn’t been declared.";
    } else if (message.includes("Invalid or unexpected token")) {
      return "🟡 There’s a syntax error. Check for missing semicolons or brackets.";
    } else if (message.includes("Cannot read properties of undefined")) {
      return "🟡 You’re accessing a property of an undefined object. Ensure it’s defined.";
    } else if (message.length > 0) {
      // Catch-all for custom errors like console.error("Hello")
      return `🟡 This is a custom error message you logged: "${message}"`;
    }
    return ""; // No explanation for unrecognized errors
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
          <CodeEditor onRun={executeCode} />
        </div>
        {/* Draggable Divider */}
        <div ref={dividerRef} className="w-2 bg-gray-300 cursor-ew-resize" onMouseDown={handleMouseDown}></div>
        {/* Right Panel - Console/Reference */}
        <div className="flex-1 flex flex-col p-4 bg-neutral-900 relative rounded-l-lg">
          {showConsole ? (
            <Console logs={consoleOutput} clearLogs={() => { setConsoleOutput([]); setAiMessages([]); }} aiMessages={aiMessages} />
          ) : (
            <p className="text-gray-100 text-center">Reference Panel</p>
          )}
          <Moon className="absolute bottom-2 right-2 text-gray-100 opacity-50 hover:opacity-100 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}