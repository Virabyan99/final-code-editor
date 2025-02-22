// public/worker.js
self.console = {
  log: (...args) => self.postMessage({ type: "log", message: args }),
  warn: (...args) => self.postMessage({ type: "warn", message: args }),
  error: (...args) => self.postMessage({ type: "error", message: args }),
  info: (...args) => self.postMessage({ type: "info", message: args }),
  clear: () => self.postMessage({ type: "clear" }),
};

self.onmessage = async (event) => {
  try {
    const code = event.data;
    let result;
    result = await new Function(`"use strict"; return (async () => { ${code} })()`)();
    if (result !== undefined) {
      self.postMessage({ type: "log", message: [result] });
    }
  } catch (error) {
    self.postMessage({ type: "error", message: [error.message] });
  }
};