"use client";
import { useState, useRef } from "react";
import { Play, Moon } from "lucide-react";
import CodeEditor from "@/components/Editor";

export default function Home() {
  const [dividerX, setDividerX] = useState(50); // Default split: 50%
  const dividerRef = useRef<HTMLDivElement>(null);

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
        {/* Left Panel - Monaco Editor (Rounded Left Side) */}
        <div
          className="relative rounded-r-lg overflow-hidden"
          style={{ width: `${dividerX}%` }}
        >
          <CodeEditor />
          <Play className="absolute top-2 right-2 opacity-50 hover:opacity-100 cursor-pointer text-gray-100" />
        </div>

        {/* Draggable Divider (No Rounded Corners) */}
        <div
          ref={dividerRef}
          className="w-2 bg-gray-300 cursor-ew-resize"
          onMouseDown={handleMouseDown}
        ></div>

        {/* Right Panel - Console/Reference (Rounded Right Side) */}
        <div className="flex-1 flex flex-col p-4 bg-neutral-900 relative rounded-l-lg">
          <p className="text-gray-100 text-center">Console / Reference Panel</p>
          <Moon className="absolute bottom-2 right-2 text-gray-100 opacity-50 hover:opacity-100 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
