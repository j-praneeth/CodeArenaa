import { useEffect, useRef } from "react";
import type { Problem } from "@shared/schema";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  problem?: Problem;
}

export function CodeEditor({ value, onChange, language, problem }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Mock Monaco Editor implementation
  // In a real implementation, you would use @monaco-editor/react
  useEffect(() => {
    if (editorRef.current) {
      // Initialize Monaco Editor here
      // For now, we'll use a simple textarea
    }
  }, [language]);

  const getStarterCode = () => {
    if (problem?.starterCode && typeof problem.starterCode === 'object') {
      const starterCode = problem.starterCode as Record<string, string>;
      return starterCode[language] || getDefaultStarterCode();
    }
    return getDefaultStarterCode();
  };

  const getDefaultStarterCode = () => {
    switch (language) {
      case "python":
        return `def solution(nums, target):
    # Write your solution here
    pass`;
      case "java":
        return `public class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`;
      case "cpp":
        return `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`;
      case "javascript":
        return `function solution(nums, target) {
    // Write your solution here
    return [];
}`;
      default:
        return "// Write your solution here";
    }
  };

  const currentCode = value || getStarterCode();

  return (
    <div className="h-full bg-gray-900 text-gray-100">
      <textarea
        ref={editorRef}
        value={currentCode}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none border-none outline-none"
        placeholder="Write your solution here..."
        spellCheck={false}
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      />
    </div>
  );
}
