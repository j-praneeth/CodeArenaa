import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  theme = 'vs-dark',
  options = {}
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !monacoEditor.current) {
      try {
        monacoEditor.current = monaco.editor.create(editorRef.current, {
          value,
          language,
          theme,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          ...options
        });

        monacoEditor.current.onDidChangeModelContent(() => {
          const currentValue = monacoEditor.current?.getValue() || '';
          onChange(currentValue);
        });
      } catch (error) {
        console.error('Failed to create Monaco editor:', error);
      }
    }

    return () => {
      if (monacoEditor.current) {
        monacoEditor.current.dispose();
        monacoEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (monacoEditor.current && monacoEditor.current.getValue() !== value) {
      try {
        monacoEditor.current.setValue(value);
      } catch (error) {
        console.error('Failed to set Monaco editor value:', error);
      }
    }
  }, [value]);

  useEffect(() => {
    if (monacoEditor.current) {
      try {
        const model = monacoEditor.current.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, language);
        }
      } catch (error) {
        console.error('Failed to set Monaco editor language:', error);
      }
    }
  }, [language]);

  useEffect(() => {
    if (monacoEditor.current) {
      try {
        monaco.editor.setTheme(theme);
      } catch (error) {
        console.error('Failed to set Monaco editor theme:', error);
      }
    }
  }, [theme]);

  return <div ref={editorRef} style={{ height }} />;
}