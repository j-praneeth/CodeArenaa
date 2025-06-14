import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

// Configure Monaco workers for Vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  }
};

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
        // Configure TypeScript compiler options to prevent worker errors
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types']
        });

        // Disable semantic validation for TypeScript to prevent worker errors
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false
        });

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