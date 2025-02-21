import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'

export default function Console({
  logs,
  clearLogs,
  aiMessages,
}: {
  logs: string[]
  clearLogs: () => void
  aiMessages: string[] // Added to receive AI messages from page.tsx
}) {
  const consoleRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the latest log
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs, aiMessages])

  return (
    <div className="h-full overflow-clip transition-opacity duration-300">
      <div className="flex justify-end items-center">
        <Trash2
          className="opacity-50 hover:opacity-100  text-gray-100 cursor-pointer"
          onClick={() => {
            clearLogs() // Clears both logs and AI messages via page.tsx
          }}
        />
      </div>
      <div ref={consoleRef} className="mt-2 leading-loose h-full overflow-y-auto">
        {logs.map((msg, index) => (
          <p
            key={index}
            className={` text-[14px]  ${
              msg.includes('Error')
                ? 'text-red-500'
                : msg.includes('Warning')
                ? 'text-yellow-400'
                : 'text-white'
            }`}>
            {msg}
          </p>
        ))}
        {aiMessages.map((msg, index) => (
          <p key={index} className="text-blue-300 text-[14px] ">
            {msg}
          </p>
        ))}
      </div>
    </div>
  )
}
