import { useRef, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { Play } from "lucide-react";

export default function CodeEditor({ onRun }: { onRun: (code: string) => void }) {
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editorMounted, setEditorMounted] = useState(false);
  const [isPlaceholderRemoved, setIsPlaceholderRemoved] = useState(false);

  useEffect(() => {
    if (editorMounted && monacoRef.current) {
      monacoRef.current.focus();
    }
  }, [editorMounted]);

  const handleEditorMount: OnMount = (editor) => {
    monacoRef.current = editor;
    setEditorMounted(true);

    // Focus editor automatically on load
    editor.focus();

    // Move cursor to the end of the default text
    const model = editor.getModel();
    if (model) {
      const lastLine = model.getLineCount();
      const lastColumn = model.getLineMaxColumn(lastLine);
      editor.setPosition({ lineNumber: lastLine, column: lastColumn });
    }

    // Remove placeholder text immediately on first keystroke
    editor.onDidChangeModelContent(() => {
      if (!isPlaceholderRemoved) {
        const currentValue = editor.getValue();
        if (currentValue.startsWith("console.log('Hello World');")) {
          editor.setValue(""); // Clear placeholder immediately
          setIsPlaceholderRemoved(true);
        }
      }
    });
  };

  return (
    <div className="relative h-full w-full">
      <Editor
        height="100vh"
        width="100%"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="console.log('Hello World');"
        onMount={handleEditorMount}
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          lineHeight: 22,
          lineNumbers: "off",
          minimap: { enabled: false },
          scrollbar: {
            vertical: "visible",
            horizontal: "auto",
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 8,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          renderLineHighlight: "none",
          guides: { indentation: false },
          folding: false,
          wordWrap: "on",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorStyle: "line",
          padding: { top: 17 },
          scrollBeyondLastLine: false,
          quickSuggestions: true,
        }}
      />

      {/* "Run" Button (Play Icon) */}
      <button
        onClick={() => {
          if (monacoRef.current) {
            onRun(monacoRef.current.getValue()); // Execute the code when button is clicked
          }
        }}
      >
        <Play
          className="absolute top-2 right-2 opacity-50 hover:opacity-100 cursor-pointer text-gray-100"
        />
      </button>
    </div>
  );
}
