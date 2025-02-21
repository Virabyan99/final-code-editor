import { useRef, useEffect, useState } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { Play } from "lucide-react";

export default function CodeEditor({ onRun }: { onRun: (code: string) => void }) {
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editorMounted, setEditorMounted] = useState(false);

  useEffect(() => {
    if (editorMounted && monacoRef.current) {
      monacoRef.current.focus();
    }
  }, [editorMounted]);

  // Handle Monaco initialization before the editor mounts
  const handleBeforeMount = (monaco: Monaco) => {
    if (monaco.languages) {
      // Use the proper way to set the configuration for the JavaScript language
      const javascript = monaco.languages.getLanguages().find(lang => lang.id === 'javascript');
      if (javascript) {
        // Correct way to set configuration for JavaScript
        monaco.languages.setLanguageConfiguration('javascript', {
          comments: {
            lineComment: "//",
            blockComment: ["/*", "*/"],
          },
          autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
          ],
        });
      } else {
        console.error("Monaco JavaScript language features are not loaded.");
      }

    }
  };

  const handleEditorMount: OnMount = (editor) => {
    monacoRef.current = editor;
    setEditorMounted(true);

    // Focus editor automatically on load and set cursor at start
    editor.focus();
    editor.setPosition({ lineNumber: 1, column: 1 }); // Explicitly set cursor to start
  };

  // Function to execute code when "Run" is clicked
  const runCode = () => {
    if (monacoRef.current) {
      const code = monacoRef.current.getValue();
      onRun(code); // Send code to Console Panel
    }
  };

  return (
    <div className="relative h-full w-full">
      <Editor
        height="100vh"
        width="100%"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="" // Empty editor, no placeholder
        beforeMount={handleBeforeMount} // Run before editor mounts to configure diagnostics
        onMount={handleEditorMount}
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          lineHeight: 28.4,
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
          folding: false, // Disable code folding
          wordWrap: "on",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorStyle: "line",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 46 },
          scrollBeyondLastLine: false,
          quickSuggestions: false, // Disable auto-suggestions
          suggestOnTriggerCharacters: false, // Disable suggestion triggers
          hover: { enabled: false }, // Disable hover popups
          parameterHints: { enabled: false }, // Disable parameter hints
          contextmenu: false, // Disable right-click context menu
          formatOnType: false, // Disable formatting on type
          formatOnPaste: false, // Disable formatting on paste
          autoClosingBrackets: "never", // Disable auto-closing brackets
          autoClosingComments: "never", // Disable auto-closing comments
          autoClosingQuotes: "never", // Disable auto-closing quotes
        }}
      />

      {/* "Run" Button (Play Icon) */}
      <button
        onClick={runCode}
        className="absolute top-1 right-2 size-12 text-white px-2 text-xl opacity-50 hover:opacity-100 cursor-pointer"
      >
        ▶
      </button>
    </div>
  );
}
