// Direct database insertion script
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Get MongoDB URI from environment - use the same one the server uses
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/competitive-programming';

async function addProblems() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('problems');
    
    const problems = [
      {
        id: 4,
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
        difficulty: "easy",
        tags: ["math", "string"],
        constraints: "-2^31 <= x <= 2^31 - 1",
        inputFormat: "A single integer x",
        outputFormat: "true if palindrome, false otherwise",
        examples: [
          {
            input: "121",
            output: "true",
            explanation: "121 reads as 121 from left to right and from right to left."
          },
          {
            input: "-121",
            output: "false", 
            explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
          }
        ],
        testCases: [
          { input: "121", expectedOutput: "true", isHidden: false },
          { input: "-121", expectedOutput: "false", isHidden: false },
          { input: "10", expectedOutput: "false", isHidden: false },
          { input: "0", expectedOutput: "true", isHidden: true },
          { input: "1221", expectedOutput: "true", isHidden: true },
          { input: "12321", expectedOutput: "true", isHidden: true },
          { input: "123456", expectedOutput: "false", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def is_palindrome(x):\n    # Your code here\n    pass\n\nx = int(input())\nresult = is_palindrome(x)\nprint('true' if result else 'false')",
          javascript: "function isPalindrome(x) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    const x = parseInt(line);\n    const result = isPalindrome(x);\n    console.log(result ? 'true' : 'false');\n    rl.close();\n});",
          cpp: "#include <iostream>\nusing namespace std;\n\nbool isPalindrome(int x) {\n    // Your code here\n    return false;\n}\n\nint main() {\n    int x;\n    cin >> x;\n    bool result = isPalindrome(x);\n    cout << (result ? \"true\" : \"false\") << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        difficulty: "medium",
        tags: ["array", "dynamic-programming", "divide-and-conquer"],
        constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        inputFormat: "First line contains n (array length)\nSecond line contains n integers",
        outputFormat: "The maximum sum of any subarray",
        examples: [
          {
            input: "9\n-2 1 -3 4 -1 2 1 -5 4",
            output: "6",
            explanation: "The subarray [4,-1,2,1] has the largest sum 6."
          },
          {
            input: "1\n1",
            output: "1",
            explanation: "The subarray [1] has the largest sum 1."
          }
        ],
        testCases: [
          { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isHidden: false },
          { input: "1\n1", expectedOutput: "1", isHidden: false },
          { input: "5\n5 4 -1 7 8", expectedOutput: "23", isHidden: false },
          { input: "1\n-1", expectedOutput: "-1", isHidden: true },
          { input: "3\n-2 -3 -1", expectedOutput: "-1", isHidden: true },
          { input: "6\n1 2 3 4 5 6", expectedOutput: "21", isHidden: true },
          { input: "4\n-1 2 3 -4", expectedOutput: "5", isHidden: true },
          { input: "8\n-2 -1 2 1 -2 1 1 -1", expectedOutput: "3", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def max_subarray(nums):\n    # Your code here\n    pass\n\nn = int(input())\nnums = list(map(int, input().split()))\n\nresult = max_subarray(nums)\nprint(result)",
          javascript: "function maxSubArray(nums) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    if (lines.length === 2) {\n        const n = parseInt(lines[0]);\n        const nums = lines[1].split(' ').map(Number);\n        const result = maxSubArray(nums);\n        console.log(result);\n        rl.close();\n    }\n});",
          cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n    int result = maxSubArray(nums);\n    cout << result << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "easy",
        tags: ["math", "dynamic-programming", "memoization"],
        constraints: "1 <= n <= 45",
        inputFormat: "A single integer n",
        outputFormat: "The number of distinct ways to climb to the top",
        examples: [
          {
            input: "2",
            output: "2",
            explanation: "There are two ways to climb to the top: 1+1 or 2."
          },
          {
            input: "3",
            output: "3",
            explanation: "There are three ways to climb to the top: 1+1+1, 1+2, or 2+1."
          }
        ],
        testCases: [
          { input: "1", expectedOutput: "1", isHidden: false },
          { input: "2", expectedOutput: "2", isHidden: false },
          { input: "3", expectedOutput: "3", isHidden: false },
          { input: "4", expectedOutput: "5", isHidden: true },
          { input: "5", expectedOutput: "8", isHidden: true },
          { input: "10", expectedOutput: "89", isHidden: true },
          { input: "20", expectedOutput: "10946", isHidden: true },
          { input: "35", expectedOutput: "14930352", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def climb_stairs(n):\n    # Your code here\n    pass\n\nn = int(input())\nresult = climb_stairs(n)\nprint(result)",
          javascript: "function climbStairs(n) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    const n = parseInt(line);\n    const result = climbStairs(n);\n    console.log(result);\n    rl.close();\n});",
          cpp: "#include <iostream>\nusing namespace std;\n\nint climbStairs(int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    int result = climbStairs(n);\n    cout << result << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        title: "Best Time to Buy and Sell Stock",
        description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        difficulty: "easy",
        tags: ["array", "dynamic-programming"],
        constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
        inputFormat: "First line contains n (number of days)\nSecond line contains n integers representing stock prices",
        outputFormat: "The maximum profit that can be achieved",
        examples: [
          {
            input: "6\n7 1 5 3 6 4",
            output: "5",
            explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
          },
          {
            input: "5\n7 6 4 3 1",
            output: "0",
            explanation: "No profit can be achieved since prices keep decreasing."
          }
        ],
        testCases: [
          { input: "6\n7 1 5 3 6 4", expectedOutput: "5", isHidden: false },
          { input: "5\n7 6 4 3 1", expectedOutput: "0", isHidden: false },
          { input: "2\n1 2", expectedOutput: "1", isHidden: false },
          { input: "1\n1", expectedOutput: "0", isHidden: true },
          { input: "4\n2 4 1 5", expectedOutput: "4", isHidden: true },
          { input: "7\n3 2 6 5 0 3 1", expectedOutput: "4", isHidden: true },
          { input: "5\n1 2 3 4 5", expectedOutput: "4", isHidden: true },
          { input: "8\n2 1 2 1 0 1 2 3", expectedOutput: "3", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def max_profit(prices):\n    # Your code here\n    pass\n\nn = int(input())\nprices = list(map(int, input().split()))\n\nresult = max_profit(prices)\nprint(result)",
          javascript: "function maxProfit(prices) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    if (lines.length === 2) {\n        const n = parseInt(lines[0]);\n        const prices = lines[1].split(' ').map(Number);\n        const result = maxProfit(prices);\n        console.log(result);\n        rl.close();\n    }\n});",
          cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> prices(n);\n    for (int i = 0; i < n; i++) {\n        cin >> prices[i];\n    }\n    int result = maxProfit(prices);\n    cout << result << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        title: "Fibonacci Number",
        description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).",
        difficulty: "easy",
        tags: ["math", "dynamic-programming", "recursion", "memoization"],
        constraints: "0 <= n <= 30",
        inputFormat: "A single integer n",
        outputFormat: "The nth Fibonacci number",
        examples: [
          {
            input: "2",
            output: "1",
            explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1."
          },
          {
            input: "3",
            output: "2",
            explanation: "F(3) = F(2) + F(1) = 1 + 1 = 2."
          },
          {
            input: "4",
            output: "3",
            explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3."
          }
        ],
        testCases: [
          { input: "0", expectedOutput: "0", isHidden: false },
          { input: "1", expectedOutput: "1", isHidden: false },
          { input: "2", expectedOutput: "1", isHidden: false },
          { input: "3", expectedOutput: "2", isHidden: false },
          { input: "4", expectedOutput: "3", isHidden: true },
          { input: "5", expectedOutput: "5", isHidden: true },
          { input: "10", expectedOutput: "55", isHidden: true },
          { input: "15", expectedOutput: "610", isHidden: true },
          { input: "20", expectedOutput: "6765", isHidden: true },
          { input: "25", expectedOutput: "75025", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def fib(n):\n    # Your code here\n    pass\n\nn = int(input())\nresult = fib(n)\nprint(result)",
          javascript: "function fib(n) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    const n = parseInt(line);\n    const result = fib(n);\n    console.log(result);\n    rl.close();\n});",
          cpp: "#include <iostream>\nusing namespace std;\n\nint fib(int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    int result = fib(n);\n    cout << result << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 9,
        title: "Remove Duplicates from Sorted Array",
        description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Return the number of unique elements in nums.",
        difficulty: "easy",
        tags: ["array", "two-pointers"],
        constraints: "1 <= nums.length <= 3 * 10^4\n-100 <= nums[i] <= 100\nnums is sorted in non-decreasing order.",
        inputFormat: "First line contains n (array length)\nSecond line contains n integers in sorted order",
        outputFormat: "The number of unique elements",
        examples: [
          {
            input: "3\n1 1 2",
            output: "2",
            explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively."
          },
          {
            input: "10\n0 0 1 1 1 2 2 3 3 4",
            output: "5",
            explanation: "Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively."
          }
        ],
        testCases: [
          { input: "3\n1 1 2", expectedOutput: "2", isHidden: false },
          { input: "10\n0 0 1 1 1 2 2 3 3 4", expectedOutput: "5", isHidden: false },
          { input: "1\n1", expectedOutput: "1", isHidden: false },
          { input: "2\n1 2", expectedOutput: "2", isHidden: true },
          { input: "5\n1 1 1 1 1", expectedOutput: "1", isHidden: true },
          { input: "6\n1 2 2 3 3 3", expectedOutput: "3", isHidden: true },
          { input: "8\n-1 0 0 0 0 3 3 3", expectedOutput: "3", isHidden: true },
          { input: "7\n-3 -1 0 0 0 3 3", expectedOutput: "4", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def remove_duplicates(nums):\n    # Your code here\n    pass\n\nn = int(input())\nnums = list(map(int, input().split()))\n\nresult = remove_duplicates(nums)\nprint(result)",
          javascript: "function removeDuplicates(nums) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    if (lines.length === 2) {\n        const n = parseInt(lines[0]);\n        const nums = lines[1].split(' ').map(Number);\n        const result = removeDuplicates(nums);\n        console.log(result);\n        rl.close();\n    }\n});",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint removeDuplicates(vector<int>& nums) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n    int result = removeDuplicates(nums);\n    cout << result << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert problems
    for (const problem of problems) {
      await collection.replaceOne(
        { id: problem.id },
        problem,
        { upsert: true }
      );
      console.log(`Added problem: ${problem.title}`);
    }

    console.log(`Successfully added ${problems.length} new problems!`);
    
  } catch (error) {
    console.error('Error adding problems:', error);
  } finally {
    await client.close();
  }
}

addProblems();