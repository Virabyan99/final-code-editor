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
    // Define the plain theme to set all text, including symbols, to white
    monaco.editor.defineTheme('plain', {
      base: 'vs-dark', // Base theme for background reference
      inherit: false, // Do not inherit any default rules
      rules: [
        // Specific token rules first
        { token: 'delimiter.curly', foreground: 'ffffff' }, // { }
        { token: 'delimiter.parenthesis', foreground: 'ffffff' }, // ( )
        { token: 'delimiter.bracket', foreground: 'ffffff' }, // [ ]
        { token: 'delimiter', foreground: 'ffffff' }, // General delimiters
        { token: 'punctuation', foreground: 'ffffff' }, // Commas, semicolons
        { token: 'operator', foreground: 'ffffff' }, // +, -, *, /
        { token: 'keyword', foreground: 'ffffff' }, // if, else, etc.
        { token: 'string', foreground: 'ffffff' }, // Strings
        { token: 'number', foreground: 'ffffff' }, // Numbers
        { token: 'comment', foreground: 'ffffff' }, // Comments
        { token: 'variable', foreground: 'ffffff' }, // Variables
        { token: 'identifier', foreground: 'ffffff' }, // Identifiers
        { token: 'function', foreground: 'ffffff' }, // Functions
        { token: '', foreground: 'ffffff' }, // Catch-all rule at the end
      ],
      colors: {
        'editor.background': '#1e1e1e',               // Dark background
        'editor.foreground': '#ffffff',               // Default text color
        'editorCursor.foreground': '#ffffff',         // White cursor
        'editor.lineHighlightBackground': '#ffffff0f', // Subtle line highlight
        'editor.selectionBackground': '#ffffff33',    // Selection highlight
        'editorBracketMatch.background': '#ffffff00', // No background for brackets
        'editorBracketMatch.border': '#ffffff00',     // No border for brackets
      }
    });

    // Apply the custom theme
    monaco.editor.setTheme('plain');

    // Existing language configuration
    if (monaco.languages) {
      const javascript = monaco.languages.getLanguages().find((lang) => lang.id === 'javascript');
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
    editor.setPosition({ lineNumber: 1, column: 1 }); // Explicitly set cursor to start
  };

  // Function to execute code when "Run" is clicked
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
        theme="plain" // Use the custom theme
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
          defaultColorDecorators: false,
          bracketPairColorization: { enabled: false }, // Disable bracket colorization
          colorDecoratorsLimit: 0,
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
          renderValidationDecorations: "off", // Disable syntax error underlines
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
