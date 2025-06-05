import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Send } from "lucide-react";

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
}

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

const STARTER_CODE = {
  python: `def solution(nums, target):
    # Write your solution here
    pass`,
  javascript: `function solution(nums, target) {
    // Write your solution here
}`,
  java: `public class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
  c: `#include <stdio.h>
#include <stdlib.h>

int* solution(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    *returnSize = 0;
    return NULL;
}`,
};

export function CodeEditor({
  language,
  code,
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [monaco, setMonaco] = useState<any>(null);

  useEffect(() => {
    // Load Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/monaco-editor@0.34.1/min/vs/loader.js';
    script.onload = () => {
      (window as any).require.config({ 
        paths: { 
          'vs': 'https://unpkg.com/monaco-editor@0.34.1/min/vs' 
        } 
      });
      (window as any).require(['vs/editor/editor.main'], (monaco: any) => {
        setMonaco(monaco);
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (monaco && editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value: code,
        language: getMonacoLanguage(language),
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        cursorStyle: 'line',
        wordWrap: 'on',
      });

      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      return () => {
        editor.dispose();
      };
    }
  }, [monaco, language, onChange]);

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'python': return 'python';
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      default: return 'javascript';
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange(newLanguage);
    onChange(STARTER_CODE[newLanguage as keyof typeof STARTER_CODE] || "");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            {onRun && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onRun}
                disabled={isRunning}
              >
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? "Running..." : "Run Code"}
              </Button>
            )}
            {onSubmit && (
              <Button 
                size="sm"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-1" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div 
        ref={editorRef} 
        className="flex-1 min-h-0"
        style={{ height: '400px' }}
      />

      {/* Fallback Textarea (if Monaco fails to load) */}
      {!monaco && (
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-4 font-mono text-sm bg-gray-900 text-gray-100 border-none outline-none resize-none"
          placeholder="Write your code here..."
          style={{ minHeight: '400px' }}
        />
      )}
    </div>
  );
}
