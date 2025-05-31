import { Workspace, WorkspaceId } from '@/types/workspace'
import { Chat, ChatId } from '@/types/chat'
import {
  Attachment,
  AttachmentId,
  AttachmentStatus,
  AttachmentType,
} from '@/types/attachment'
import { Message, MessageId, MessageRole } from '@/types/message'

// Mock Workspaces
export const mockWorkspaces: Array<Workspace> = [
  new Workspace({
    id: WorkspaceId.make('ws_1'),
    name: 'Machine Learning Fundamentals',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-20T15:30:00Z'),
  }),
  new Workspace({
    id: WorkspaceId.make('ws_2'),
    name: 'Web Development Bootcamp',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-25T14:45:00Z'),
  }),
  new Workspace({
    id: WorkspaceId.make('ws_3'),
    name: 'Data Structures & Algorithms',
    createdAt: new Date('2024-01-05T11:30:00Z'),
    updatedAt: new Date('2024-01-18T16:20:00Z'),
  }),
]

// Mock Chats
export const mockChats: Array<Chat> = [
  // Machine Learning Workspace Chats
  new Chat({
    id: ChatId.make('chat_1'),
    name: 'Introduction to Neural Networks',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T12:45:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_2'),
    name: 'Linear Regression Deep Dive',
    createdAt: new Date('2024-01-16T14:00:00Z'),
    updatedAt: new Date('2024-01-16T16:30:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_3'),
    name: 'Overfitting and Regularization',
    createdAt: new Date('2024-01-18T09:15:00Z'),
    updatedAt: new Date('2024-01-18T11:20:00Z'),
  }),

  // Web Development Workspace Chats
  new Chat({
    id: ChatId.make('chat_4'),
    name: 'React Hooks Best Practices',
    createdAt: new Date('2024-01-12T13:00:00Z'),
    updatedAt: new Date('2024-01-12T15:30:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_5'),
    name: 'TypeScript Advanced Patterns',
    createdAt: new Date('2024-01-14T10:45:00Z'),
    updatedAt: new Date('2024-01-14T12:15:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_6'),
    name: 'API Design and GraphQL',
    createdAt: new Date('2024-01-20T16:00:00Z'),
    updatedAt: new Date('2024-01-20T18:30:00Z'),
  }),

  // Data Structures Workspace Chats
  new Chat({
    id: ChatId.make('chat_7'),
    name: 'Binary Tree Traversals',
    createdAt: new Date('2024-01-08T11:00:00Z'),
    updatedAt: new Date('2024-01-08T13:45:00Z'),
  }),
  new Chat({
    id: ChatId.make('chat_8'),
    name: 'Graph Algorithms Workshop',
    createdAt: new Date('2024-01-12T15:30:00Z'),
    updatedAt: new Date('2024-01-12T17:00:00Z'),
  }),
]

// Mock Attachments
export const mockAttachments: Array<Attachment> = [
  // Machine Learning Workspace Attachments
  new Attachment({
    id: AttachmentId.make('att_1'),
    name: 'neural_networks_slides.pdf',
    previewUrl: new URL(
      'https://example.com/previews/neural_networks_slides.pdf',
    ),
    type: AttachmentType.PDF,
    status: AttachmentStatus.READY,
    createdAt: new Date('2024-01-15T10:00:00Z'),
  }),
  new Attachment({
    id: AttachmentId.make('att_2'),
    name: 'activation_functions_diagram.png',
    previewUrl: new URL(
      'https://example.com/previews/activation_functions_diagram.png',
    ),
    type: AttachmentType.IMAGE,
    status: AttachmentStatus.READY,
    createdAt: new Date('2024-01-15T11:30:00Z'),
  }),
  new Attachment({
    id: AttachmentId.make('att_3'),
    name: 'gradient_descent_notes.txt',
    type: AttachmentType.TEXT,
    status: AttachmentStatus.PROCESSING,
    createdAt: new Date('2024-01-16T09:15:00Z'),
  }),

  // Web Development Workspace Attachments
  new Attachment({
    id: AttachmentId.make('att_4'),
    name: 'react_component_lifecycle.pdf',
    previewUrl: new URL(
      'https://example.com/previews/react_component_lifecycle.pdf',
    ),
    type: AttachmentType.PDF,
    status: AttachmentStatus.READY,
    createdAt: new Date('2024-01-12T08:00:00Z'),
  }),
  new Attachment({
    id: AttachmentId.make('att_5'),
    name: 'typescript_cheatsheet.png',
    previewUrl: new URL(
      'https://example.com/previews/typescript_cheatsheet.png',
    ),
    type: AttachmentType.IMAGE,
    status: AttachmentStatus.READY,
    createdAt: new Date('2024-01-14T12:30:00Z'),
  }),

  // Data Structures Workspace Attachments
  new Attachment({
    id: AttachmentId.make('att_6'),
    name: 'big_o_complexity_guide.pdf',
    previewUrl: new URL(
      'https://example.com/previews/big_o_complexity_guide.pdf',
    ),
    type: AttachmentType.PDF,
    status: AttachmentStatus.READY,
    createdAt: new Date('2024-01-05T14:00:00Z'),
  }),
  new Attachment({
    id: AttachmentId.make('att_7'),
    name: 'tree_visualization.png',
    type: AttachmentType.IMAGE,
    status: AttachmentStatus.UPLOADED,
    createdAt: new Date('2024-01-08T16:45:00Z'),
  }),
]

// Mock Messages
export const mockMessages: Array<Message> = [
  // Neural Networks Chat Messages
  new Message({
    id: MessageId.make('msg_1'),
    content:
      '# Introduction to Neural Networks\n\nCan you explain the basic structure of a neural network and how backpropagation works?',
    role: MessageRole.USER,
    createdAt: new Date('2024-01-15T10:30:00Z'),
  }),
  new Message({
    id: MessageId.make('msg_2'),
    content: `# Neural Network Fundamentals

A **neural network** consists of interconnected nodes (neurons) organized in layers:

## Basic Structure
- **Input Layer**: Receives raw data
- **Hidden Layers**: Process information through weighted connections
- **Output Layer**: Produces final predictions

## Backpropagation Algorithm
1. **Forward Pass**: Data flows from input to output
2. **Loss Calculation**: Compare predictions with actual values
3. **Backward Pass**: Calculate gradients using chain rule
4. **Weight Updates**: Adjust weights to minimize loss

### Mathematical Foundation
The gradient for weight \`w_{ij}\` is calculated as:

\`\`\`
∂L/∂w_{ij} = ∂L/∂a_j × ∂a_j/∂z_j × ∂z_j/∂w_{ij}
\`\`\`

Where:
- \`L\` is the loss function
- \`a_j\` is the activation of neuron j
- \`z_j\` is the pre-activation value

This enables efficient learning through gradient descent optimization.`,
    role: MessageRole.ASSISTANT,
    createdAt: new Date('2024-01-15T10:35:00Z'),
  }),
  new Message({
    id: MessageId.make('msg_3'),
    content:
      'Great explanation! Can you provide a code example of implementing a simple neural network in Python?',
    role: MessageRole.USER,
    createdAt: new Date('2024-01-15T10:40:00Z'),
  }),
  new Message({
    id: MessageId.make('msg_4'),
    content: `# Simple Neural Network Implementation

Here's a basic implementation using NumPy:

\`\`\`python
import numpy as np

class SimpleNeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        # Initialize weights with small random values
        self.W1 = np.random.randn(input_size, hidden_size) * 0.1
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * 0.1
        self.b2 = np.zeros((1, output_size))
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def sigmoid_derivative(self, x):
        return x * (1 - x)
    
    def forward(self, X):
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.output = self.sigmoid(self.z2)
        return self.output
    
    def backward(self, X, y, learning_rate=0.1):
        m = X.shape[0]
        
        # Output layer gradients
        dz2 = self.output - y
        dW2 = (1/m) * np.dot(self.a1.T, dz2)
        db2 = (1/m) * np.sum(dz2, axis=0, keepdims=True)
        
        # Hidden layer gradients
        dz1 = np.dot(dz2, self.W2.T) * self.sigmoid_derivative(self.a1)
        dW1 = (1/m) * np.dot(X.T, dz1)
        db1 = (1/m) * np.sum(dz1, axis=0, keepdims=True)
        
        # Update weights
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2
        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1
\`\`\`

## Key Points:
- **Weight Initialization**: Small random values prevent symmetry
- **Activation Function**: Sigmoid adds non-linearity
- **Gradient Clipping**: Prevents numerical overflow
- **Learning Rate**: Controls step size in optimization`,
    role: MessageRole.ASSISTANT,
    createdAt: new Date('2024-01-15T10:45:00Z'),
  }),

  // React Hooks Chat Messages
  new Message({
    id: MessageId.make('msg_5'),
    content:
      '# React Hooks Best Practices\n\nWhat are the most important rules and patterns when using React hooks?',
    role: MessageRole.USER,
    createdAt: new Date('2024-01-12T13:00:00Z'),
  }),
  new Message({
    id: MessageId.make('msg_6'),
    content: `# React Hooks Best Practices

## Core Rules of Hooks
1. **Only call hooks at the top level** - Never inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Components or custom hooks

## Essential Patterns

### 1. Custom Hooks for Logic Reuse
\`\`\`typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
\`\`\`

### 2. Optimizing with useMemo and useCallback
\`\`\`typescript
function ExpensiveComponent({ items, filter }: Props) {
  // Memoize expensive calculations
  const filteredItems = useMemo(() => 
    items.filter(item => item.category === filter),
    [items, filter]
  )
  
  // Memoize event handlers to prevent child re-renders
  const handleItemClick = useCallback((id: string) => {
    // Handle click logic
  }, [])
  
  return (
    <div>
      {filteredItems.map(item => 
        <ItemComponent 
          key={item.id} 
          item={item} 
          onClick={handleItemClick} 
        />
      )}
    </div>
  )
}
\`\`\`

### 3. Effect Cleanup Patterns
\`\`\`typescript
function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    
    ws.onmessage = (event) => {
      setLastMessage(event.data)
    }
    
    setSocket(ws)
    
    // Cleanup function
    return () => {
      ws.close()
    }
  }, [url])

  return { socket, lastMessage }
}
\`\`\`

## Common Pitfalls to Avoid
- ❌ Infinite loops in useEffect without proper dependencies
- ❌ Stale closures when accessing state in async functions  
- ❌ Over-optimization with useMemo/useCallback
- ❌ Missing cleanup in effects with subscriptions`,
    role: MessageRole.ASSISTANT,
    createdAt: new Date('2024-01-12T13:05:00Z'),
  }),

  // Binary Tree Chat Messages
  new Message({
    id: MessageId.make('msg_7'),
    content:
      '# Binary Tree Traversals\n\nCan you explain the different ways to traverse a binary tree and when to use each one?',
    role: MessageRole.USER,
    createdAt: new Date('2024-01-08T11:00:00Z'),
  }),
  new Message({
    id: MessageId.make('msg_8'),
    content: `# Binary Tree Traversal Methods

## Overview
Tree traversal is the process of visiting each node exactly once in a systematic way.

## Main Traversal Types

### 1. Depth-First Search (DFS)

#### In-Order Traversal (Left → Root → Right)
\`\`\`python
def inorder_traversal(root):
    if not root:
        return []
    
    result = []
    result.extend(inorder_traversal(root.left))
    result.append(root.val)
    result.extend(inorder_traversal(root.right))
    return result
\`\`\`
**Use Case**: Binary Search Trees - gives sorted sequence

#### Pre-Order Traversal (Root → Left → Right)  
\`\`\`python
def preorder_traversal(root):
    if not root:
        return []
    
    result = [root.val]
    result.extend(preorder_traversal(root.left))
    result.extend(preorder_traversal(root.right))
    return result
\`\`\`
**Use Case**: Tree serialization, creating tree copies

#### Post-Order Traversal (Left → Right → Root)
\`\`\`python
def postorder_traversal(root):
    if not root:
        return []
    
    result = []
    result.extend(postorder_traversal(root.left))
    result.extend(postorder_traversal(root.right))
    result.append(root.val)
    return result
\`\`\`
**Use Case**: Deleting trees, calculating directory sizes

### 2. Breadth-First Search (Level-Order)
\`\`\`python
from collections import deque

def level_order_traversal(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)
        level_nodes = []
        
        for _ in range(level_size):
            node = queue.popleft()
            level_nodes.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level_nodes)
    
    return result
\`\`\`
**Use Case**: Level-by-level processing, shortest path in trees

## Time & Space Complexity
- **Time**: O(n) for all methods
- **Space**: 
  - DFS: O(h) where h is tree height
  - BFS: O(w) where w is maximum width`,
    role: MessageRole.ASSISTANT,
    createdAt: new Date('2024-01-08T11:10:00Z'),
  }),
]

// Utility functions to get related data
export const getChatsByWorkspaceId = (workspaceId: string): Array<Chat> => {
  const workspaceChatMap: Record<string, Array<string>> = {
    ws_1: ['chat_1', 'chat_2', 'chat_3'], // Machine Learning
    ws_2: ['chat_4', 'chat_5', 'chat_6'], // Web Development
    ws_3: ['chat_7', 'chat_8'], // Data Structures
  }

  const chatIds = workspaceChatMap[workspaceId] ?? []
  return mockChats.filter((chat) => chatIds.includes(chat.id))
}

export const getAttachmentsByWorkspaceId = (
  workspaceId: string,
): Array<Attachment> => {
  const workspaceAttachmentMap: Record<string, Array<string>> = {
    ws_1: ['att_1', 'att_2', 'att_3'], // Machine Learning
    ws_2: ['att_4', 'att_5'], // Web Development
    ws_3: ['att_6', 'att_7'], // Data Structures
  }

  const attachmentIds = workspaceAttachmentMap[workspaceId] ?? []
  return mockAttachments.filter((attachment) =>
    attachmentIds.includes(attachment.id),
  )
}

export const getMessagesByChatId = (chatId: string): Array<Message> => {
  const chatMessageMap: Record<string, Array<string>> = {
    chat_1: ['msg_1', 'msg_2', 'msg_3', 'msg_4'], // Neural Networks
    chat_4: ['msg_5', 'msg_6'], // React Hooks
    chat_7: ['msg_7', 'msg_8'], // Binary Trees
  }

  const messageIds = chatMessageMap[chatId] ?? []
  return mockMessages.filter((message) => messageIds.includes(message.id))
}
