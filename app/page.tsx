"use client";
import { useState, useRef } from "react";
import { Play, Moon } from "lucide-react";

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
    <div className="flex h-screen w-screen bg-neutral-900 text-white">
      {/* Left Panel - Editor */}
      <div className="h-full relative p-4" style={{ width: `${dividerX}%` }}>
        <p className="text-neutral-400">Editor Panel</p>
        <Play className="absolute top-2 right-2 opacity-50 hover:opacity-100 cursor-pointer" />
      </div>

      {/* Draggable Divider */}
      <div
        ref={dividerRef}
        className="w-2 bg-neutral-700 cursor-ew-resize"
        onMouseDown={handleMouseDown}
      ></div>

      {/* Right Panel - Console/Reference */}
      <div className="flex-1 p-4 relative">
        <p className="text-neutral-400">Console / Reference Panel</p>
        <Moon className="absolute bottom-2 right-2 opacity-50 hover:opacity-100 cursor-pointer" />
      </div>
    </div>
  );
}
