// Script to seed the database with sample problems
import { connectToMongoDB } from './db.ts';

async function seedProblems() {
  try {
    console.log('Connecting to database...');
    const db = await connectToMongoDB();
    
    console.log('Adding sample problems...');
    
    // Sample problems with proper structure
    const problems = [
      {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "easy",
        tags: ["array", "hash-table"],
        constraints: "2 ≤ nums.length ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9",
        inputFormat: "First line contains n (array length)\nSecond line contains n integers\nThird line contains target integer",
        outputFormat: "Two integers representing the indices (0-based)",
        examples: [
          {
            input: "4\n2 7 11 15\n9",
            output: "0 1",
            explanation: "nums[0] + nums[1] = 2 + 7 = 9"
          }
        ],
        testCases: [
          {
            input: "4\n2 7 11 15\n9",
            expectedOutput: "0 1",
            isHidden: false
          },
          {
            input: "3\n3 2 4\n6",
            expectedOutput: "1 2",
            isHidden: false
          },
          {
            input: "2\n3 3\n6",
            expectedOutput: "0 1",
            isHidden: true
          }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def two_sum(nums, target):\n    # Your code here\n    pass\n\n# Read input\nn = int(input())\nnums = list(map(int, input().split()))\ntarget = int(input())\n\n# Solve and print result\nresult = two_sum(nums, target)\nprint(result[0], result[1])",
          javascript: "function twoSum(nums, target) {\n    // Your code here\n}\n\n// Read input\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    if (lines.length === 3) {\n        const n = parseInt(lines[0]);\n        const nums = lines[1].split(' ').map(Number);\n        const target = parseInt(lines[2]);\n        \n        const result = twoSum(nums, target);\n        console.log(result[0], result[1]);\n        rl.close();\n    }\n});",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n    return {};\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n    int target;\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    cout << result[0] << \" \" << result[1] << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters.",
        difficulty: "easy",
        tags: ["string", "two-pointers"],
        constraints: "1 ≤ s.length ≤ 10^5\ns[i] is a printable ascii character.",
        inputFormat: "A single line containing the string to reverse",
        outputFormat: "The reversed string",
        examples: [
          {
            input: "hello",
            output: "olleh",
            explanation: "The string 'hello' reversed is 'olleh'"
          }
        ],
        testCases: [
          {
            input: "hello",
            expectedOutput: "olleh",
            isHidden: false
          },
          {
            input: "world",
            expectedOutput: "dlrow",
            isHidden: false
          },
          {
            input: "a",
            expectedOutput: "a",
            isHidden: true
          }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def reverse_string(s):\n    # Your code here\n    pass\n\n# Read input\ns = input().strip()\nresult = reverse_string(s)\nprint(result)",
          javascript: "function reverseString(s) {\n    // Your code here\n}\n\n// Read input\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    const result = reverseString(line.trim());\n    console.log(result);\n    rl.close();\n});",
          cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring reverseString(string s) {\n    // Your code here\n    return s;\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    string result = reverseString(s);\n    cout << result << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "medium",
        tags: ["string", "stack"],
        constraints: "1 ≤ s.length ≤ 10^4\ns consists of parentheses only '()[]{}'.",
        inputFormat: "A single line containing the string of parentheses",
        outputFormat: "true if valid, false otherwise",
        examples: [
          {
            input: "()",
            output: "true",
            explanation: "The parentheses are properly matched"
          },
          {
            input: "()[]{}",
            output: "true",
            explanation: "All parentheses are properly matched"
          },
          {
            input: "(]",
            output: "false",
            explanation: "Mismatched parentheses"
          }
        ],
        testCases: [
          {
            input: "()",
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: "()[]{}",
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: "(]",
            expectedOutput: "false",
            isHidden: false
          },
          {
            input: "([)]",
            expectedOutput: "false",
            isHidden: true
          },
          {
            input: "{[]}",
            expectedOutput: "true",
            isHidden: true
          }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def is_valid(s):\n    # Your code here\n    pass\n\n# Read input\ns = input().strip()\nresult = is_valid(s)\nprint('true' if result else 'false')",
          javascript: "function isValid(s) {\n    // Your code here\n}\n\n// Read input\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    const result = isValid(line.trim());\n    console.log(result ? 'true' : 'false');\n    rl.close();\n});",
          cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Your code here\n    return true;\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    bool result = isValid(s);\n    cout << (result ? \"true\" : \"false\") << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Clear existing problems
    await db.collection('problems').deleteMany({});
    
    // Insert sample problems
    await db.collection('problems').insertMany(problems);
    
    console.log(`Successfully added ${problems.length} sample problems to the database`);
    
    // Also create a test user if it doesn't exist
    const existingUser = await db.collection('users').findOne({ email: 'test@example.com' });
    if (!existingUser) {
      const testUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('users').insertOne(testUser);
      console.log('Created test user: test@example.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding problems:', error);
    process.exit(1);
  }
}

seedProblems();