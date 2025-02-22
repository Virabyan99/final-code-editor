import { useRef, useEffect, useState } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";

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
      const javascript = monaco.languages.getLanguages().find(lang => lang.id === 'javascript');
      if (javascript) {
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
    editor.focus();
    editor.setPosition({ lineNumber: 1, column: 1 });
  };

  const runCode = () => {
    if (monacoRef.current) {
      const code = monacoRef.current.getValue();
      onRun(code);
    }
  };

  return (
    <div className="relative h-full w-full">
      <Editor
        height="100vh"
        width="100%"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue=""
        beforeMount={handleBeforeMount}
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
          folding: false,
          wordWrap: "on",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorStyle: "line",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 46 },
          scrollBeyondLastLine: false,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          hover: { enabled: false },
          parameterHints: { enabled: false },
          contextmenu: false,
          formatOnType: false,
          formatOnPaste: false,
          autoClosingBrackets: "never",
          autoClosingComments: "never",
          autoClosingQuotes: "never",
          autoIndent: "none",
          autoSurround: "never",
          autoClosingDelete: "never",
          renderValidationDecorations: "off",
        }}
      />
      <button
        onClick={runCode}
        className="absolute top-1 right-2 size-12 text-white px-2 text-xl opacity-50 hover:opacity-100 cursor-pointer"
      >
        ▶
      </button>
    </div>
  );
}