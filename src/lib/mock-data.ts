import { Chat, ChatId } from '@/types/chat'
import type { MessageId } from '@/types/message'
import { Message, MessageRole } from '@/types/message'
import { Workspace, WorkspaceId } from '@/types/workspace'
import { SourceFile, SourceFileId } from '@/types/source-file'
import type { FlashcardDto, ExamDto } from '@/types/data-item'

// Mock Workspaces
export const mockWorkspaces: Array<Workspace> = [
  new Workspace({
    id: WorkspaceId.make('ws_1'),
    name: 'Computer Science Studies',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z'),
  }),
  new Workspace({
    id: WorkspaceId.make('ws_2'),
    name: 'Machine Learning Course',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-18T16:45:00Z'),
  }),
  new Workspace({
    id: WorkspaceId.make('ws_3'),
    name: 'Mathematics Review',
    createdAt: new Date('2024-01-05T08:00:00Z'),
    updatedAt: new Date('2024-01-22T12:15:00Z'),
  }),
]

// Mock Chats
export const mockChats: Array<Chat> = [
  new Chat({
    id: ChatId.make('chat_1'),
    name: 'Data Structures Discussion',
    createdAt: new Date('2024-01-16T10:30:00Z'),
    updatedAt: new Date('2024-01-20T15:45:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_2'),
    name: 'Algorithm Complexity',
    createdAt: new Date('2024-01-17T14:00:00Z'),
    updatedAt: new Date('2024-01-19T11:20:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_3'),
    name: 'Neural Networks Basics',
    createdAt: new Date('2024-01-11T09:15:00Z'),
    updatedAt: new Date('2024-01-18T17:30:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_4'),
    name: 'Linear Algebra Help',
    createdAt: new Date('2024-01-06T13:45:00Z'),
    updatedAt: new Date('2024-01-22T10:10:00Z'),
  }),
]

// Mock Messages
export const mockMessages: Record<string, Array<Message>> = {
  chat_1: [
    new Message({
      id: 'msg_1' as MessageId,
      content:
        'Can you explain the difference between arrays and linked lists?',
      role: MessageRole.USER,
      createdAt: new Date('2024-01-16T10:30:00Z'),
    }),
    new Message({
      id: 'msg_2' as MessageId,
      content:
        'Arrays and linked lists are both linear data structures, but they have key differences:\n\n**Arrays:**\n- Elements stored in contiguous memory locations\n- Fixed size (in most languages)\n- Direct access to elements using index (O(1))\n- Cache-friendly due to spatial locality\n\n**Linked Lists:**\n- Elements (nodes) scattered in memory, connected via pointers\n- Dynamic size\n- Sequential access required (O(n) to access nth element)\n- Each node has extra memory overhead for storing pointers\n\n**When to use:**\n- Arrays: When you need fast random access and know the approximate size\n- Linked Lists: When you frequently insert/delete elements and size varies significantly',
      role: MessageRole.ASSISTANT,
      createdAt: new Date('2024-01-16T10:31:30Z'),
    }),
    new Message({
      id: 'msg_3' as MessageId,
      content: 'What about insertion and deletion performance?',
      role: MessageRole.USER,
      createdAt: new Date('2024-01-16T10:35:00Z'),
    }),
    new Message({
      id: 'msg_4' as MessageId,
      content:
        "Great question! Here's the performance breakdown:\n\n**Arrays:**\n- Insertion at end: O(1) amortized\n- Insertion at beginning/middle: O(n) due to shifting elements\n- Deletion at end: O(1)\n- Deletion at beginning/middle: O(n) due to shifting elements\n\n**Linked Lists:**\n- Insertion at beginning: O(1)\n- Insertion at end: O(1) if you have tail pointer, O(n) otherwise\n- Insertion at middle: O(1) if you have reference to node, O(n) to find position\n- Deletion: O(1) if you have reference to node, O(n) to find node\n\nSo linked lists excel when you frequently modify the structure, especially at the beginning or when you have references to specific nodes.",
      role: MessageRole.ASSISTANT,
      createdAt: new Date('2024-01-16T10:36:45Z'),
    }),
  ],
  chat_2: [
    new Message({
      id: 'msg_5' as MessageId,
      content: 'How do I analyze the time complexity of recursive algorithms?',
      role: MessageRole.USER,
      createdAt: new Date('2024-01-17T14:00:00Z'),
    }),
    new Message({
      id: 'msg_6' as MessageId,
      content:
        'Analyzing recursive algorithms involves several approaches:\n\n**1. Recurrence Relations**\nWrite the recurrence relation that describes the algorithm:\n- T(n) = aT(n/b) + f(n)\n- Where a = number of recursive calls, n/b = input size for each call, f(n) = work done outside recursion\n\n**2. Master Theorem**\nFor divide-and-conquer algorithms:\n- If f(n) = O(n^c) where c < log_b(a): T(n) = Θ(n^(log_b(a)))\n- If f(n) = Θ(n^c) where c = log_b(a): T(n) = Θ(n^c log n)\n- If f(n) = Ω(n^c) where c > log_b(a): T(n) = Θ(f(n))\n\n**3. Recursion Tree Method**\nVisualize the recursion as a tree and sum up work at each level\n\n**Example: Merge Sort**\nT(n) = 2T(n/2) + O(n)\nUsing Master Theorem: a=2, b=2, c=1\nSince c = log_2(2) = 1, we get T(n) = Θ(n log n)',
      role: MessageRole.ASSISTANT,
      createdAt: new Date('2024-01-17T14:03:20Z'),
    }),
  ],
  chat_3: [
    new Message({
      id: 'msg_7' as MessageId,
      content: 'What are the key components of a neural network?',
      role: MessageRole.USER,
      createdAt: new Date('2024-01-11T09:15:00Z'),
    }),
    new Message({
      id: 'msg_8' as MessageId,
      content:
        'Neural networks have several fundamental components:\n\n**1. Neurons (Nodes)**\n- Basic processing units that receive inputs, apply weights, and produce output\n- Contains activation function to introduce non-linearity\n\n**2. Layers**\n- Input Layer: Receives raw data\n- Hidden Layer(s): Process information between input and output\n- Output Layer: Produces final predictions\n\n**3. Weights and Biases**\n- Weights: Control the strength of connections between neurons\n- Biases: Allow shifting of activation function\n- Both are learned parameters updated during training\n\n**4. Activation Functions**\n- ReLU: f(x) = max(0, x) - most common for hidden layers\n- Sigmoid: f(x) = 1/(1 + e^(-x)) - outputs between 0 and 1\n- Tanh: f(x) = (e^x - e^(-x))/(e^x + e^(-x)) - outputs between -1 and 1\n- Softmax: Used in output layer for multi-class classification\n\n**5. Loss Function**\n- Measures difference between predicted and actual outputs\n- Examples: Mean Squared Error, Cross-entropy\n\n**6. Optimizer**\n- Algorithm to update weights and biases\n- Examples: SGD, Adam, RMSprop',
      role: MessageRole.ASSISTANT,
      createdAt: new Date('2024-01-11T09:18:45Z'),
    }),
  ],
  chat_4: [
    new Message({
      id: 'msg_9' as MessageId,
      content: 'I need help understanding eigenvalues and eigenvectors',
      role: MessageRole.USER,
      createdAt: new Date('2024-01-06T13:45:00Z'),
    }),
    new Message({
      id: 'msg_10' as MessageId,
      content:
        "Eigenvalues and eigenvectors are fundamental concepts in linear algebra:\n\n**Definition:**\nFor a square matrix A, if there exists a non-zero vector v such that:\nAv = λv\n\nThen:\n- v is an eigenvector of A\n- λ (lambda) is the corresponding eigenvalue\n\n**Geometric Interpretation:**\n- Eigenvectors are directions that don't change when the matrix transformation is applied\n- Eigenvalues tell us how much the eigenvector is scaled\n\n**Finding Eigenvalues:**\n1. Solve the characteristic equation: det(A - λI) = 0\n2. This gives you a polynomial whose roots are the eigenvalues\n\n**Finding Eigenvectors:**\n1. For each eigenvalue λ, solve: (A - λI)v = 0\n2. This gives you the null space, which contains the eigenvectors\n\n**Example:**\nA = [[3, 1], [0, 2]]\nCharacteristic equation: (3-λ)(2-λ) - 0 = 0\nEigenvalues: λ₁ = 3, λ₂ = 2\n\nFor λ₁ = 3: eigenvector [1, 0]\nFor λ₂ = 2: eigenvector [1, -1]\n\n**Applications:**\n- Principal Component Analysis (PCA)\n- Stability analysis of systems\n- Google PageRank algorithm\n- Quantum mechanics",
      role: MessageRole.ASSISTANT,
      createdAt: new Date('2024-01-06T13:49:30Z'),
    }),
  ],
}

// Mock Source Files
export const mockSourceFiles: Array<SourceFile> = [
  new SourceFile({
    id: SourceFileId.make('file_1'),
    name: 'data_structures_notes.pdf',
    type: 'file',
    size: 2458000,
    createdAt: new Date('2024-01-15T11:00:00Z'),
  }),
  new SourceFile({
    id: SourceFileId.make('file_2'),
    name: 'algorithm_complexity_slides.pptx',
    type: 'file',
    size: 5670000,
    createdAt: new Date('2024-01-16T09:30:00Z'),
  }),
  new SourceFile({
    id: SourceFileId.make('file_3'),
    name: 'neural_network_diagram.png',
    type: 'image',
    size: 890000,
    createdAt: new Date('2024-01-12T14:20:00Z'),
  }),
  new SourceFile({
    id: SourceFileId.make('file_4'),
    name: 'linear_algebra_textbook.pdf',
    type: 'file',
    size: 15670000,
    createdAt: new Date('2024-01-08T16:45:00Z'),
  }),
  new SourceFile({
    id: SourceFileId.make('file_5'),
    name: 'machine_learning_lecture.mp4',
    type: 'video',
    size: 125000000,
    createdAt: new Date('2024-01-14T10:15:00Z'),
  }),
]

// Mock Flashcards
export const mockFlashcards: Array<FlashcardDto> = [
  {
    flashcards: [
      {
        question: 'What is the time complexity of binary search?',
        answer:
          'O(log n) - Binary search divides the search space in half with each comparison, leading to logarithmic time complexity.',
      },
      {
        question: 'What is the difference between a stack and a queue?',
        answer:
          'Stack follows LIFO (Last In, First Out) principle with push/pop operations, while Queue follows FIFO (First In, First Out) with enqueue/dequeue operations.',
      },
      {
        question: 'What is a hash collision and how can it be resolved?',
        answer:
          'A hash collision occurs when two different keys hash to the same index. It can be resolved using chaining (linked lists) or open addressing (linear/quadratic probing).',
      },
      {
        question: 'What is the worst-case time complexity of QuickSort?',
        answer:
          'O(n²) - This occurs when the pivot is always the smallest or largest element, leading to unbalanced partitions.',
      },
      {
        question: 'What is a balanced binary tree?',
        answer:
          'A balanced binary tree is one where the height difference between left and right subtrees of any node is at most 1, ensuring O(log n) operations.',
      },
    ],
    totalCount: 5,
    topic: 'Data Structures and Algorithms',
  },
  {
    flashcards: [
      {
        question: 'What is gradient descent?',
        answer:
          'An optimization algorithm that iteratively adjusts parameters in the direction of steepest descent of the loss function to minimize error.',
      },
      {
        question: 'What is overfitting in machine learning?',
        answer:
          'When a model learns the training data too well, including noise and outliers, resulting in poor performance on new, unseen data.',
      },
      {
        question:
          'What is the difference between supervised and unsupervised learning?',
        answer:
          'Supervised learning uses labeled data to learn mappings from inputs to outputs, while unsupervised learning finds patterns in unlabeled data.',
      },
      {
        question: 'What is cross-validation?',
        answer:
          'A technique to assess model performance by splitting data into multiple folds, training on some folds and testing on others.',
      },
    ],
    totalCount: 4,
    topic: 'Machine Learning Fundamentals',
  },
]

// Mock Exams
export const mockExams: Array<ExamDto> = [
  {
    testQuestions: [
      {
        question:
          'Which data structure is best for implementing a function call stack?',
        answerA: 'Queue',
        answerB: 'Stack',
        answerC: 'Hash Table',
        answerD: 'Binary Tree',
        correct_answer: 'B',
      },
      {
        question: 'What is the space complexity of merge sort?',
        answerA: 'O(1)',
        answerB: 'O(log n)',
        answerC: 'O(n)',
        answerD: 'O(n log n)',
        correct_answer: 'C',
      },
      {
        question:
          'Which algorithm is used to find the shortest path in a weighted graph?',
        answerA: 'Breadth-First Search',
        answerB: 'Depth-First Search',
        answerC: "Dijkstra's Algorithm",
        answerD: 'Linear Search',
        correct_answer: 'C',
      },
      {
        question:
          'What is the average time complexity of hash table insertion?',
        answerA: 'O(1)',
        answerB: 'O(log n)',
        answerC: 'O(n)',
        answerD: 'O(n²)',
        correct_answer: 'A',
      },
      {
        question:
          'Which sorting algorithm has the best worst-case time complexity?',
        answerA: 'Quick Sort',
        answerB: 'Bubble Sort',
        answerC: 'Merge Sort',
        answerD: 'Selection Sort',
        correct_answer: 'C',
      },
    ],
    totalCount: 5,
    topic: 'Computer Science Fundamentals',
  },
  {
    testQuestions: [
      {
        question:
          'What is the purpose of the activation function in neural networks?',
        answerA: 'To normalize inputs',
        answerB: 'To introduce non-linearity',
        answerC: 'To reduce overfitting',
        answerD: 'To initialize weights',
        correct_answer: 'B',
      },
      {
        question:
          'Which optimization algorithm adapts learning rates for each parameter?',
        answerA: 'SGD',
        answerB: 'Momentum',
        answerC: 'Adam',
        answerD: 'Linear regression',
        correct_answer: 'C',
      },
      {
        question: 'What does the bias-variance tradeoff describe?',
        answerA: 'The relationship between model complexity and performance',
        answerB: 'The balance between training and testing data',
        answerC: 'The choice between different algorithms',
        answerD: 'The optimization of hyperparameters',
        correct_answer: 'A',
      },
    ],
    totalCount: 3,
    topic: 'Machine Learning',
  },
]

// Helper functions to get mock data by workspace
export const getMockDataByWorkspace = (workspaceId: WorkspaceId) => {
  const workspaceMap: Record<string, any> = {
    ws_1: {
      chats: [mockChats[0], mockChats[1]], // Computer Science Studies
      files: [mockSourceFiles[0], mockSourceFiles[1]],
      flashcards: [mockFlashcards[0]],
      exams: [mockExams[0]],
    },
    ws_2: {
      chats: [mockChats[2]], // Machine Learning Course
      files: [mockSourceFiles[2], mockSourceFiles[4]],
      flashcards: [mockFlashcards[1]],
      exams: [mockExams[1]],
    },
    ws_3: {
      chats: [mockChats[3]], // Mathematics Review
      files: [mockSourceFiles[3]],
      flashcards: [],
      exams: [],
    },
  }

  return (
    workspaceMap[workspaceId] || {
      chats: [],
      files: [],
      flashcards: [],
      exams: [],
    }
  )
}

export const getMockMessagesByChatId = (chatId: ChatId): Array<Message> => {
  return mockMessages[chatId] || []
}

// Default workspace for easy access
export const defaultWorkspace = mockWorkspaces[0]
