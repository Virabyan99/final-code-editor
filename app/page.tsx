"use client";
import { useState, useRef } from "react";
import { Play, Trash2, Moon } from "lucide-react";
import CodeEditor from "@/components/Editor";
import Console from "@/components/Console"; // Import Console Component

export default function Home() {
  const [dividerX, setDividerX] = useState(50);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Function to execute code from the editor
 // Function to execute code from the editor
const executeCode = (code: string) => {
  setShowConsole(true); // Show console panel when "Run" is clicked

  try {
    // Capture console.log, console.warn, and console.error output
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
      logs.push(`❌ Error: ${args.join(" ")}`);
      originalError(...args);
    };

    // Execute the JavaScript code inside a try-catch block
    (function executeSafely() {
      try {
        eval(code); // Use eval instead of new Function to catch errors properly
      } catch (error) {
        logs.push(`❌ Error: ${error.message}`);
      }
    })();

    // Restore console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;

    // Update the state with captured logs
    setConsoleOutput(logs);
  } catch (error) {
    setConsoleOutput([`❌ Error: ${error.message}`]);
  }
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
            <Console logs={consoleOutput} clearLogs={() => setConsoleOutput([])} />
          ) : (
            <p className="text-gray-100 text-center">Reference Panel</p> // Keep Reference Panel by default
          )}
          <Moon className="absolute bottom-2 right-2 text-gray-100 opacity-50 hover:opacity-100 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
