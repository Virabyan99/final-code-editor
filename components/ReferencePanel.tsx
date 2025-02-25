import { useState, useEffect, useCallback } from "react";

// Debounce utility function
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default function ReferencePanel({
  userCode,
  onApplyAllFixes,
}: {
  userCode: string;
  onApplyAllFixes: (code: string) => void;
}) {
  const [formattedCode, setFormattedCode] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [diffLines, setDiffLines] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Optional: Show loading state

  // Memoized processCode function
  const processCode = useCallback(async (code: string) => {
    if (!code) {
      setFormattedCode("");
      setAiSuggestions("");
      setDiffLines([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Format the following code and provide suggestions for improvement:\n\n${code}\n\nReturn the response in this format:\n- Formatted Code: [your formatted code here]\n- Suggestions: [your suggestions here]`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      const result = data.result;
      if (typeof result !== "string") {
        throw new Error("API response is not a string");
      }

      const formattedMatch = result.match(
        /Formatted Code:\s*```(?:javascript)?\s*([\s\S]*?)\s*```/
      );
      const suggestionsMatch = result.match(/Suggestions:\s*([\s\S]*)/);

      const formatted = formattedMatch ? formattedMatch[1].trim() : code;
      const suggestions = suggestionsMatch
        ? suggestionsMatch[1].trim()
        : "No suggestions provided.";

      const userLines = code.split("\n");
      const formattedLines = formatted.split("\n");
      const differingLines = userLines
        .map((line, i) => (line.trim() !== formattedLines[i]?.trim() ? i : -1))
        .filter((i) => i !== -1);

      setFormattedCode(formatted);
      setAiSuggestions(suggestions);
      setDiffLines(differingLines);
    } catch (error) {
      console.error("Error processing code:", error);
      setFormattedCode(code);
      setAiSuggestions(`Error: ${error.message}`);
      setDiffLines([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced version of processCode
  const debouncedProcessCode = useCallback(debounce(processCode, 2000), [processCode]);

  useEffect(() => {
    debouncedProcessCode(userCode);
  }, [userCode, debouncedProcessCode]);

  return (
    <div className="h-full p-4 flex flex-col gap-4 overflow-y-auto">
      <p className="text-neutral-400 text-center">Reference Code (AI-Enhanced)</p>
      <div className="flex-1">
        <pre className="bg-neutral-900 p-4 rounded-md text-white whitespace-pre-wrap flex-1 overflow-auto">
          {isLoading ? (
            <span className="text-gray-400">Processing...</span>
          ) : (
            formattedCode.split("\n").map((line, i) => (
              <span
                key={i}
                className={diffLines.includes(i) ? "bg-yellow-300/20" : ""}
                style={{ display: "block" }}
              >
                {line}
              </span>
            ))
          )}
        </pre>
      </div>
      <p className="text-neutral-400 text-center">AI Suggestions</p>
      <div className="flex-1">
        <pre className="bg-neutral-900 p-4 rounded-md text-white whitespace-pre-wrap overflow-auto">
          {isLoading ? "Waiting for suggestions..." : aiSuggestions}
        </pre>
      </div>
      <button
        className="bg-green-500 px-3 py-1 rounded mt-2 disabled:bg-gray-500"
        onClick={() => onApplyAllFixes(formattedCode)}
        disabled={!formattedCode || formattedCode === userCode || isLoading}
      >
        Apply All Fixes
      </button>
    </div>
  );
}