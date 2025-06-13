import { getDb } from './db.js';

async function seedMoreProblems() {
  try {
    console.log('Connecting to MongoDB...');
    const db = getDb();
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
        title: "Longest Common Prefix",
        description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.",
        difficulty: "easy",
        tags: ["string", "array"],
        constraints: "1 <= strs.length <= 200\n0 <= strs[i].length <= 200\nstrs[i] consists of only lowercase English letters.",
        inputFormat: "First line contains n (number of strings)\nNext n lines contain the strings",
        outputFormat: "The longest common prefix string",
        examples: [
          {
            input: "3\nflower\nflow\nflight",
            output: "fl",
            explanation: "The longest common prefix is 'fl'."
          },
          {
            input: "3\ndog\nracecar\ncar",
            output: "",
            explanation: "There is no common prefix among the input strings."
          }
        ],
        testCases: [
          { input: "3\nflower\nflow\nflight", expectedOutput: "fl", isHidden: false },
          { input: "3\ndog\nracecar\ncar", expectedOutput: "", isHidden: false },
          { input: "1\nalone", expectedOutput: "alone", isHidden: true },
          { input: "2\nhello\nhellp", expectedOutput: "hell", isHidden: true },
          { input: "4\nprefix\npretest\npreparation\npress", expectedOutput: "pre", isHidden: true },
          { input: "3\na\nab\nabc", expectedOutput: "a", isHidden: true },
          { input: "2\n\ntest", expectedOutput: "", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "def longest_common_prefix(strs):\n    # Your code here\n    pass\n\nn = int(input())\nstrs = []\nfor _ in range(n):\n    strs.append(input().strip())\n\nresult = longest_common_prefix(strs)\nprint(result)",
          javascript: "function longestCommonPrefix(strs) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    if (lines.length === parseInt(lines[0]) + 1) {\n        const n = parseInt(lines[0]);\n        const strs = lines.slice(1, n + 1);\n        const result = longestCommonPrefix(strs);\n        console.log(result);\n        rl.close();\n    }\n});",
          cpp: "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nstring longestCommonPrefix(vector<string>& strs) {\n    // Your code here\n    return \"\";\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cin.ignore();\n    vector<string> strs(n);\n    for (int i = 0; i < n; i++) {\n        getline(cin, strs[i]);\n    }\n    string result = longestCommonPrefix(strs);\n    cout << result << endl;\n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
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
        id: 7,
        title: "Binary Tree Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
        difficulty: "easy",
        tags: ["stack", "tree", "depth-first-search", "binary-tree"],
        constraints: "The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
        inputFormat: "First line contains n (number of nodes)\nIf n > 0, next line contains n integers representing the tree in level order (null represented as -1)",
        outputFormat: "Space-separated integers representing inorder traversal",
        examples: [
          {
            input: "3\n1 -1 2 -1 -1 3",
            output: "1 3 2",
            explanation: "Inorder traversal of tree [1,null,2,null,null,3] is [1,3,2]."
          },
          {
            input: "0",
            output: "",
            explanation: "Empty tree has empty traversal."
          }
        ],
        testCases: [
          { input: "3\n1 -1 2 -1 -1 3", expectedOutput: "1 3 2", isHidden: false },
          { input: "0", expectedOutput: "", isHidden: false },
          { input: "1\n1", expectedOutput: "1", isHidden: false },
          { input: "3\n1 2 3", expectedOutput: "2 1 3", isHidden: true },
          { input: "7\n4 2 6 1 3 5 7", expectedOutput: "1 2 3 4 5 6 7", isHidden: true },
          { input: "5\n3 1 4 -1 2", expectedOutput: "1 2 3 4", isHidden: true },
          { input: "6\n1 2 3 4 5 6", expectedOutput: "4 2 5 1 6 3", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef build_tree(values):\n    if not values:\n        return None\n    \n    root = TreeNode(values[0])\n    queue = [root]\n    i = 1\n    \n    while queue and i < len(values):\n        node = queue.pop(0)\n        \n        if i < len(values) and values[i] != -1:\n            node.left = TreeNode(values[i])\n            queue.append(node.left)\n        i += 1\n        \n        if i < len(values) and values[i] != -1:\n            node.right = TreeNode(values[i])\n            queue.append(node.right)\n        i += 1\n    \n    return root\n\ndef inorder_traversal(root):\n    # Your code here\n    pass\n\nn = int(input())\nif n == 0:\n    print(\"\")\nelse:\n    values = list(map(int, input().split()))\n    root = build_tree(values)\n    result = inorder_traversal(root)\n    print(' '.join(map(str, result)) if result else \"\")",
          javascript: "class TreeNode {\n    constructor(val, left, right) {\n        this.val = (val===undefined ? 0 : val);\n        this.left = (left===undefined ? null : left);\n        this.right = (right===undefined ? null : right);\n    }\n}\n\nfunction buildTree(values) {\n    if (!values.length) return null;\n    \n    const root = new TreeNode(values[0]);\n    const queue = [root];\n    let i = 1;\n    \n    while (queue.length && i < values.length) {\n        const node = queue.shift();\n        \n        if (i < values.length && values[i] !== -1) {\n            node.left = new TreeNode(values[i]);\n            queue.push(node.left);\n        }\n        i++;\n        \n        if (i < values.length && values[i] !== -1) {\n            node.right = new TreeNode(values[i]);\n            queue.push(node.right);\n        }\n        i++;\n    }\n    \n    return root;\n}\n\nfunction inorderTraversal(root) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    const n = parseInt(lines[0]);\n    if ((n === 0 && lines.length === 1) || (n > 0 && lines.length === 2)) {\n        if (n === 0) {\n            console.log('');\n        } else {\n            const values = lines[1].split(' ').map(Number);\n            const root = buildTree(values);\n            const result = inorderTraversal(root);\n            console.log(result.length ? result.join(' ') : '');\n        }\n        rl.close();\n    }\n});",
          cpp: "#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nTreeNode* buildTree(vector<int>& values) {\n    if (values.empty()) return nullptr;\n    \n    TreeNode* root = new TreeNode(values[0]);\n    queue<TreeNode*> q;\n    q.push(root);\n    int i = 1;\n    \n    while (!q.empty() && i < values.size()) {\n        TreeNode* node = q.front();\n        q.pop();\n        \n        if (i < values.size() && values[i] != -1) {\n            node->left = new TreeNode(values[i]);\n            q.push(node->left);\n        }\n        i++;\n        \n        if (i < values.size() && values[i] != -1) {\n            node->right = new TreeNode(values[i]);\n            q.push(node->right);\n        }\n        i++;\n    }\n    \n    return root;\n}\n\nvector<int> inorderTraversal(TreeNode* root) {\n    // Your code here\n    return {};\n}\n\nint main() {\n    int n;\n    cin >> n;\n    \n    if (n == 0) {\n        cout << \"\" << endl;\n        return 0;\n    }\n    \n    vector<int> values(n);\n    for (int i = 0; i < n; i++) {\n        cin >> values[i];\n    }\n    \n    TreeNode* root = buildTree(values);\n    vector<int> result = inorderTraversal(root);\n    \n    for (int i = 0; i < result.size(); i++) {\n        if (i > 0) cout << \" \";\n        cout << result[i];\n    }\n    if (!result.empty()) cout << endl;\n    \n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
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
        id: 9,
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
        difficulty: "easy",
        tags: ["linked-list", "recursion"],
        constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
        inputFormat: "First line contains n1 (length of first list)\nSecond line contains n1 integers (first list values)\nThird line contains n2 (length of second list)\nFourth line contains n2 integers (second list values)",
        outputFormat: "Space-separated integers representing the merged sorted list",
        examples: [
          {
            input: "3\n1 2 4\n3\n1 3 4",
            output: "1 1 2 3 4 4",
            explanation: "Merging [1,2,4] and [1,3,4] gives [1,1,2,3,4,4]."
          },
          {
            input: "0\n\n1\n0",
            output: "0",
            explanation: "Merging [] and [0] gives [0]."
          }
        ],
        testCases: [
          { input: "3\n1 2 4\n3\n1 3 4", expectedOutput: "1 1 2 3 4 4", isHidden: false },
          { input: "0\n\n1\n0", expectedOutput: "0", isHidden: false },
          { input: "0\n\n0\n", expectedOutput: "", isHidden: false },
          { input: "1\n1\n1\n2", expectedOutput: "1 2", isHidden: true },
          { input: "2\n1 3\n2\n2 4", expectedOutput: "1 2 3 4", isHidden: true },
          { input: "5\n1 2 3 4 5\n0\n", expectedOutput: "1 2 3 4 5", isHidden: true },
          { input: "3\n-1 0 1\n2\n-2 3", expectedOutput: "-2 -1 0 1 3", isHidden: true }
        ],
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          python: "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef create_linked_list(values):\n    if not values:\n        return None\n    head = ListNode(values[0])\n    current = head\n    for i in range(1, len(values)):\n        current.next = ListNode(values[i])\n        current = current.next\n    return head\n\ndef linked_list_to_array(head):\n    result = []\n    current = head\n    while current:\n        result.append(current.val)\n        current = current.next\n    return result\n\ndef merge_two_lists(list1, list2):\n    # Your code here\n    pass\n\nn1 = int(input())\nif n1 > 0:\n    list1_vals = list(map(int, input().split()))\nelse:\n    list1_vals = []\n    input()  # consume empty line\n\nn2 = int(input())\nif n2 > 0:\n    list2_vals = list(map(int, input().split()))\nelse:\n    list2_vals = []\n    if n2 == 0:\n        try:\n            input()  # consume empty line if exists\n        except:\n            pass\n\nlist1 = create_linked_list(list1_vals)\nlist2 = create_linked_list(list2_vals)\n\nmerged = merge_two_lists(list1, list2)\nresult = linked_list_to_array(merged)\n\nif result:\n    print(' '.join(map(str, result)))\nelse:\n    print(\"\")",
          javascript: "class ListNode {\n    constructor(val, next) {\n        this.val = (val===undefined ? 0 : val);\n        this.next = (next===undefined ? null : next);\n    }\n}\n\nfunction createLinkedList(values) {\n    if (!values.length) return null;\n    const head = new ListNode(values[0]);\n    let current = head;\n    for (let i = 1; i < values.length; i++) {\n        current.next = new ListNode(values[i]);\n        current = current.next;\n    }\n    return head;\n}\n\nfunction linkedListToArray(head) {\n    const result = [];\n    let current = head;\n    while (current) {\n        result.push(current.val);\n        current = current.next;\n    }\n    return result;\n}\n\nfunction mergeTwoLists(list1, list2) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    if (lines.length >= 4 || (lines.length >= 2 && parseInt(lines[0]) === 0 && parseInt(lines[lines.length-1]) === 0)) {\n        const n1 = parseInt(lines[0]);\n        const list1Vals = n1 > 0 ? lines[1].split(' ').map(Number) : [];\n        const n2 = parseInt(lines[n1 > 0 ? 2 : 1]);\n        const list2Vals = n2 > 0 ? lines[n1 > 0 ? 3 : 2].split(' ').map(Number) : [];\n        \n        const list1 = createLinkedList(list1Vals);\n        const list2 = createLinkedList(list2Vals);\n        \n        const merged = mergeTwoLists(list1, list2);\n        const result = linkedListToArray(merged);\n        \n        console.log(result.length ? result.join(' ') : '');\n        rl.close();\n    }\n});",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nListNode* createLinkedList(vector<int>& values) {\n    if (values.empty()) return nullptr;\n    ListNode* head = new ListNode(values[0]);\n    ListNode* current = head;\n    for (int i = 1; i < values.size(); i++) {\n        current->next = new ListNode(values[i]);\n        current = current->next;\n    }\n    return head;\n}\n\nvector<int> linkedListToArray(ListNode* head) {\n    vector<int> result;\n    ListNode* current = head;\n    while (current) {\n        result.push_back(current->val);\n        current = current->next;\n    }\n    return result;\n}\n\nListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // Your code here\n    return nullptr;\n}\n\nint main() {\n    int n1;\n    cin >> n1;\n    vector<int> list1Vals(n1);\n    for (int i = 0; i < n1; i++) {\n        cin >> list1Vals[i];\n    }\n    \n    int n2;\n    cin >> n2;\n    vector<int> list2Vals(n2);\n    for (int i = 0; i < n2; i++) {\n        cin >> list2Vals[i];\n    }\n    \n    ListNode* list1 = createLinkedList(list1Vals);\n    ListNode* list2 = createLinkedList(list2Vals);\n    \n    ListNode* merged = mergeTwoLists(list1, list2);\n    vector<int> result = linkedListToArray(merged);\n    \n    for (int i = 0; i < result.size(); i++) {\n        if (i > 0) cout << \" \";\n        cout << result[i];\n    }\n    if (!result.empty()) cout << endl;\n    \n    return 0;\n}"
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
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
      }
    ];

    // Insert problems
    for (const problem of problems) {
      await collection.replaceOne(
        { id: problem.id },
        problem,
        { upsert: true }
      );
    }

    console.log(`Successfully seeded ${problems.length} additional problems!`);
    
  } catch (error) {
    console.error('Error seeding problems:', error);
  }
}

seedMoreProblems();