"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ReferencePanel from "@/components/ReferencePanel";
import { Play, Trash2, Moon } from "lucide-react";
import Console from "@/components/Console";

// Dynamically import Editor to bypass server-side rendering
const CodeEditor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function Home() {
  const [dividerX, setDividerX] = useState(50);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{ type: string; message: any[] }[]>([]);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [previousShowConsole, setPreviousShowConsole] = useState(false);
  const [userCode, setUserCode] = useState("");
  const codeEditorRef = useRef<{ setCode: (code: string) => void } | null>(null);

  // Clear console output when switching from console to reference mode
  useEffect(() => {
    if (!showConsole && previousShowConsole) {
      setConsoleOutput([]);
      setAiMessages([]);
    }
    setPreviousShowConsole(showConsole);
  }, [showConsole]);

  // Initialize Worker and Iframe listener only on client-side
  useEffect(() => {
    if (typeof window === "undefined") return; // Skip on server

    // Create Web Worker
    const newWorker = new Worker(new URL("../public/worker.ts", import.meta.url), { type: "module" });
    newWorker.onmessage = (event) => {
      const { type, message } = event.data;
      if (type === "clear") {
        setConsoleOutput([]);
        setAiMessages([]);
      } else {
        setConsoleOutput((prev) => [...prev, { type, message }]);
        if (type === "error") {
          const explanation = explainError(message.join(" "));
          if (explanation) setAiMessages((prev) => [...prev, explanation]);
        }
      }
    };
    setWorker(newWorker);

    // Listen for messages from the Iframe
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data?.type === "log") {
        setConsoleOutput((prev) => [...prev, { type: "log", message: [event.data.message] }]);
      } else if (event.data?.type === "error") {
        setConsoleOutput((prev) => [...prev, { type: "error", message: [event.data.message] }]);
        const explanation = explainError(event.data.message.join(" "));
        if (explanation) setAiMessages((prev) => [...prev, explanation]);
      }
    };
    window.addEventListener("message", handleIframeMessage);

    return () => {
      newWorker.terminate();
      window.removeEventListener("message", handleIframeMessage);
    };
  }, []);

  // Function to execute code from the editor
  const executeCode = (code: string) => {
    setShowConsole(true);
    if (code.includes("document") || code.includes("window")) {
      iframeRef.current?.contentWindow?.postMessage({ type: "execute", code }, "*");
    } else {
      worker?.postMessage(code);
    }
  };

  const applyAllFixes = (newCode: string) => {
    if (codeEditorRef.current) {
      codeEditorRef.current.setCode(newCode);
      setUserCode(newCode);
    }
  };

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
    if (!dividerRef.current || typeof window === "undefined") return;
    setDividerX((e.clientX / window.innerWidth) * 100);
  };

  const handleMouseUp = () => {
    if (typeof window === "undefined") return;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    if (typeof window === "undefined") return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-200">
      <div className="w-[99%] h-[98%] bg-gray-300 rounded-lg shadow-lg flex overflow-hidden">
        <div className="relative rounded-r-lg overflow-hidden" style={{ width: `${dividerX}%` }}>
          <CodeEditor
            onRun={executeCode}
            onContentChanged={() => setShowConsole(false)}
            onCodeChange={(code) => setUserCode(code)}
            ref={codeEditorRef}
          />
        </div>
        <div ref={dividerRef} className="w-2 bg-gray-300 cursor-ew-resize" onMouseDown={handleMouseDown}></div>
        <div className="flex-1 flex flex-col p-4 bg-neutral-900 relative rounded-l-lg">
          {showConsole ? (
            <Console logs={consoleOutput} clearLogs={() => { setConsoleOutput([]); setAiMessages([]); }} aiMessages={aiMessages} />
          ) : (
            <ReferencePanel userCode={userCode} onApplyAllFixes={applyAllFixes} />
          )}
          <Moon className="absolute bottom-2 right-2 text-gray-100 opacity-50 hover:opacity-100 cursor-pointer" />
          <iframe ref={iframeRef} src="/sandbox.html" style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}