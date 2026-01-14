/**
 * Validates analytics script for XSS attacks
 * @returns A validation function that detects potentially dangerous XSS patterns
 */
export const xssValidator = (value: string) => {
  if (!value || value.trim() === "") {
    return null;
  }

  const script = value.trim();

  // Dangerous patterns that indicate XSS attempts
  const dangerousPatterns = [
    // Event handlers in HTML attributes (case-insensitive)
    {
      pattern: /on\w+\s*=\s*["'][^"']*["']/gi,
      message: "Event handlers (onclick, onerror, etc.) are not allowed",
    },
    // JavaScript: URLs
    {
      pattern: /javascript\s*:/gi,
      message: "JavaScript: URLs are not allowed",
    },
    // VBScript: URLs
    {
      pattern: /vbscript\s*:/gi,
      message: "VBScript: URLs are not allowed",
    },
    // Data URLs with script/html content
    {
      pattern: /data\s*:\s*text\s*\/\s*(html|javascript)/gi,
      message: "Data URLs with HTML or JavaScript content are not allowed",
    },
    // Eval and Function constructors
    {
      pattern: /eval\s*\(/gi,
      message: "eval() function is not allowed",
    },
    {
      pattern: /new\s+Function\s*\(/gi,
      message: "Function constructor is not allowed",
    },
    // Dangerous HTML tags (excluding script which is allowed for analytics)
    {
      pattern: /<iframe[^>]*>/gi,
      message: "iframe tags are not allowed",
    },
    {
      pattern: /<embed[^>]*>/gi,
      message: "embed tags are not allowed",
    },
    {
      pattern: /<object[^>]*>/gi,
      message: "object tags are not allowed",
    },
    {
      pattern: /<svg[^>]*>[\s\S]*<script/gi,
      message: "Script tags inside SVG are not allowed",
    },
    // Script injection attempts
    {
      pattern:
        /<script[^>]*>[\s\S]*<\/script>[\s\S]*<script[^>]*>[\s\S]*document\.(write|writeln)/gi,
      message: "document.write/writeln in script tags is not allowed",
    },
    // Cookie/localStorage manipulation (may be too strict, but safer)
    {
      pattern: /document\.cookie\s*=/gi,
      message: "Cookie manipulation is not allowed",
    },
    // Base64 encoded script attempts (common XSS technique)
    {
      pattern: /data\s*:\s*text\s*\/\s*html\s*;\s*base64/gi,
      message: "Base64 encoded HTML data URLs are not allowed",
    },
    {
      pattern: /alert\s*\([\s\S]*[\)]/gi,
      message: "alert() function is not allowed",
    },
    // DOM manipulation (dangerous for XSS)
    {
      pattern: /\.(innerHTML|outerHTML|innerText|outerText)\s*=/gi,
      message: "DOM innerHTML/outerHTML manipulation is not allowed",
    },
    {
      pattern: /insertAdjacentHTML\s*\(/gi,
      message: "insertAdjacentHTML is not allowed",
    },
    // Timer functions with string arguments (code injection)
    {
      pattern: /(setTimeout|setInterval)\s*\(\s*["']/gi,
      message: "setTimeout/setInterval with string arguments is not allowed",
    },
    // Navigation and window manipulation
    {
      pattern: /(location|window\.location)\.(href|replace|assign)\s*=/gi,
      message: "Location manipulation is not allowed",
    },
    {
      pattern: /window\.open\s*\(/gi,
      message: "window.open() is not allowed",
    },
    {
      pattern: /history\.(pushState|replaceState)\s*\(/gi,
      message: "History manipulation is not allowed",
    },
    // Other dangerous global functions
    {
      pattern: /(confirm|prompt)\s*\(/gi,
      message: "confirm()/prompt() functions are not allowed",
    },
    // Base64 encoding/decoding (often used for obfuscation)
    {
      pattern: /(atob|btoa)\s*\(/gi,
      message: "Base64 encoding/decoding functions are not allowed",
    },
    // String.fromCharCode (often used for obfuscation)
    {
      pattern: /String\.fromCharCode\s*\(/gi,
      message: "String.fromCharCode is not allowed",
    },
    // CSS injection vectors
    {
      pattern: /expression\s*\(/gi,
      message: "CSS expression() is not allowed (IE XSS vector)",
    },
    {
      pattern: /-moz-binding\s*:/gi,
      message: "Moz-binding is not allowed (Firefox XSS vector)",
    },
    {
      pattern: /@import\s+/gi,
      message: "CSS @import is not allowed",
    },
    // Additional dangerous HTML tags
    {
      pattern: /<link[^>]*>/gi,
      message: "link tags are not allowed",
    },
    {
      pattern: /<meta[^>]*>/gi,
      message: "meta tags are not allowed",
    },
    {
      pattern: /<style[^>]*>[\s\S]*<\/style>/gi,
      message: "style tags are not allowed",
    },
    {
      pattern: /<form[^>]*>/gi,
      message: "form tags are not allowed",
    },
    // Web Workers and other APIs
    {
      pattern: /importScripts\s*\(/gi,
      message: "importScripts is not allowed",
    },
    {
      pattern: /new\s+Worker\s*\(/gi,
      message: "Web Workers are not allowed",
    },
    {
      pattern: /new\s+SharedWorker\s*\(/gi,
      message: "Shared Workers are not allowed",
    },
    // WebSocket (potential data exfiltration)
    {
      pattern: /new\s+WebSocket\s*\(/gi,
      message: "WebSocket connections are not allowed",
    },
    // XMLHttpRequest and Fetch (potential data exfiltration)
    {
      pattern: /new\s+XMLHttpRequest\s*\(/gi,
      message: "XMLHttpRequest is not allowed",
    },
    {
      pattern: /fetch\s*\(/gi,
      message: "fetch() API is not allowed",
    },
    // postMessage (cross-window communication)
    {
      pattern: /postMessage\s*\(/gi,
      message: "postMessage is not allowed",
    },
    // Storage manipulation (beyond cookies)
    {
      pattern:
        /(localStorage|sessionStorage)\.(setItem|removeItem|clear)\s*\(/gi,
      message: "localStorage/sessionStorage manipulation is not allowed",
    },
    // Dangerous prototype manipulation
    {
      pattern: /\.__proto__\s*=/gi,
      message: "Prototype manipulation is not allowed",
    },
    {
      pattern: /Object\.(defineProperty|defineProperties)\s*\(/gi,
      message: "Object property definition is not allowed",
    },
    // Common obfuscation techniques
    {
      pattern: /unescape\s*\(/gi,
      message: "unescape() function is not allowed",
    },
    {
      pattern: /decodeURIComponent\s*\(/gi,
      message:
        "decodeURIComponent() is not allowed (potential encoding bypass)",
    },
    // Event listener manipulation
    {
      pattern: /\.(addEventListener|attachEvent|on\w+)\s*\(/gi,
      message: "Event listener manipulation is not allowed",
    },
    // Document manipulation
    {
      pattern:
        /document\.(createElement|createTextNode|createDocumentFragment)\s*\(/gi,
      message: "Dynamic DOM creation is not allowed",
    },
    // Source mapping and source code access
    {
      pattern: /\.(src|href)\s*=\s*["']/gi,
      message: "Dynamic src/href assignment is not allowed",
    },
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(script)) {
      return `Security violation detected: ${message}`;
    }
  }

  return null;
};
