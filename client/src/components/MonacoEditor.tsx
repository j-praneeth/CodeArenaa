
import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  height?: string | number;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor({
  value,
  onChange,
  language = 'javascript',
  theme = 'vs-dark',
  height = '400px',
  options = {}
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    try {
      // Configure Monaco Editor worker paths
      self.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
          const getWorkerModule = (moduleUrl: string, fallbackUrl: string) => {
            return new URL(moduleUrl, import.meta.url).href;
          };

          switch (label) {
            case 'json':
              return getWorkerModule(
                '/monaco-editor/esm/vs/language/json/json.worker?worker',
                '/monaco-editor/esm/vs/language/json/json.worker.js'
              );
            case 'css':
            case 'scss':
            case 'less':
              return getWorkerModule(
                '/monaco-editor/esm/vs/language/css/css.worker?worker',
                '/monaco-editor/esm/vs/language/css/css.worker.js'
              );
            case 'html':
            case 'handlebars':
            case 'razor':
              return getWorkerModule(
                '/monaco-editor/esm/vs/language/html/html.worker?worker',
                '/monaco-editor/esm/vs/language/html/html.worker.js'
              );
            case 'typescript':
            case 'javascript':
              return getWorkerModule(
                '/monaco-editor/esm/vs/language/typescript/ts.worker?worker',
                '/monaco-editor/esm/vs/language/typescript/ts.worker.js'
              );
            default:
              return getWorkerModule(
                '/monaco-editor/esm/vs/editor/editor.worker?worker',
                '/monaco-editor/esm/vs/editor/editor.worker.js'
              );
          }
        }
      };

      // Create the editor
      const editor = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        ...options
      });

      monacoRef.current = editor;

      // Listen for content changes
      const disposable = editor.onDidChangeModelContent(() => {
        const newValue = editor.getValue();
        onChange(newValue);
      });

      return () => {
        disposable.dispose();
        editor.dispose();
      };
    } catch (error) {
      console.error('Monaco Editor initialization error:', error);
    }
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      const editor = monacoRef.current;
      const model = editor.getModel();
      if (model) {
        model.setValue(value);
      }
    }
  }, [value]);

  // Update editor language when prop changes
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Update editor theme when prop changes
  useEffect(() => {
    monaco.editor.setTheme(theme);
  }, [theme]);

  return (
    <div 
      ref={editorRef} 
      style={{ 
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: '6px'
      }} 
    />
  );
}
