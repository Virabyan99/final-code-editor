import { useState, useEffect } from "react";

export default function ReferencePanel({
  userCode,
  onApplyAllFixes,
}: {
  userCode: string;
  onApplyAllFixes: () => void;
}) {
  const [displayCode, setDisplayCode] = useState("");

  // Simply set the userCode as the display code when it changes
  useEffect(() => {
    setDisplayCode(userCode);
  }, [userCode]);

  return (
    <div className="h-full p-4">
      <p className="text-neutral-400 text-center">Reference Code</p>
      <pre className="bg-neutral-700 p-4 rounded-md text-white whitespace-pre-wrap">
        {displayCode}
      </pre>
      <button
        className="bg-green-500 px-3 py-1 rounded mt-2"
        onClick={onApplyAllFixes}
      >
        Apply All Fixes
      </button>
    </div>
  );
}