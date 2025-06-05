import { useEffect, useRef } from "react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  theme?: string;
}

export function MonacoEditor({ 
  value, 
  onChange, 
  language, 
  height = "400px",
  theme = "vs-dark" 
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadMonaco = async () => {
      if (!editorRef.current) return;

      try {
        // Dynamically import Monaco Editor
        const monaco = await import("monaco-editor");
        
        // Configure Monaco
        monaco.editor.defineTheme("custom-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#1e1e1e",
          },
        });

        // Create editor instance
        const editor = monaco.editor.create(editorRef.current, {
          value,
          language,
          theme: theme === "vs-dark" ? "custom-dark" : "vs",
          fontSize: 14,
          fontFamily: "JetBrains Mono, Monaco, Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          lineNumbers: "on",
          folding: true,
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: "line",
          cursorBlinking: "solid",
        });

        // Handle value changes
        editor.onDidChangeModelContent(() => {
          const newValue = editor.getValue();
          onChange(newValue);
        });

        monacoInstanceRef.current = editor;

        // Cleanup function
        return () => {
          editor.dispose();
        };
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error);
        // Fallback to textarea
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.className = "w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none border-0 outline-none";
        textarea.style.minHeight = height;
        textarea.addEventListener("input", (e) => {
          onChange((e.target as HTMLTextAreaElement).value);
        });
        
        if (editorRef.current) {
          editorRef.current.appendChild(textarea);
        }
      }
    };

    loadMonaco();

    return () => {
      if (monacoInstanceRef.current) {
        monacoInstanceRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (monacoInstanceRef.current && monacoInstanceRef.current.getValue() !== value) {
      monacoInstanceRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoInstanceRef.current) {
      const monaco = monacoInstanceRef.current.getModel();
      if (monaco) {
        (window as any).monaco?.editor.setModelLanguage(monaco, language);
      }
    }
  }, [language]);

  return (
    <div 
      ref={editorRef} 
      style={{ height }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    />
  );
}
