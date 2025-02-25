import { useRef, useEffect, useState } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import  * as monaco from "monaco-editor";
import { saveBreakpoint, getBreakpoints } from "@/utils/historyDB";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Debounce utility for cursor updates
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export default function CodeEditor({
  onRun,
  onContentChanged,
}: {
  onRun: (code: string) => void;
  onContentChanged: () => void;
}) {
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null); // Store decoration collection
  const [editorMounted, setEditorMounted] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [lastSavedCode, setLastSavedCode] = useState<string>("");

  useEffect(() => {
    if (editorMounted && monacoRef.current) {
      monacoRef.current.focus();
    }
  }, [editorMounted]);

  // Load history from IndexedDB on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const breakpoints = await getBreakpoints();
        const historyArray = breakpoints.map((entry) => entry.code);
        console.log("Loaded history from IndexedDB:", historyArray);
        setHistory(historyArray);
        setCurrentIndex(-1); // Start with a blank editor
      } catch (error) {
        console.error("Failed to load history from IndexedDB:", error);
      }
    }
    loadHistory();
  }, []);

  // Define custom theme before editor mounts
  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme("plain", {
      base: "vs-dark",
      inherit: false,
      rules: [
        { token: "delimiter.curly", foreground: "ffffff" },
        { token: "delimiter.parenthesis", foreground: "ffffff" },
        { token: "delimiter.bracket", foreground: "ffffff" },
        { token: "delimiter", foreground: "ffffff" },
        { token: "punctuation", foreground: "ffffff" },
        { token: "operator", foreground: "ffffff" },
        { token: "keyword", foreground: "ffffff" },
        { token: "string", foreground: "ffffff" },
        { token: "number", foreground: "ffffff" },
        { token: "comment", foreground: "ffffff" },
        { token: "variable", foreground: "ffffff" },
        { token: "identifier", foreground: "ffffff" },
        { token: "function", foreground: "ffffff" },
        { token: "", foreground: "ffffff" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#ffffff",
        "editorCursor.foreground": "#1e1e1e", // Match background for dark theme
        "editor.lineHighlightBackground": "#ffffff0f",
        "editor.selectionBackground": "#ffffff33",
        "editorBracketMatch.background": "#ffffff00",
        "editorBracketMatch.border": "#ffffff00",
      },
    });
    monaco.editor.setTheme("plain");
  };

  // Editor mount handler
  const handleEditorMount: OnMount = (editor, monaco) => {
    monacoRef.current = editor;
    setEditorMounted(true);
    editor.focus();
    editor.setPosition({ lineNumber: 1, column: 1 });

    let timeout: NodeJS.Timeout | null = null;

    // Create decorations collection for custom cursor
    decorationsRef.current = editor.createDecorationsCollection();

    // Debounced cursor update function
    const debouncedUpdateCursor = debounce(() => {
      updateCustomCursor(monaco); // Use monaco instance passed here
    }, 16); // Approximately 60 FPS for smooth updates

    // Handle content changes (breakpoint saving and cursor update)
    editor.onDidChangeModelContent(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const code = editor.getValue().trim();

        // Save breakpoint on semicolon or closing brace
        if ((/[;}]\s*$/.test(code) || code.endsWith("}")) && code !== lastSavedCode) {
          console.log("Saving breakpoint after idle:", code);
          saveBreakpoint(code)
            .then(() => {
              setHistory((prev) => {
                const newHistory = [...prev, code];
                console.log("Updated history:", newHistory);
                setLastSavedCode(code);
                setCurrentIndex(newHistory.length - 1); // Point to latest entry
                return newHistory;
              });
            })
            .catch((error) => {
              console.error("Failed to save breakpoint:", error);
            });
        }
      }, 1000); // Save after 1 second idle

      // Notify parent of content change and update cursor
      onContentChanged();
      debouncedUpdateCursor();
    });

    // Update cursor on position change with debounce
    editor.onDidChangeCursorPosition(() => {
      debouncedUpdateCursor();
    });

    // Set initial custom cursor
    updateCustomCursor(monaco);
  };

  // Function to update the custom arrow cursor
  const updateCustomCursor = (monaco: Monaco) => {
    if (monacoRef.current && decorationsRef.current) {
      const editor = monacoRef.current;
      const position = editor.getPosition();
      if (position) {
        const cursorPosition = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        );

        const newDecorations = [
          {
            range: cursorPosition,
            options: {
              isWholeLine: false,
              afterContentClassName: "custom-arrow-cursor", // CSS class for arrow
            },
          },
        ];

        // Update decorations using the collection
        decorationsRef.current.set(newDecorations);
      }
    }
  };

  // Navigate backward in history
  const handleNavigateBack = () => {
    if (currentIndex > 0 && monacoRef.current) {
      console.log("Navigating back to index:", currentIndex - 1);
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      monacoRef.current.setValue(history[newIndex]);
      updateCustomCursor(monaco); // Update cursor after navigation
    }
  };

  // Navigate forward in history
  const handleNavigateForward = () => {
    if (currentIndex < history.length - 1 && monacoRef.current) {
      console.log("Navigating forward to index:", currentIndex + 1);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      monacoRef.current.setValue(history[newIndex]);
      updateCustomCursor(monaco); // Update cursor after navigation
    } else if (currentIndex === history.length - 1 && monacoRef.current) {
      console.log("At latest history, clearing editor");
      setCurrentIndex(history.length);
      monacoRef.current.setValue("");
      updateCustomCursor(monaco); // Update cursor after clearing
    }
  };

  // Run code handler
  const runCode = () => {
    if (monacoRef.current) {
      const code = monacoRef.current.getValue();
      onRun(code);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-1 left-2 flex space-x-2">
        <button
          onClick={handleNavigateBack}
          className="size-12 text-white px-2 text-xl z-30 opacity-50 hover:opacity-100 cursor-pointer"
          disabled={currentIndex <= 0}
        >
          <ChevronLeft />
        </button>
        <button
          onClick={handleNavigateForward}
          className="size-12 text-white px-2 text-xl z-30 opacity-50 hover:opacity-100 cursor-pointer"
          disabled={currentIndex >= history.length}
        >
          <ChevronRight />
        </button>
      </div>
      <Editor
        height="100vh"
        width="100%"
        theme="plain"
        defaultLanguage="javascript"
        defaultValue=""
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily: "Fira Code",
          lineHeight: 28.4,
          lineNumbers: "off",
          minimap: { enabled: false },
          colorDecorators: false,
          bracketPairColorization: { enabled: false },
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
          cursorStyle: "block", // Use block style for easier hiding
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
