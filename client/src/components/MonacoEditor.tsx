import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

// Configure worker paths
(self as any).MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string) {
    const getWorkerUrl = (path: string) => {
      return new URL(path, import.meta.url).href;
    };

    switch (label) {
      case 'json':
        return getWorkerUrl('monaco-editor/esm/vs/language/json/json.worker.js');
      case 'css':
      case 'scss':
      case 'less':
        return getWorkerUrl('monaco-editor/esm/vs/language/css/css.worker.js');
      case 'html':
      case 'handlebars':
      case 'razor':
        return getWorkerUrl('monaco-editor/esm/vs/language/html/html.worker.js');
      case 'typescript':
      case 'javascript':
        return getWorkerUrl('monaco-editor/esm/vs/language/typescript/ts.worker.js');
      default:
        return getWorkerUrl('monaco-editor/esm/vs/editor/editor.worker.js');
    }
  }
};

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export function MonacoEditor({ 
  value, 
  onChange, 
  language = 'javascript', 
  height = '400px',
  readOnly = false 
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: 'vs-dark',
        automaticLayout: true,
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
        wordWrap: 'on',
        folding: true,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        selectOnLineNumbers: true,
        matchBrackets: 'always',
      });

      const editor = monacoEditorRef.current;
      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== value) {
      monacoEditorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  return <div ref={editorRef} style={{ height }} />;
}