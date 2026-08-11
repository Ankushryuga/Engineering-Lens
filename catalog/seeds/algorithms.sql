-- ── Algorithm template catalog — seed data ───────────────────────────────────
-- ~55 canonical, team-authored algorithms across the 11 standard DSA
-- categories. Every entry ships with a Python reference solution below and
-- a Go reference solution in the generated v13 section at the end of this file.
-- Python and Go are the only supported product languages.

-- ═══════════════════════════════════════════════════════════════════════════
-- SORTING
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Bubble Sort', 'Sorting', 'Fundamental', 'O(n²)', 'O(1)'),
('Insertion Sort', 'Sorting', 'Fundamental', 'O(n²)', 'O(1)'),
('Selection Sort', 'Sorting', 'Fundamental', 'O(n²)', 'O(1)'),
('Merge Sort', 'Sorting', 'Intermediate', 'O(n log n)', 'O(n)'),
('Quick Sort', 'Sorting', 'Intermediate', 'O(n log n) avg', 'O(log n)'),
('Heap Sort', 'Sorting', 'Intermediate', 'O(n log n)', 'O(1)'),
('Counting Sort', 'Sorting', 'Intermediate', 'O(n + k)', 'O(k)'),
('Radix Sort', 'Sorting', 'Advanced', 'O(d(n + k))', 'O(n + k)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Bubble Sort'), 'python', $code$def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

result = bubble_sort([64, 34, 25, 12, 22, 11, 90])
$code$),
((SELECT id FROM templates WHERE name = 'Insertion Sort'), 'python', $code$def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

result = insertion_sort([64, 34, 25, 12, 22, 11, 90])
$code$),
((SELECT id FROM templates WHERE name = 'Selection Sort'), 'python', $code$def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

result = selection_sort([64, 34, 25, 12, 22, 11, 90])
$code$),
((SELECT id FROM templates WHERE name = 'Merge Sort'), 'python', $code$def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

result = merge_sort([64, 34, 25, 12, 22, 11, 90])
$code$),
((SELECT id FROM templates WHERE name = 'Quick Sort'), 'python', $code$def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pivot_idx = partition(arr, low, high)
        quick_sort(arr, low, pivot_idx - 1)
        quick_sort(arr, pivot_idx + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

result = quick_sort([64, 34, 25, 12, 22, 11, 90])
$code$),
((SELECT id FROM templates WHERE name = 'Heap Sort'), 'python', $code$def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr

result = heap_sort([64, 34, 25, 12, 22, 11, 90])
$code$),
((SELECT id FROM templates WHERE name = 'Counting Sort'), 'python', $code$def counting_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for x in arr:
        count[x] += 1
    result = []
    for value, freq in enumerate(count):
        result.extend([value] * freq)
    return result

result = counting_sort([4, 2, 2, 8, 3, 3, 1])
$code$),
((SELECT id FROM templates WHERE name = 'Radix Sort'), 'python', $code$def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for num in arr:
        count[(num // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        digit = (arr[i] // exp) % 10
        output[count[digit] - 1] = arr[i]
        count[digit] -= 1
    return output

def radix_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        arr = counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr

result = radix_sort([170, 45, 75, 90, 802, 24, 2, 66])
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEARCHING
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Linear Search', 'Searching', 'Fundamental', 'O(n)', 'O(1)'),
('Binary Search', 'Searching', 'Fundamental', 'O(log n)', 'O(1)'),
('Ternary Search', 'Searching', 'Intermediate', 'O(log₃ n)', 'O(1)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Linear Search'), 'python', $code$def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

result = linear_search([5, 3, 8, 1, 9, 2], 9)
$code$),
((SELECT id FROM templates WHERE name = 'Binary Search'), 'python', $code$def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

result = binary_search([1, 3, 5, 7, 9, 11, 13], 11)
$code$),
((SELECT id FROM templates WHERE name = 'Ternary Search'), 'python', $code$def ternary_search(arr, target, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high:
        return -1
    third = (high - low) // 3
    mid1 = low + third
    mid2 = high - third
    if arr[mid1] == target:
        return mid1
    if arr[mid2] == target:
        return mid2
    if target < arr[mid1]:
        return ternary_search(arr, target, low, mid1 - 1)
    elif target > arr[mid2]:
        return ternary_search(arr, target, mid2 + 1, high)
    else:
        return ternary_search(arr, target, mid1 + 1, mid2 - 1)

result = ternary_search([1, 3, 5, 7, 9, 11, 13], 7)
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- LINKED LISTS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Reverse a Linked List', 'Linked Lists', 'Fundamental', 'O(n)', 'O(1)'),
('Cycle Detection (Floyd''s)', 'Linked Lists', 'Intermediate', 'O(n)', 'O(1)'),
('Merge Two Sorted Lists', 'Linked Lists', 'Intermediate', 'O(n + m)', 'O(1)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Reverse a Linked List'), 'python', $code$class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def reverse_playlist(head, node_names, next_map):
    # ── Set up the visualization: the playlist as a chain of tracks ──────────
    record_step({
        "type": "list_init",
        "nodes": node_names,
        "next": next_map,
        "info": "rewinding the playlist back to the first track",
    })

    prev = None
    curr = head
    while curr:
        record_step({
            "type": "visit",
            "node": curr.val,
            "pointers": {"current": curr.val},
            "info": f"at track \"{curr.val}\"",
        })
        next_node = curr.next
        curr.next = prev
        record_step({
            "type": "relax",
            "edge": [curr.val, prev.val if prev else None],
            "info": f"\"{curr.val}\" now plays before \"{prev.val if prev else 'the end'}\"",
        })
        prev = curr
        curr = next_node

    order = []
    node = prev
    while node:
        order.append(node.val)
        node = node.next

    record_step({
        "type": "path",
        "path": order,
        "info": f"playlist rewound — new play order: {' -> '.join(order)}",
    })
    record_step({"type": "done", "info": "rewind complete"})
    return prev

# Real-world example: rewinding a music playlist to play from the start.
names = ["Intro", "Verse 1", "Chorus", "Verse 2", "Outro"]
nodes = [Node(n) for n in names]
for i in range(len(nodes) - 1):
    nodes[i].next = nodes[i + 1]
next_map = {names[i]: (names[i + 1] if i + 1 < len(names) else None) for i in range(len(names))}

result = reverse_playlist(nodes[0], names, next_map)
$code$),
((SELECT id FROM templates WHERE name = 'Cycle Detection (Floyd''s)'), 'python', $code$class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def detect_deadlock(head, node_names, next_map):
    # ── Set up the visualization: a chain of processes waiting on each other ─
    record_step({
        "type": "list_init",
        "nodes": node_names,
        "next": next_map,
        "info": "checking a process wait-chain for a deadlock cycle",
    })

    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        record_step({
            "type": "visit",
            "node": slow.val,
            "pointers": {"slow": slow.val, "fast": fast.val if fast else None},
            "info": f"slow pointer at \"{slow.val}\", fast pointer at \"{fast.val if fast else 'end'}\"",
        })
        if slow == fast:
            record_step({
                "type": "path",
                "path": [slow.val],
                "info": f"deadlock found — process \"{slow.val}\" is waiting on itself in a cycle",
            })
            record_step({"type": "done", "info": "deadlock cycle confirmed"})
            return True

    record_step({"type": "done", "info": "no cycle — every process eventually completes"})
    return False

# Real-world example: a process wait-for chain where the last process ends
# up waiting on an earlier one again, forming a deadlock.
names = ["ProcessA", "ProcessB", "ProcessC", "ProcessD"]
nodes = [Node(n) for n in names]
for i in range(len(nodes) - 1):
    nodes[i].next = nodes[i + 1]
nodes[-1].next = nodes[1]  # ProcessD loops back to ProcessB
next_map = {names[i]: (names[i + 1] if i + 1 < len(names) else names[1]) for i in range(len(names))}

result = detect_deadlock(nodes[0], names, next_map)
$code$),
((SELECT id FROM templates WHERE name = 'Merge Two Sorted Lists'), 'python', $code$class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def merge_playlists(l1, l2, names1, names2, next1, next2):
    # ── Set up the visualization: two sorted playlists to merge ─────────────
    record_step({
        "type": "list_init",
        "lists": {"Morning Mix": names1, "Chill Vibes": names2},
        "next": {**next1, **next2},
        "info": "merging two sorted playlists into one, by track number",
    })

    merged = []
    while l1 and l2:
        if l1.val <= l2.val:
            merged.append(l1.val)
            record_step({
                "type": "visit", "node": l1.val, "merged": list(merged),
                "info": f"track \"{l1.val}\" from Morning Mix plays next",
            })
            l1 = l1.next
        else:
            merged.append(l2.val)
            record_step({
                "type": "visit", "node": l2.val, "merged": list(merged),
                "info": f"track \"{l2.val}\" from Chill Vibes plays next",
            })
            l2 = l2.next
    while l1:
        merged.append(l1.val)
        record_step({"type": "visit", "node": l1.val, "merged": list(merged),
                      "info": f"appending remaining track \"{l1.val}\""})
        l1 = l1.next
    while l2:
        merged.append(l2.val)
        record_step({"type": "visit", "node": l2.val, "merged": list(merged),
                      "info": f"appending remaining track \"{l2.val}\""})
        l2 = l2.next

    record_step({
        "type": "path",
        "path": merged,
        "info": f"final merged playlist: {' -> '.join(merged)}",
    })
    record_step({"type": "done", "info": "merge complete"})
    return merged

# Real-world example: merging two sorted playlists (by track number) into
# a single combined playlist, keeping everything in sorted order.
names1 = ["Track 1", "Track 3", "Track 5"]
names2 = ["Track 2", "Track 4", "Track 6"]
nodes1 = [Node(n) for n in names1]
nodes2 = [Node(n) for n in names2]
for i in range(len(nodes1) - 1):
    nodes1[i].next = nodes1[i + 1]
for i in range(len(nodes2) - 1):
    nodes2[i].next = nodes2[i + 1]
next1 = {names1[i]: (names1[i + 1] if i + 1 < len(names1) else None) for i in range(len(names1))}
next2 = {names2[i]: (names2[i + 1] if i + 1 < len(names2) else None) for i in range(len(names2))}

result = merge_playlists(nodes1[0], nodes2[0], names1, names2, next1, next2)
$code$);

UPDATE templates SET render_type = 'linked_list'
WHERE name IN ('Reverse a Linked List', 'Cycle Detection (Floyd''s)', 'Merge Two Sorted Lists');

-- ═══════════════════════════════════════════════════════════════════════════
-- TREES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Inorder / Preorder / Postorder Traversal', 'Trees', 'Fundamental', 'O(n)', 'O(h)'),
('Level-Order (BFS) Traversal', 'Trees', 'Fundamental', 'O(n)', 'O(n)'),
('BST Insert / Delete / Search', 'Trees', 'Intermediate', 'O(h)', 'O(h)'),
('AVL Tree Rotations', 'Trees', 'Advanced', 'O(log n)', 'O(log n)'),
('Trie Insert / Search', 'Trees', 'Intermediate', 'O(k)', 'O(k · n)'),
('Lowest Common Ancestor', 'Trees', 'Intermediate', 'O(n)', 'O(h)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Inorder / Preorder / Postorder Traversal'), 'python', $code$def scan_directory(tree, node_id, order):
    if node_id is None:
        return
    left, right = tree.get(node_id, (None, None))
    # Preorder scan: list this file/folder, then descend left, then right —
    # similar to how `tree` or `find` walks a directory top-down.
    order.append(node_id)
    record_step({"type": "visit", "node": node_id, "info": f"scanning \"{node_id}\""})
    scan_directory(tree, left, order)
    scan_directory(tree, right, order)

def scan_filesystem(tree, root):
    nodes = list(tree.keys())
    edges = []
    for parent, (left, right) in tree.items():
        if left:
            edges.append([parent, left])
        if right:
            edges.append([parent, right])
    record_step({
        "type": "tree_init", "nodes": nodes, "edges": edges, "source": root,
        "info": f"scanning project folder starting at \"{root}\"",
    })

    order = []
    scan_directory(tree, root, order)

    record_step({
        "type": "path", "path": order,
        "info": f"scan order: {' -> '.join(order)}",
    })
    record_step({"type": "done", "info": "directory scan complete"})
    return order

# Real-world example: scanning a small project's folder structure, listing
# each file/folder the moment it's reached (preorder — parent before children).
tree = {
    "project/":       ("src/", "docs/"),
    "src/":           ("components/", "utils/"),
    "docs/":          (None, "README.md"),
    "components/":    (None, None),
    "utils/":         (None, None),
    "README.md":      (None, None),
}
result = scan_filesystem(tree, "project/")
$code$),
((SELECT id FROM templates WHERE name = 'Level-Order (BFS) Traversal'), 'python', $code$from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, TreeNode(5), TreeNode(7)))
result = level_order(root)
$code$),
((SELECT id FROM templates WHERE name = 'BST Insert / Delete / Search'), 'python', $code$class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def search(root, val):
    if root is None or root.val == val:
        return root
    if val < root.val:
        return search(root.left, val)
    return search(root.right, val)

root = None
for v in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
    root = insert(root, v)
result = search(root, 6) is not None
$code$),
((SELECT id FROM templates WHERE name = 'AVL Tree Rotations'), 'python', $code$class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.height = 1

def height(n):
    return n.height if n else 0

def balance_factor(n):
    return height(n.left) - height(n.right) if n else 0

def right_rotate(y):
    x = y.left
    t2 = x.right
    x.right = y
    y.left = t2
    y.height = 1 + max(height(y.left), height(y.right))
    x.height = 1 + max(height(x.left), height(x.right))
    return x

def left_rotate(x):
    y = x.right
    t2 = y.left
    y.left = x
    x.right = t2
    x.height = 1 + max(height(x.left), height(x.right))
    y.height = 1 + max(height(y.left), height(y.right))
    return y

def insert(node, val):
    if not node:
        return Node(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)

    node.height = 1 + max(height(node.left), height(node.right))
    balance = balance_factor(node)

    if balance > 1 and val < node.left.val:
        return right_rotate(node)
    if balance < -1 and val > node.right.val:
        return left_rotate(node)
    if balance > 1 and val > node.left.val:
        node.left = left_rotate(node.left)
        return right_rotate(node)
    if balance < -1 and val < node.right.val:
        node.right = right_rotate(node.right)
        return left_rotate(node)
    return node

root = None
for v in [10, 20, 30, 40, 50, 25]:
    root = insert(root, v)
result = root.val
$code$),
((SELECT id FROM templates WHERE name = 'Trie Insert / Search'), 'python', $code$class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

trie = Trie()
for w in ["cat", "car", "card", "care"]:
    trie.insert(w)
result = trie.search("car")
$code$),
((SELECT id FROM templates WHERE name = 'Lowest Common Ancestor'), 'python', $code$def find_path(tree, node_id, target, path):
    if node_id is None:
        return False
    path.append(node_id)
    record_step({"type": "visit", "node": node_id, "info": f"checking \"{node_id}\""})
    if node_id == target:
        return True
    left, right = tree.get(node_id, (None, None))
    if find_path(tree, left, target, path) or find_path(tree, right, target, path):
        return True
    path.pop()
    return False

def lowest_common_manager(tree, root, employee_a, employee_b):
    nodes = list(tree.keys())
    edges = []
    for parent, (left, right) in tree.items():
        if left:
            edges.append([parent, left])
        if right:
            edges.append([parent, right])
    record_step({
        "type": "tree_init", "nodes": nodes, "edges": edges, "source": root,
        "info": f"org chart — finding the common manager of \"{employee_a}\" and \"{employee_b}\"",
    })

    path_a, path_b = [], []
    find_path(tree, root, employee_a, path_a)
    find_path(tree, root, employee_b, path_b)

    lca = None
    for i in range(min(len(path_a), len(path_b))):
        if path_a[i] == path_b[i]:
            lca = path_a[i]
        else:
            break

    record_step({
        "type": "path", "path": path_a, "node": lca,
        "info": f"lowest common manager of \"{employee_a}\" and \"{employee_b}\" is \"{lca}\"",
    })
    record_step({"type": "done", "info": "search complete"})
    return lca

# Real-world example: a company org chart — who is the closest shared
# manager between two employees, useful for e.g. escalation routing.
tree = {
    "CEO":            ("VP Engineering", "VP Sales"),
    "VP Engineering": ("Eng Manager A", "Eng Manager B"),
    "VP Sales":       ("Sales Manager", None),
    "Eng Manager A":  ("Alice", "Bob"),
    "Eng Manager B":  ("Chen", None),
    "Alice":          (None, None),
    "Bob":            (None, None),
    "Chen":           (None, None),
    "Sales Manager":  (None, None),
}
result = lowest_common_manager(tree, "CEO", "Alice", "Bob")
$code$);

UPDATE templates SET render_type = 'tree'
WHERE name IN ('Inorder / Preorder / Postorder Traversal', 'Lowest Common Ancestor');

-- ═══════════════════════════════════════════════════════════════════════════
-- HEAPS & PRIORITY QUEUES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Heap Insert / Extract-Min', 'Heaps & Priority Queues', 'Intermediate', 'O(log n)', 'O(n)'),
('Build Heap (Heapify)', 'Heaps & Priority Queues', 'Intermediate', 'O(n)', 'O(1)'),
('K-th Largest Element', 'Heaps & Priority Queues', 'Intermediate', 'O(n log k)', 'O(k)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Heap Insert / Extract-Min'), 'python', $code$import heapq

def build_min_heap():
    heap = []
    for v in [5, 3, 8, 1, 9, 2]:
        heapq.heappush(heap, v)
    return heap

def extract_min(heap):
    return heapq.heappop(heap)

heap = build_min_heap()
result = extract_min(heap)
$code$),
((SELECT id FROM templates WHERE name = 'Build Heap (Heapify)'), 'python', $code$def heapify(arr, n, i):
    smallest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] < arr[smallest]:
        smallest = left
    if right < n and arr[right] < arr[smallest]:
        smallest = right
    if smallest != i:
        arr[i], arr[smallest] = arr[smallest], arr[i]
        heapify(arr, n, smallest)

def build_heap(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    return arr

result = build_heap([5, 3, 8, 1, 9, 2, 7])
$code$),
((SELECT id FROM templates WHERE name = 'K-th Largest Element'), 'python', $code$import heapq

def kth_largest(arr, k):
    heap = arr[:k]
    heapq.heapify(heap)
    for num in arr[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)
    return heap[0]

result = kth_largest([3, 2, 1, 5, 6, 4], 2)
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- GRAPHS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Breadth-First Search', 'Graphs', 'Fundamental', 'O(V + E)', 'O(V)'),
('Depth-First Search', 'Graphs', 'Fundamental', 'O(V + E)', 'O(V)'),
('Dijkstra''s Shortest Path', 'Graphs', 'Intermediate', 'O((V + E) log V)', 'O(V)'),
('Bellman-Ford', 'Graphs', 'Advanced', 'O(V · E)', 'O(V)'),
('Floyd-Warshall', 'Graphs', 'Advanced', 'O(V³)', 'O(V²)'),
('A* Search', 'Graphs', 'Advanced', 'O(E)', 'O(V)'),
('Topological Sort', 'Graphs', 'Intermediate', 'O(V + E)', 'O(V)'),
('Kruskal''s MST', 'Graphs', 'Advanced', 'O(E log E)', 'O(V)'),
('Prim''s MST', 'Graphs', 'Advanced', 'O(E log V)', 'O(V)'),
('Union-Find / Disjoint Set', 'Graphs', 'Intermediate', 'O(α(n))', 'O(n)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Breadth-First Search'), 'python', $code$from collections import deque

def bfs(graph, start, target=None):
    nodes = list(graph.keys())
    edges = [[u, v, 1] for u in graph for v in graph[u] if u < v]  # undirected, dedup
    record_step({
        "type": "graph_init",
        "nodes": nodes,
        "edges": edges,
        "source": start,
        "info": f"BFS — finding {start}'s shortest connection path on the network",
    })

    visited = {start}
    queue = deque([start])
    order = []
    prev = {}

    while queue:
        node = queue.popleft()
        order.append(node)
        record_step({
            "type": "visit",
            "node": node,
            "distances": {n: ("reached" if n in visited else "-") for n in nodes},
            "info": f"visiting {node} — {len(order)} of {len(nodes)} people reached",
        })
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                prev[neighbor] = node
                queue.append(neighbor)
                record_step({
                    "type": "relax",
                    "edge": [node, neighbor],
                    "info": f"{node} connects to {neighbor}",
                })

    if target and target in prev or target == start:
        path = []
        node = target
        while node in prev or node == start:
            path.append(node)
            if node == start:
                break
            node = prev[node]
        path.reverse()
        record_step({
            "type": "path",
            "path": path,
            "info": f"shortest connection path {start} -> {target}: {len(path) - 1} degree(s) of separation",
        })

    record_step({"type": "done", "info": f"BFS complete — visited {len(order)} people in order: {', '.join(order)}"})
    return order

# Real-world example: a small professional-network friend graph.
# "How many degrees of separation between Alice and Farid?"
graph = {
    'Alice':  ['Bob', 'Chen'],
    'Bob':    ['Alice', 'Diego'],
    'Chen':   ['Alice', 'Diego', 'Elena'],
    'Diego':  ['Bob', 'Chen', 'Farid'],
    'Elena':  ['Chen', 'Farid'],
    'Farid':  ['Diego', 'Elena'],
}
result = bfs(graph, 'Alice', target='Farid')
$code$),
((SELECT id FROM templates WHERE name = 'Depth-First Search'), 'python', $code$def dfs(graph, start, visited=None, order=None, nodes=None):
    first_call = visited is None
    if first_call:
        visited = set()
        order = []
        nodes = list(graph.keys())
        edges = [[u, v, 1] for u in graph for v in graph[u] if u < v]
        record_step({
            "type": "graph_init",
            "nodes": nodes,
            "edges": edges,
            "source": start,
            "info": f"DFS — crawling the site starting from {start}",
        })

    visited.add(start)
    order.append(start)
    record_step({
        "type": "visit",
        "node": start,
        "distances": {n: ("crawled" if n in visited else "-") for n in nodes},
        "info": f"crawling page {start} ({len(order)} of {len(nodes)} pages found)",
    })

    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            record_step({
                "type": "relax",
                "edge": [start, neighbor],
                "info": f"following link {start} -> {neighbor}",
            })
            dfs(graph, neighbor, visited, order, nodes)

    if len(order) == len(nodes):
        record_step({
            "type": "path",
            "path": order,
            "info": f"DFS crawl order: {' -> '.join(order)}",
        })
        record_step({"type": "done", "info": f"DFS complete — crawled all {len(nodes)} pages"})
    return order

# Real-world example: crawling a small website's internal link structure,
# starting from the homepage.
graph = {
    'Home':       ['Products', 'About', 'Contact'],
    'Products':   ['Home', 'Pricing', 'Docs'],
    'About':      ['Home', 'Careers'],
    'Contact':    ['Home'],
    'Pricing':    ['Products'],
    'Docs':       ['Products', 'Careers'],
    'Careers':    ['About', 'Docs'],
}
result = dfs(graph, 'Home')
$code$),
((SELECT id FROM templates WHERE name = 'Dijkstra''s Shortest Path'), 'python', $code$import heapq

ROWS, COLS = 15, 26
START = (7, 2)
GOAL = (7, 23)

# A deterministic weighted city grid for the lesson.
# -1 = building (blocked), 1 = clear street, 2..5 = increasing traffic cost.
def build_city():
    grid = [[1 for _ in range(COLS)] for _ in range(ROWS)]

    buildings = {
        (1,5),(1,6),(1,7),(2,6),(2,7),
        (3,11),(3,12),(4,11),(4,12),(5,12),
        (8,5),(8,6),(9,5),(10,5),(10,6),
        (9,15),(9,16),(10,15),(10,16),(11,16),
        (3,19),(4,19),(4,20),(5,20),
        (11,21),(11,22),(12,21),(12,22),
    }
    for r, c in buildings:
        grid[r][c] = -1

    traffic_patches = [
        (range(5, 9), range(8, 11), 3),
        (range(1, 5), range(14, 17), 4),
        (range(8, 13), range(18, 20), 5),
        (range(10, 14), range(9, 12), 2),
    ]
    for rows, cols, weight in traffic_patches:
        for r in rows:
            for c in cols:
                if grid[r][c] != -1:
                    grid[r][c] = weight

    grid[START[0]][START[1]] = 1
    grid[GOAL[0]][GOAL[1]] = 1
    return grid


def neighbors(grid, r, c):
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] != -1:
            yield nr, nc


def dijkstra_grid(grid, start, goal):
    record_step({
        "type": "grid_init",
        "grid": grid,
        "start_cell": start,
        "goal_cell": goal,
        "info": "Delivery grid ready — clear streets cost 1, darker traffic costs more, buildings are blocked.",
    })

    dist = {start: 0}
    prev = {}
    pq = [(0, start)]
    settled = set()

    while pq:
        cost, cell = heapq.heappop(pq)
        if cell in settled:
            continue
        settled.add(cell)
        r, c = cell
        record_step({
            "type": "visit",
            "cell": cell,
            "info": f"Courier checks block ({r}, {c}); best known travel cost is {cost}.",
        })

        if cell == goal:
            break

        for nr, nc in neighbors(grid, r, c):
            neighbor = (nr, nc)
            new_cost = cost + grid[nr][nc]
            if new_cost < dist.get(neighbor, float('inf')):
                dist[neighbor] = new_cost
                prev[neighbor] = cell
                heapq.heappush(pq, (new_cost, neighbor))
                record_step({
                    "type": "relax",
                    "from_cell": cell,
                    "to_cell": neighbor,
                    "cell_cost": grid[nr][nc],
                    "info": f"A cheaper way reaches ({nr}, {nc}); route cost becomes {new_cost}.",
                })

    path = []
    current = goal
    if current == start or current in prev:
        while True:
            path.append(current)
            if current == start:
                break
            current = prev[current]
        path.reverse()

    for index, path_cell in enumerate(path):
        record_step({
            "type": "path",
            "cell": path_cell,
            "grid_path": path[:index + 1],
            "info": f"Courier follows the confirmed route through block {path_cell} ({index + 1}/{len(path)}).",
        })
    record_step({"type": "done", "cell": goal, "grid_path": path, "info": f"Dijkstra delivery route complete — weighted cost {dist.get(goal, 'unreachable')}."})
    return path, dist.get(goal)

city = build_city()
result = dijkstra_grid(city, START, GOAL)
$code$),
((SELECT id FROM templates WHERE name = 'Bellman-Ford'), 'python', $code$def bellman_ford(vertices, edges, start):
    dist = {v: float('inf') for v in vertices}
    dist[start] = 0
    for _ in range(len(vertices) - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            raise ValueError("graph contains a negative-weight cycle")
    return dist

vertices = ['A', 'B', 'C', 'D']
edges = [('A', 'B', 4), ('A', 'C', 1), ('C', 'B', 2), ('B', 'D', 1), ('C', 'D', 5)]
result = bellman_ford(vertices, edges, 'A')
$code$),
((SELECT id FROM templates WHERE name = 'Floyd-Warshall'), 'python', $code$def floyd_warshall(graph):
    n = len(graph)
    dist = [row[:] for row in graph]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist

INF = float('inf')
graph = [
    [0, 3, INF, 7],
    [8, 0, 2, INF],
    [5, INF, 0, 1],
    [2, INF, INF, 0],
]
result = floyd_warshall(graph)
$code$),
((SELECT id FROM templates WHERE name = 'A* Search'), 'python', $code$import heapq

ROWS, COLS = 15, 26
START = (7, 2)
GOAL = (7, 23)


def build_city():
    grid = [[1 for _ in range(COLS)] for _ in range(ROWS)]
    buildings = {
        (1,5),(1,6),(1,7),(2,6),(2,7),
        (3,11),(3,12),(4,11),(4,12),(5,12),
        (8,5),(8,6),(9,5),(10,5),(10,6),
        (9,15),(9,16),(10,15),(10,16),(11,16),
        (3,19),(4,19),(4,20),(5,20),
        (11,21),(11,22),(12,21),(12,22),
    }
    for r, c in buildings:
        grid[r][c] = -1

    traffic_patches = [
        (range(5, 9), range(8, 11), 3),
        (range(1, 5), range(14, 17), 4),
        (range(8, 13), range(18, 20), 5),
        (range(10, 14), range(9, 12), 2),
    ]
    for rows, cols, weight in traffic_patches:
        for r in rows:
            for c in cols:
                if grid[r][c] != -1:
                    grid[r][c] = weight
    return grid


def heuristic(cell, goal):
    return abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])


def neighbors(grid, r, c):
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] != -1:
            yield nr, nc


def a_star(grid, start, goal):
    record_step({
        "type": "grid_init",
        "grid": grid,
        "start_cell": start,
        "goal_cell": goal,
        "info": "A* delivery grid ready — the heuristic points the courier toward the customer while traffic still affects cost.",
    })

    g_score = {start: 0}
    came_from = {}
    open_set = [(heuristic(start, goal), 0, start)]
    closed = set()

    while open_set:
        _, current_cost, current = heapq.heappop(open_set)
        if current in closed:
            continue
        closed.add(current)
        r, c = current
        record_step({
            "type": "visit",
            "cell": current,
            "info": f"A* explores ({r}, {c}); cost so far {current_cost}, estimate to customer {heuristic(current, goal)}.",
        })

        if current == goal:
            break

        for nr, nc in neighbors(grid, r, c):
            neighbor = (nr, nc)
            tentative = current_cost + grid[nr][nc]
            if tentative < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative
                priority = tentative + heuristic(neighbor, goal)
                heapq.heappush(open_set, (priority, tentative, neighbor))
                record_step({
                    "type": "relax",
                    "from_cell": current,
                    "to_cell": neighbor,
                    "cell_cost": grid[nr][nc],
                    "info": f"A* adds ({nr}, {nc}) to the frontier with score {priority}.",
                })

    path = []
    current = goal
    if current == start or current in came_from:
        while True:
            path.append(current)
            if current == start:
                break
            current = came_from[current]
        path.reverse()

    for index, path_cell in enumerate(path):
        record_step({
            "type": "path",
            "cell": path_cell,
            "grid_path": path[:index + 1],
            "info": f"Courier follows A*'s confirmed route through block {path_cell} ({index + 1}/{len(path)}).",
        })
    record_step({"type": "done", "cell": goal, "grid_path": path, "info": f"A* delivery route complete — weighted cost {g_score.get(goal, 'unreachable')}."})
    return path

city = build_city()
result = a_star(city, START, GOAL)
$code$),
((SELECT id FROM templates WHERE name = 'Topological Sort'), 'python', $code$def topological_sort(graph):
    visited = set()
    stack = []

    def visit(node):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visit(neighbor)
        stack.append(node)

    for node in graph:
        if node not in visited:
            visit(node)
    return stack[::-1]

graph = {'A': ['C'], 'B': ['C', 'D'], 'C': ['E'], 'D': ['E'], 'E': []}
result = topological_sort(graph)
$code$),
((SELECT id FROM templates WHERE name = 'Kruskal''s MST'), 'python', $code$class DisjointSet:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx != ry:
            self.parent[rx] = ry
            return True
        return False

def kruskal(n, edges):
    ds = DisjointSet(n)
    mst = []
    for w, u, v in sorted(edges):
        if ds.union(u, v):
            mst.append((u, v, w))
    return mst

edges = [(4, 0, 1), (1, 0, 2), (2, 1, 2), (1, 1, 3), (5, 2, 3)]
result = kruskal(4, edges)
$code$),
((SELECT id FROM templates WHERE name = 'Prim''s MST'), 'python', $code$import heapq

def prim(graph, start):
    visited = {start}
    edges = [(w, start, v) for v, w in graph[start]]
    heapq.heapify(edges)
    mst = []

    while edges:
        w, u, v = heapq.heappop(edges)
        if v not in visited:
            visited.add(v)
            mst.append((u, v, w))
            for neighbor, weight in graph[v]:
                if neighbor not in visited:
                    heapq.heappush(edges, (weight, v, neighbor))
    return mst

graph = {
    'A': [('B', 2), ('C', 3)],
    'B': [('A', 2), ('C', 1), ('D', 4)],
    'C': [('A', 3), ('B', 1), ('D', 5)],
    'D': [('B', 4), ('C', 5)],
}
result = prim(graph, 'A')
$code$),
((SELECT id FROM templates WHERE name = 'Union-Find / Disjoint Set'), 'python', $code$class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True

uf = UnionFind(6)
uf.union(0, 1)
uf.union(1, 2)
uf.union(3, 4)
result = uf.find(0) == uf.find(2)
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- DYNAMIC PROGRAMMING
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('0/1 Knapsack', 'Dynamic Programming', 'Intermediate', 'O(n · W)', 'O(n · W)'),
('Longest Common Subsequence', 'Dynamic Programming', 'Intermediate', 'O(n · m)', 'O(n · m)'),
('Longest Increasing Subsequence', 'Dynamic Programming', 'Intermediate', 'O(n log n)', 'O(n)'),
('Edit Distance', 'Dynamic Programming', 'Intermediate', 'O(n · m)', 'O(n · m)'),
('Coin Change', 'Dynamic Programming', 'Intermediate', 'O(n · amount)', 'O(amount)'),
('Matrix Chain Multiplication', 'Dynamic Programming', 'Advanced', 'O(n³)', 'O(n²)'),
('Fibonacci (memoized)', 'Dynamic Programming', 'Fundamental', 'O(n)', 'O(n)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = '0/1 Knapsack'), 'python', $code$def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
            else:
                dp[i][w] = dp[i - 1][w]
    return dp[n][capacity]

result = knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)
$code$),
((SELECT id FROM templates WHERE name = 'Longest Common Subsequence'), 'python', $code$def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]

result = lcs("ABCBDAB", "BDCABA")
$code$),
((SELECT id FROM templates WHERE name = 'Longest Increasing Subsequence'), 'python', $code$def length_of_lis(nums):
    if not nums:
        return 0
    tails = []
    for num in nums:
        lo, hi = 0, len(tails)
        while lo < hi:
            mid = (lo + hi) // 2
            if tails[mid] < num:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(tails):
            tails.append(num)
        else:
            tails[lo] = num
    return len(tails)

result = length_of_lis([10, 9, 2, 5, 3, 7, 101, 18])
$code$),
((SELECT id FROM templates WHERE name = 'Edit Distance'), 'python', $code$def edit_distance(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[n][m]

result = edit_distance("horse", "ros")
$code$),
((SELECT id FROM templates WHERE name = 'Coin Change'), 'python', $code$def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

result = coin_change([1, 2, 5], 11)
$code$),
((SELECT id FROM templates WHERE name = 'Matrix Chain Multiplication'), 'python', $code$def matrix_chain_order(dims):
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
                if cost < dp[i][j]:
                    dp[i][j] = cost
    return dp[0][n - 1]

result = matrix_chain_order([40, 20, 30, 10, 30])
$code$),
((SELECT id FROM templates WHERE name = 'Fibonacci (memoized)'), 'python', $code$def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

result = fib(30)
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- BACKTRACKING
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('N-Queens', 'Backtracking', 'Advanced', 'O(n!)', 'O(n²)'),
('Sudoku Solver', 'Backtracking', 'Advanced', 'O(9^(n·n))', 'O(n²)'),
('Permutations / Subsets', 'Backtracking', 'Intermediate', 'O(n · n!)', 'O(n)'),
('Rat in a Maze', 'Backtracking', 'Intermediate', 'O(2^(n·n))', 'O(n²)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'N-Queens'), 'python', $code$def solve_n_queens(n):
    solutions = []
    cols = set()
    diag1 = set()
    diag2 = set()
    board = []

    def backtrack(row):
        if row == n:
            solutions.append(board[:])
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            board.append(col)
            backtrack(row + 1)
            board.pop()
            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)

    backtrack(0)
    return solutions

result = solve_n_queens(4)
$code$),
((SELECT id FROM templates WHERE name = 'Sudoku Solver'), 'python', $code$def solve_sudoku(board):
    def is_valid(r, c, val):
        for i in range(9):
            if board[r][i] == val or board[i][c] == val:
                return False
        br, bc = 3 * (r // 3), 3 * (c // 3)
        for i in range(br, br + 3):
            for j in range(bc, bc + 3):
                if board[i][j] == val:
                    return False
        return True

    def backtrack():
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    for val in range(1, 10):
                        if is_valid(r, c, val):
                            board[r][c] = val
                            if backtrack():
                                return True
                            board[r][c] = 0
                    return False
        return True

    backtrack()
    return board

board = [[0]*9 for _ in range(9)]
result = solve_sudoku(board)
$code$),
((SELECT id FROM templates WHERE name = 'Permutations / Subsets'), 'python', $code$def permute(nums):
    result = []

    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i in range(len(remaining)):
            path.append(remaining[i])
            backtrack(path, remaining[:i] + remaining[i + 1:])
            path.pop()

    backtrack([], nums)
    return result

result = permute([1, 2, 3])
$code$),
((SELECT id FROM templates WHERE name = 'Rat in a Maze'), 'python', $code$def solve_maze(maze):
    n = len(maze)
    path = [[0] * n for _ in range(n)]

    def backtrack(r, c):
        if r == n - 1 and c == n - 1 and maze[r][c] == 1:
            path[r][c] = 1
            return True
        if 0 <= r < n and 0 <= c < n and maze[r][c] == 1 and path[r][c] == 0:
            path[r][c] = 1
            if backtrack(r + 1, c) or backtrack(r, c + 1):
                return True
            path[r][c] = 0
            return False
        return False

    backtrack(0, 0)
    return path

maze = [[1, 0, 0, 0], [1, 1, 0, 1], [0, 1, 0, 0], [1, 1, 1, 1]]
result = solve_maze(maze)
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- GREEDY
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Activity Selection', 'Greedy', 'Intermediate', 'O(n log n)', 'O(1)'),
('Huffman Coding', 'Greedy', 'Advanced', 'O(n log n)', 'O(n)'),
('Fractional Knapsack', 'Greedy', 'Intermediate', 'O(n log n)', 'O(1)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Activity Selection'), 'python', $code$def activity_selection(activities):
    activities.sort(key=lambda x: x[1])
    selected = [activities[0]]
    last_end = activities[0][1]
    for start, end in activities[1:]:
        if start >= last_end:
            selected.append((start, end))
            last_end = end
    return selected

activities = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]
result = activity_selection(activities)
$code$),
((SELECT id FROM templates WHERE name = 'Huffman Coding'), 'python', $code$import heapq
from collections import Counter

class Node:
    def __init__(self, freq, char=None, left=None, right=None):
        self.freq = freq
        self.char = char
        self.left = left
        self.right = right
    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(text):
    freq = Counter(text)
    heap = [Node(f, ch) for ch, f in freq.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        heapq.heappush(heap, Node(left.freq + right.freq, None, left, right))
    return heap[0]

def build_codes(node, prefix="", codebook=None):
    if codebook is None:
        codebook = {}
    if node.char is not None:
        codebook[node.char] = prefix or "0"
    else:
        build_codes(node.left, prefix + "0", codebook)
        build_codes(node.right, prefix + "1", codebook)
    return codebook

tree = build_huffman_tree("abracadabra")
result = build_codes(tree)
$code$),
((SELECT id FROM templates WHERE name = 'Fractional Knapsack'), 'python', $code$def fractional_knapsack(items, capacity):
    items = sorted(items, key=lambda x: x[1] / x[0], reverse=True)
    total_value = 0.0
    for weight, value in items:
        if capacity <= 0:
            break
        take = min(weight, capacity)
        total_value += take * (value / weight)
        capacity -= take
    return total_value

items = [(10, 60), (20, 100), (30, 120)]
result = fractional_knapsack(items, 50)
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- STRINGS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('KMP Pattern Matching', 'Strings', 'Advanced', 'O(n + m)', 'O(m)'),
('Rabin-Karp', 'Strings', 'Advanced', 'O(n + m) avg', 'O(1)'),
('Z-Algorithm', 'Strings', 'Advanced', 'O(n + m)', 'O(n + m)'),
('Longest Palindromic Substring', 'Strings', 'Intermediate', 'O(n²)', 'O(1)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'KMP Pattern Matching'), 'python', $code$def build_lps(pattern):
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length != 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    return lps

def kmp_search(text, pattern):
    lps = build_lps(pattern)
    matches = []
    i = j = 0
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1
            j += 1
            if j == len(pattern):
                matches.append(i - j)
                j = lps[j - 1]
        elif j != 0:
            j = lps[j - 1]
        else:
            i += 1
    return matches

result = kmp_search("ababcabcabababd", "abab")
$code$),
((SELECT id FROM templates WHERE name = 'Rabin-Karp'), 'python', $code$def rabin_karp(text, pattern, base=256, prime=101):
    n, m = len(text), len(pattern)
    if m > n:
        return []
    pattern_hash = 0
    text_hash = 0
    h = 1
    for _ in range(m - 1):
        h = (h * base) % prime

    for i in range(m):
        pattern_hash = (base * pattern_hash + ord(pattern[i])) % prime
        text_hash = (base * text_hash + ord(text[i])) % prime

    matches = []
    for i in range(n - m + 1):
        if pattern_hash == text_hash and text[i:i + m] == pattern:
            matches.append(i)
        if i < n - m:
            text_hash = (base * (text_hash - ord(text[i]) * h) + ord(text[i + m])) % prime
            if text_hash < 0:
                text_hash += prime
    return matches

result = rabin_karp("GEEKS FOR GEEKS", "GEEK")
$code$),
((SELECT id FROM templates WHERE name = 'Z-Algorithm'), 'python', $code$def z_algorithm(s):
    n = len(s)
    z = [0] * n
    z[0] = n
    l, r = 0, 0
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    return z

result = z_algorithm("aabxaabxcaabxaabxay")
$code$),
((SELECT id FROM templates WHERE name = 'Longest Palindromic Substring'), 'python', $code$def longest_palindrome(s):
    if not s:
        return ""

    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return s[l + 1:r]

    longest = ""
    for i in range(len(s)):
        odd = expand(i, i)
        even = expand(i, i + 1)
        longest = max(longest, odd, even, key=len)
    return longest

result = longest_palindrome("babad")
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- MATH & BIT MANIPULATION
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO templates (name, category, difficulty, time_complexity, space_complexity) VALUES
('Sieve of Eratosthenes', 'Math & Bit Manipulation', 'Fundamental', 'O(n log log n)', 'O(n)'),
('GCD / LCM (Euclidean)', 'Math & Bit Manipulation', 'Fundamental', 'O(log min(a,b))', 'O(1)'),
('Fast Exponentiation', 'Math & Bit Manipulation', 'Fundamental', 'O(log n)', 'O(1)'),
('Bit Manipulation Basics', 'Math & Bit Manipulation', 'Fundamental', 'O(1)', 'O(1)');

INSERT INTO template_solutions (template_id, language, code) VALUES
((SELECT id FROM templates WHERE name = 'Sieve of Eratosthenes'), 'python', $code$def sieve_of_eratosthenes(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
    return [i for i, prime in enumerate(is_prime) if prime]

result = sieve_of_eratosthenes(50)
$code$),
((SELECT id FROM templates WHERE name = 'GCD / LCM (Euclidean)'), 'python', $code$def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return a * b // gcd(a, b)

result = (gcd(48, 18), lcm(4, 6))
$code$),
((SELECT id FROM templates WHERE name = 'Fast Exponentiation'), 'python', $code$def fast_pow(base, exp, mod=None):
    result = 1
    base = base % mod if mod else base
    while exp > 0:
        if exp % 2 == 1:
            result = (result * base) % mod if mod else result * base
        exp //= 2
        base = (base * base) % mod if mod else base * base
    return result

result = fast_pow(2, 10)
$code$),
((SELECT id FROM templates WHERE name = 'Bit Manipulation Basics'), 'python', $code$def count_set_bits(n):
    count = 0
    while n:
        n &= (n - 1)
        count += 1
    return count

def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0

result = (count_set_bits(29), is_power_of_two(16))
$code$);

-- ═══════════════════════════════════════════════════════════════════════════
-- RENDER TYPE — mark graph-category algorithms to use the node/edge graph
-- visualization component instead of the default bar-chart array view.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE templates SET render_type = 'graph' WHERE category = 'Graphs';

-- ── Go reference solutions (v13: Python + Go only) ───────────────────────

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func bubbleSort(arr []int) []int {
	n := len(arr)
	for i := 0; i < n; i++ {
		for j := 0; j < n-i-1; j++ {
			if arr[j] > arr[j+1] {
				arr[j], arr[j+1] = arr[j+1], arr[j]
			}
		}
	}
	return arr
}

func main() {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	bubbleSort(arr)
}
$go$ FROM templates WHERE name = 'Bubble Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func insertionSort(arr []int) []int {
	for i := 1; i < len(arr); i++ {
		key := arr[i]
		j := i - 1
		for j >= 0 && arr[j] > key {
			arr[j+1] = arr[j]
			j--
		}
		arr[j+1] = key
	}
	return arr
}

func main() {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	insertionSort(arr)
}
$go$ FROM templates WHERE name = 'Insertion Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func selectionSort(arr []int) []int {
	for i := 0; i < len(arr); i++ {
		minIndex := i
		for j := i + 1; j < len(arr); j++ {
			if arr[j] < arr[minIndex] {
				minIndex = j
			}
		}
		arr[i], arr[minIndex] = arr[minIndex], arr[i]
	}
	return arr
}

func main() {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	selectionSort(arr)
}
$go$ FROM templates WHERE name = 'Selection Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func merge(left, right []int) []int {
	out := make([]int, 0, len(left)+len(right))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			out = append(out, left[i])
			i++
		} else {
			out = append(out, right[j])
			j++
		}
	}
	out = append(out, left[i:]...)
	out = append(out, right[j:]...)
	return out
}

func mergeSort(arr []int) []int {
	if len(arr) <= 1 {
		return append([]int(nil), arr...)
	}
	mid := len(arr) / 2
	return merge(mergeSort(arr[:mid]), mergeSort(arr[mid:]))
}

func main() {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	result := mergeSort(arr)
	copy(arr, result)
}
$go$ FROM templates WHERE name = 'Merge Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func partition(arr []int, low, high int) int {
	pivot := arr[high]
	i := low - 1
	for j := low; j < high; j++ {
		if arr[j] <= pivot {
			i++
			arr[i], arr[j] = arr[j], arr[i]
		}
	}
	arr[i+1], arr[high] = arr[high], arr[i+1]
	return i + 1
}

func quickSort(arr []int, low, high int) {
	if low < high {
		p := partition(arr, low, high)
		quickSort(arr, low, p-1)
		quickSort(arr, p+1, high)
	}
}

func main() {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	quickSort(arr, 0, len(arr)-1)
}
$go$ FROM templates WHERE name = 'Quick Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func heapify(arr []int, n, i int) {
	largest := i
	left, right := 2*i+1, 2*i+2
	if left < n && arr[left] > arr[largest] {
		largest = left
	}
	if right < n && arr[right] > arr[largest] {
		largest = right
	}
	if largest != i {
		arr[i], arr[largest] = arr[largest], arr[i]
		heapify(arr, n, largest)
	}
}

func heapSort(arr []int) {
	n := len(arr)
	for i := n/2 - 1; i >= 0; i-- {
		heapify(arr, n, i)
	}
	for i := n - 1; i > 0; i-- {
		arr[0], arr[i] = arr[i], arr[0]
		heapify(arr, i, 0)
	}
}

func main() {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	heapSort(arr)
}
$go$ FROM templates WHERE name = 'Heap Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func countingSort(arr []int) []int {
	if len(arr) == 0 {
		return arr
	}
	maxValue := arr[0]
	for _, v := range arr {
		if v > maxValue {
			maxValue = v
		}
	}
	count := make([]int, maxValue+1)
	for _, v := range arr {
		count[v]++
	}
	index := 0
	for value, frequency := range count {
		for ; frequency > 0; frequency-- {
			arr[index] = value
			index++
		}
	}
	return arr
}

func main() {
	arr := []int{4, 2, 2, 8, 3, 3, 1}
	countingSort(arr)
}
$go$ FROM templates WHERE name = 'Counting Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func radixSort(arr []int) {
	if len(arr) == 0 {
		return
	}
	maxValue := arr[0]
	for _, v := range arr {
		if v > maxValue {
			maxValue = v
		}
	}
	output := make([]int, len(arr))
	for exp := 1; maxValue/exp > 0; exp *= 10 {
		count := make([]int, 10)
		for _, v := range arr {
			count[(v/exp)%10]++
		}
		for i := 1; i < 10; i++ {
			count[i] += count[i-1]
		}
		for i := len(arr) - 1; i >= 0; i-- {
			digit := (arr[i] / exp) % 10
			output[count[digit]-1] = arr[i]
			count[digit]--
		}
		copy(arr, output)
	}
}

func main() {
	arr := []int{170, 45, 75, 90, 802, 24, 2, 66}
	radixSort(arr)
}
$go$ FROM templates WHERE name = 'Radix Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func linearSearch(arr []int, target int) int {
	for i := range arr {
		if arr[i] == target {
			return i
		}
	}
	return -1
}

func main() {
	arr := []int{5, 3, 8, 1, 9, 2}
	_ = linearSearch(arr, 9)
}
$go$ FROM templates WHERE name = 'Linear Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func binarySearch(arr []int, target int) int {
	low, high := 0, len(arr)-1
	for low <= high {
		mid := low + (high-low)/2
		if arr[mid] == target {
			return mid
		}
		if arr[mid] < target {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	return -1
}

func main() {
	arr := []int{1, 3, 5, 7, 9, 11, 13}
	_ = binarySearch(arr, 11)
}
$go$ FROM templates WHERE name = 'Binary Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func ternarySearch(arr []int, target, low, high int) int {
	if low > high {
		return -1
	}
	third := (high - low) / 3
	mid1, mid2 := low+third, high-third
	if arr[mid1] == target {
		return mid1
	}
	if arr[mid2] == target {
		return mid2
	}
	if target < arr[mid1] {
		return ternarySearch(arr, target, low, mid1-1)
	}
	if target > arr[mid2] {
		return ternarySearch(arr, target, mid2+1, high)
	}
	return ternarySearch(arr, target, mid1+1, mid2-1)
}

func main() {
	arr := []int{1, 3, 5, 7, 9, 11, 13}
	_ = ternarySearch(arr, 7, 0, len(arr)-1)
}
$go$ FROM templates WHERE name = 'Ternary Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Node struct {
	Value int
	Next  *Node
}

func reverse(head *Node) *Node {
	var previous *Node
	current := head
	for current != nil {
		next := current.Next
		current.Next = previous
		previous = current
		current = next
	}
	return previous
}

func main() {
	head := &Node{1, &Node{2, &Node{3, &Node{4, nil}}}}
	_ = reverse(head)
}
$go$ FROM templates WHERE name = 'Reverse a Linked List'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Node struct {
	Value int
	Next  *Node
}

func hasCycle(head *Node) bool {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast {
			return true
		}
	}
	return false
}

func main() {
	a, b, c := &Node{Value: 1}, &Node{Value: 2}, &Node{Value: 3}
	a.Next, b.Next, c.Next = b, c, b
	_ = hasCycle(a)
}
$go$ FROM templates WHERE name = 'Cycle Detection (Floyd''s)'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Node struct {
	Value int
	Next  *Node
}

func mergeLists(a, b *Node) *Node {
	dummy := &Node{}
	tail := dummy
	for a != nil && b != nil {
		if a.Value <= b.Value {
			tail.Next, a = a, a.Next
		} else {
			tail.Next, b = b, b.Next
		}
		tail = tail.Next
	}
	if a != nil {
		tail.Next = a
	} else {
		tail.Next = b
	}
	return dummy.Next
}

func main() {
	a := &Node{1, &Node{3, &Node{5, nil}}}
	b := &Node{2, &Node{4, &Node{6, nil}}}
	_ = mergeLists(a, b)
}
$go$ FROM templates WHERE name = 'Merge Two Sorted Lists'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Node struct {
	Value       int
	Left, Right *Node
}

func inorder(node *Node, out *[]int) {
	if node == nil {
		return
	}
	inorder(node.Left, out)
	*out = append(*out, node.Value)
	inorder(node.Right, out)
}
func preorder(node *Node, out *[]int) {
	if node == nil {
		return
	}
	*out = append(*out, node.Value)
	preorder(node.Left, out)
	preorder(node.Right, out)
}
func postorder(node *Node, out *[]int) {
	if node == nil {
		return
	}
	postorder(node.Left, out)
	postorder(node.Right, out)
	*out = append(*out, node.Value)
}

func main() {
	root := &Node{4, &Node{2, &Node{1, nil, nil}, &Node{3, nil, nil}}, &Node{6, &Node{5, nil, nil}, &Node{7, nil, nil}}}
	var a, b, c []int
	inorder(root, &a)
	preorder(root, &b)
	postorder(root, &c)
}
$go$ FROM templates WHERE name = 'Inorder / Preorder / Postorder Traversal'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Node struct {
	Value       int
	Left, Right *Node
}

func levelOrder(root *Node) []int {
	if root == nil {
		return nil
	}
	queue := []*Node{root}
	out := []int{}
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		out = append(out, node.Value)
		if node.Left != nil {
			queue = append(queue, node.Left)
		}
		if node.Right != nil {
			queue = append(queue, node.Right)
		}
	}
	return out
}

func main() {
	root := &Node{1, &Node{2, nil, nil}, &Node{3, nil, nil}}
	_ = levelOrder(root)
}
$go$ FROM templates WHERE name = 'Level-Order (BFS) Traversal'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Node struct {
	Value       int
	Left, Right *Node
}

func insert(root *Node, value int) *Node {
	if root == nil {
		return &Node{Value: value}
	}
	if value < root.Value {
		root.Left = insert(root.Left, value)
	} else if value > root.Value {
		root.Right = insert(root.Right, value)
	}
	return root
}
func search(root *Node, value int) bool {
	for root != nil {
		if value == root.Value {
			return true
		}
		if value < root.Value {
			root = root.Left
		} else {
			root = root.Right
		}
	}
	return false
}
func minNode(root *Node) *Node {
	for root.Left != nil {
		root = root.Left
	}
	return root
}
func deleteNode(root *Node, value int) *Node {
	if root == nil {
		return nil
	}
	if value < root.Value {
		root.Left = deleteNode(root.Left, value)
	} else if value > root.Value {
		root.Right = deleteNode(root.Right, value)
	} else {
		if root.Left == nil {
			return root.Right
		}
		if root.Right == nil {
			return root.Left
		}
		successor := minNode(root.Right)
		root.Value = successor.Value
		root.Right = deleteNode(root.Right, successor.Value)
	}
	return root
}

func main() {
	var root *Node
	for _, v := range []int{50, 30, 70, 20, 40, 60, 80} {
		root = insert(root, v)
	}
	_ = search(root, 60)
	root = deleteNode(root, 30)
}
$go$ FROM templates WHERE name = 'BST Insert / Delete / Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

type Node struct {
	Key, Height int
	Left, Right *Node
}

func height(n *Node) int {
	if n == nil {
		return 0
	}
	return n.Height
}
func rightRotate(y *Node) *Node {
	x := y.Left
	t := x.Right
	x.Right = y
	y.Left = t
	y.Height = 1 + max(height(y.Left), height(y.Right))
	x.Height = 1 + max(height(x.Left), height(x.Right))
	return x
}
func leftRotate(x *Node) *Node {
	y := x.Right
	t := y.Left
	y.Left = x
	x.Right = t
	x.Height = 1 + max(height(x.Left), height(x.Right))
	y.Height = 1 + max(height(y.Left), height(y.Right))
	return y
}
func insertAVL(n *Node, key int) *Node {
	if n == nil {
		return &Node{Key: key, Height: 1}
	}
	if key < n.Key {
		n.Left = insertAVL(n.Left, key)
	} else if key > n.Key {
		n.Right = insertAVL(n.Right, key)
	} else {
		return n
	}
	n.Height = 1 + max(height(n.Left), height(n.Right))
	balance := height(n.Left) - height(n.Right)
	if balance > 1 && key < n.Left.Key {
		return rightRotate(n)
	}
	if balance < -1 && key > n.Right.Key {
		return leftRotate(n)
	}
	if balance > 1 && key > n.Left.Key {
		n.Left = leftRotate(n.Left)
		return rightRotate(n)
	}
	if balance < -1 && key < n.Right.Key {
		n.Right = rightRotate(n.Right)
		return leftRotate(n)
	}
	return n
}
func main() {
	var root *Node
	for _, v := range []int{10, 20, 30, 40, 50, 25} {
		root = insertAVL(root, v)
	}
	_ = root
}
$go$ FROM templates WHERE name = 'AVL Tree Rotations'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Trie struct {
	Children map[rune]*Trie
	End      bool
}

func newTrie() *Trie { return &Trie{Children: map[rune]*Trie{}} }
func (t *Trie) Insert(word string) {
	cur := t
	for _, ch := range word {
		if cur.Children[ch] == nil {
			cur.Children[ch] = newTrie()
		}
		cur = cur.Children[ch]
	}
	cur.End = true
}
func (t *Trie) Search(word string) bool {
	cur := t
	for _, ch := range word {
		cur = cur.Children[ch]
		if cur == nil {
			return false
		}
	}
	return cur.End
}
func main() {
	t := newTrie()
	for _, w := range []string{"cat", "car", "dog"} {
		t.Insert(w)
	}
	_ = t.Search("car")
}
$go$ FROM templates WHERE name = 'Trie Insert / Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Node struct {
	Value       int
	Left, Right *Node
}

func lca(root *Node, a, b int) *Node {
	if root == nil || root.Value == a || root.Value == b {
		return root
	}
	left := lca(root.Left, a, b)
	right := lca(root.Right, a, b)
	if left != nil && right != nil {
		return root
	}
	if left != nil {
		return left
	}
	return right
}
func main() {
	root := &Node{3, &Node{5, &Node{6, nil, nil}, &Node{2, nil, nil}}, &Node{1, &Node{0, nil, nil}, &Node{8, nil, nil}}}
	_ = lca(root, 6, 2)
}
$go$ FROM templates WHERE name = 'Lowest Common Ancestor'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "container/heap"

type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() any          { old := *h; n := len(old); x := old[n-1]; *h = old[:n-1]; return x }
func main() {
	h := &IntHeap{7, 3, 9}
	heap.Init(h)
	heap.Push(h, 1)
	_ = heap.Pop(h)
}
$go$ FROM templates WHERE name = 'Heap Insert / Extract-Min'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func heapify(arr []int, n, i int) {
	smallest := i
	l, r := 2*i+1, 2*i+2
	if l < n && arr[l] < arr[smallest] {
		smallest = l
	}
	if r < n && arr[r] < arr[smallest] {
		smallest = r
	}
	if smallest != i {
		arr[i], arr[smallest] = arr[smallest], arr[i]
		heapify(arr, n, smallest)
	}
}
func buildHeap(arr []int) {
	for i := len(arr)/2 - 1; i >= 0; i-- {
		heapify(arr, len(arr), i)
	}
}
func main() { arr := []int{9, 4, 7, 1, -2, 6, 5}; buildHeap(arr) }
$go$ FROM templates WHERE name = 'Build Heap (Heapify)'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "sort"

func kthLargest(arr []int, k int) int {
	copyArr := append([]int(nil), arr...)
	sort.Ints(copyArr)
	return copyArr[len(copyArr)-k]
}
func main() { arr := []int{3, 2, 1, 5, 6, 4}; _ = kthLargest(arr, 2) }
$go$ FROM templates WHERE name = 'K-th Largest Element'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func bfs(graph map[string][]string, start string) []string {
	seen := map[string]bool{start: true}
	q := []string{start}
	order := []string{}
	for len(q) > 0 {
		node := q[0]
		q = q[1:]
		order = append(order, node)
		for _, next := range graph[node] {
			if !seen[next] {
				seen[next] = true
				q = append(q, next)
			}
		}
	}
	return order
}
func main() {
	g := map[string][]string{"A": {"B", "C"}, "B": {"D"}, "C": {"E"}, "D": {}, "E": {}}
	_ = bfs(g, "A")
}
$go$ FROM templates WHERE name = 'Breadth-First Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func dfs(graph map[string][]string, node string, seen map[string]bool, order *[]string) {
	if seen[node] {
		return
	}
	seen[node] = true
	*order = append(*order, node)
	for _, next := range graph[node] {
		dfs(graph, next, seen, order)
	}
}
func main() {
	g := map[string][]string{"A": {"B", "C"}, "B": {"D"}, "C": {"E"}, "D": {}, "E": {}}
	order := []string{}
	dfs(g, "A", map[string]bool{}, &order)
}
$go$ FROM templates WHERE name = 'Depth-First Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "container/heap"

type Edge struct{ To, Weight int }
type Item struct{ Node, Dist int }
type PQ []Item

func (p PQ) Len() int           { return len(p) }
func (p PQ) Less(i, j int) bool { return p[i].Dist < p[j].Dist }
func (p PQ) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
func (p *PQ) Push(x any)        { *p = append(*p, x.(Item)) }
func (p *PQ) Pop() any          { old := *p; n := len(old); x := old[n-1]; *p = old[:n-1]; return x }
func dijkstra(g map[int][]Edge, start int) map[int]int {
	const inf = int(^uint(0) >> 1)
	dist := map[int]int{}
	for n := range g {
		dist[n] = inf
	}
	dist[start] = 0
	pq := &PQ{{start, 0}}
	heap.Init(pq)
	for pq.Len() > 0 {
		it := heap.Pop(pq).(Item)
		if it.Dist != dist[it.Node] {
			continue
		}
		for _, e := range g[it.Node] {
			nd := it.Dist + e.Weight
			if nd < dist[e.To] {
				dist[e.To] = nd
				heap.Push(pq, Item{e.To, nd})
			}
		}
	}
	return dist
}
func main() {
	g := map[int][]Edge{0: {{1, 4}, {2, 1}}, 1: {{3, 1}}, 2: {{1, 2}, {3, 5}}, 3: {}}
	_ = dijkstra(g, 0)
}
$go$ FROM templates WHERE name = 'Dijkstra''s Shortest Path'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type Edge struct{ U, V, W int }

func bellmanFord(n int, edges []Edge, start int) ([]int, bool) {
	const inf = int(1e9)
	dist := make([]int, n)
	for i := range dist {
		dist[i] = inf
	}
	dist[start] = 0
	for i := 0; i < n-1; i++ {
		changed := false
		for _, e := range edges {
			if dist[e.U] != inf && dist[e.U]+e.W < dist[e.V] {
				dist[e.V] = dist[e.U] + e.W
				changed = true
			}
		}
		if !changed {
			break
		}
	}
	for _, e := range edges {
		if dist[e.U] != inf && dist[e.U]+e.W < dist[e.V] {
			return dist, false
		}
	}
	return dist, true
}
func main() {
	edges := []Edge{{0, 1, 4}, {0, 2, 5}, {1, 2, -2}, {2, 3, 3}}
	_, _ = bellmanFord(4, edges, 0)
}
$go$ FROM templates WHERE name = 'Bellman-Ford'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func floydWarshall(dist [][]int) [][]int {
	n := len(dist)
	for k := 0; k < n; k++ {
		for i := 0; i < n; i++ {
			for j := 0; j < n; j++ {
				if dist[i][k]+dist[k][j] < dist[i][j] {
					dist[i][j] = dist[i][k] + dist[k][j]
				}
			}
		}
	}
	return dist
}
func main() {
	const inf = 99999
	dist := [][]int{{0, 3, inf, 7}, {8, 0, 2, inf}, {5, inf, 0, 1}, {2, inf, inf, 0}}
	_ = floydWarshall(dist)
}
$go$ FROM templates WHERE name = 'Floyd-Warshall'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "container/heap"

type Point struct{ R, C int }
type State struct {
	P    Point
	G, F int
}
type PQ []State

func (p PQ) Len() int           { return len(p) }
func (p PQ) Less(i, j int) bool { return p[i].F < p[j].F }
func (p PQ) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
func (p *PQ) Push(x any)        { *p = append(*p, x.(State)) }
func (p *PQ) Pop() any          { old := *p; n := len(old); x := old[n-1]; *p = old[:n-1]; return x }
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
func h(a, b Point) int { return abs(a.R-b.R) + abs(a.C-b.C) }
func astar(grid [][]int, start, goal Point) int {
	pq := &PQ{{start, 0, h(start, goal)}}
	heap.Init(pq)
	best := map[Point]int{start: 0}
	dirs := []Point{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
	for pq.Len() > 0 {
		s := heap.Pop(pq).(State)
		if s.P == goal {
			return s.G
		}
		for _, d := range dirs {
			n := Point{s.P.R + d.R, s.P.C + d.C}
			if n.R < 0 || n.C < 0 || n.R >= len(grid) || n.C >= len(grid[0]) || grid[n.R][n.C] < 0 {
				continue
			}
			ng := s.G + grid[n.R][n.C]
			old, ok := best[n]
			if !ok || ng < old {
				best[n] = ng
				heap.Push(pq, State{n, ng, ng + h(n, goal)})
			}
		}
	}
	return -1
}
func main() {
	grid := [][]int{{1, 1, 1, 1}, {1, -1, 3, 1}, {1, 1, 1, 1}}
	_ = astar(grid, Point{0, 0}, Point{2, 3})
}
$go$ FROM templates WHERE name = 'A* Search'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func topo(graph map[string][]string) []string {
	in := map[string]int{}
	for u, nexts := range graph {
		if _, ok := in[u]; !ok {
			in[u] = 0
		}
		for _, v := range nexts {
			in[v]++
		}
	}
	q := []string{}
	for n, d := range in {
		if d == 0 {
			q = append(q, n)
		}
	}
	order := []string{}
	for len(q) > 0 {
		u := q[0]
		q = q[1:]
		order = append(order, u)
		for _, v := range graph[u] {
			in[v]--
			if in[v] == 0 {
				q = append(q, v)
			}
		}
	}
	return order
}
func main() { g := map[string][]string{"Shop": {"Cook"}, "Cook": {"Eat"}, "Eat": {}}; _ = topo(g) }
$go$ FROM templates WHERE name = 'Topological Sort'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "sort"

type Edge struct{ U, V, W int }
type DSU struct{ P, R []int }

func newDSU(n int) *DSU {
	p := make([]int, n)
	r := make([]int, n)
	for i := range p {
		p[i] = i
	}
	return &DSU{p, r}
}
func (d *DSU) Find(x int) int {
	if d.P[x] != x {
		d.P[x] = d.Find(d.P[x])
	}
	return d.P[x]
}
func (d *DSU) Union(a, b int) bool {
	a, b = d.Find(a), d.Find(b)
	if a == b {
		return false
	}
	if d.R[a] < d.R[b] {
		a, b = b, a
	}
	d.P[b] = a
	if d.R[a] == d.R[b] {
		d.R[a]++
	}
	return true
}
func kruskal(n int, edges []Edge) []Edge {
	sort.Slice(edges, func(i, j int) bool { return edges[i].W < edges[j].W })
	d := newDSU(n)
	out := []Edge{}
	for _, e := range edges {
		if d.Union(e.U, e.V) {
			out = append(out, e)
		}
	}
	return out
}
func main() {
	edges := []Edge{{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}
	_ = kruskal(4, edges)
}
$go$ FROM templates WHERE name = 'Kruskal''s MST'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "container/heap"

type Edge struct{ To, W int }
type Item struct{ From, To, W int }
type PQ []Item

func (p PQ) Len() int           { return len(p) }
func (p PQ) Less(i, j int) bool { return p[i].W < p[j].W }
func (p PQ) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
func (p *PQ) Push(x any)        { *p = append(*p, x.(Item)) }
func (p *PQ) Pop() any          { old := *p; n := len(old); x := old[n-1]; *p = old[:n-1]; return x }
func prim(g map[int][]Edge, start int) []Item {
	seen := map[int]bool{start: true}
	pq := &PQ{}
	heap.Init(pq)
	for _, e := range g[start] {
		heap.Push(pq, Item{start, e.To, e.W})
	}
	out := []Item{}
	for pq.Len() > 0 {
		e := heap.Pop(pq).(Item)
		if seen[e.To] {
			continue
		}
		seen[e.To] = true
		out = append(out, e)
		for _, n := range g[e.To] {
			if !seen[n.To] {
				heap.Push(pq, Item{e.To, n.To, n.W})
			}
		}
	}
	return out
}
func main() {
	g := map[int][]Edge{0: {{1, 2}, {2, 3}}, 1: {{0, 2}, {2, 1}}, 2: {{0, 3}, {1, 1}}}
	_ = prim(g, 0)
}
$go$ FROM templates WHERE name = 'Prim''s MST'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

type DSU struct{ Parent, Rank []int }

func newDSU(n int) *DSU {
	p := make([]int, n)
	r := make([]int, n)
	for i := range p {
		p[i] = i
	}
	return &DSU{p, r}
}
func (d *DSU) Find(x int) int {
	if d.Parent[x] != x {
		d.Parent[x] = d.Find(d.Parent[x])
	}
	return d.Parent[x]
}
func (d *DSU) Union(a, b int) {
	ra, rb := d.Find(a), d.Find(b)
	if ra == rb {
		return
	}
	if d.Rank[ra] < d.Rank[rb] {
		ra, rb = rb, ra
	}
	d.Parent[rb] = ra
	if d.Rank[ra] == d.Rank[rb] {
		d.Rank[ra]++
	}
}
func main() { d := newDSU(6); d.Union(0, 1); d.Union(1, 2); d.Union(3, 4); _ = d.Find(2) }
$go$ FROM templates WHERE name = 'Union-Find / Disjoint Set'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
func knapsack(weights, values []int, capacity int) int {
	dp := make([]int, capacity+1)
	for i, w := range weights {
		for c := capacity; c >= w; c-- {
			dp[c] = max(dp[c], dp[c-w]+values[i])
		}
	}
	return dp[capacity]
}
func main() {
	weights := []int{1, 3, 4, 5}
	values := []int{1, 4, 5, 7}
	_ = knapsack(weights, values, 7)
}
$go$ FROM templates WHERE name = '0/1 Knapsack'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
func lcs(a, b string) int {
	dp := make([][]int, len(a)+1)
	for i := range dp {
		dp[i] = make([]int, len(b)+1)
	}
	for i := 1; i <= len(a); i++ {
		for j := 1; j <= len(b); j++ {
			if a[i-1] == b[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
			} else {
				dp[i][j] = max(dp[i-1][j], dp[i][j-1])
			}
		}
	}
	return dp[len(a)][len(b)]
}
func main() { _ = lcs("ABCBDAB", "BDCABA") }
$go$ FROM templates WHERE name = 'Longest Common Subsequence'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "sort"

func lis(arr []int) int {
	tails := []int{}
	for _, x := range arr {
		i := sort.SearchInts(tails, x)
		if i == len(tails) {
			tails = append(tails, x)
		} else {
			tails[i] = x
		}
	}
	return len(tails)
}
func main() { arr := []int{10, 9, 2, 5, 3, 7, 101, 18}; _ = lis(arr) }
$go$ FROM templates WHERE name = 'Longest Increasing Subsequence'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func min3(a, b, c int) int {
	if a > b {
		a = b
	}
	if a > c {
		a = c
	}
	return a
}
func editDistance(a, b string) int {
	dp := make([][]int, len(a)+1)
	for i := range dp {
		dp[i] = make([]int, len(b)+1)
		dp[i][0] = i
	}
	for j := 0; j <= len(b); j++ {
		dp[0][j] = j
	}
	for i := 1; i <= len(a); i++ {
		for j := 1; j <= len(b); j++ {
			if a[i-1] == b[j-1] {
				dp[i][j] = dp[i-1][j-1]
			} else {
				dp[i][j] = 1 + min3(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
			}
		}
	}
	return dp[len(a)][len(b)]
}
func main() { _ = editDistance("horse", "ros") }
$go$ FROM templates WHERE name = 'Edit Distance'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func coinChange(coins []int, amount int) int {
	const inf = int(1e9)
	dp := make([]int, amount+1)
	for i := 1; i <= amount; i++ {
		dp[i] = inf
	}
	for _, coin := range coins {
		for a := coin; a <= amount; a++ {
			if dp[a-coin]+1 < dp[a] {
				dp[a] = dp[a-coin] + 1
			}
		}
	}
	if dp[amount] >= inf {
		return -1
	}
	return dp[amount]
}
func main() { coins := []int{1, 2, 5}; _ = coinChange(coins, 11) }
$go$ FROM templates WHERE name = 'Coin Change'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func matrixChain(dims []int) int {
	n := len(dims) - 1
	dp := make([][]int, n)
	for i := range dp {
		dp[i] = make([]int, n)
	}
	for length := 2; length <= n; length++ {
		for i := 0; i+length <= n; i++ {
			j := i + length - 1
			dp[i][j] = int(1e9)
			for k := i; k < j; k++ {
				cost := dp[i][k] + dp[k+1][j] + dims[i]*dims[k+1]*dims[j+1]
				if cost < dp[i][j] {
					dp[i][j] = cost
				}
			}
		}
	}
	return dp[0][n-1]
}
func main() { dims := []int{40, 20, 30, 10, 30}; _ = matrixChain(dims) }
$go$ FROM templates WHERE name = 'Matrix Chain Multiplication'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func fib(n int, memo map[int]int) int {
	if n <= 1 {
		return n
	}
	if v, ok := memo[n]; ok {
		return v
	}
	memo[n] = fib(n-1, memo) + fib(n-2, memo)
	return memo[n]
}
func main() { _ = fib(10, map[int]int{}) }
$go$ FROM templates WHERE name = 'Fibonacci (memoized)'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func solveNQueens(n int) [][]int {
	solutions := [][]int{}
	cols := make([]bool, n)
	diag1 := make([]bool, 2*n)
	diag2 := make([]bool, 2*n)
	board := make([]int, n)
	var place func(int)
	place = func(r int) {
		if r == n {
			solutions = append(solutions, append([]int(nil), board...))
			return
		}
		for c := 0; c < n; c++ {
			d1, d2 := r-c+n, r+c
			if cols[c] || diag1[d1] || diag2[d2] {
				continue
			}
			cols[c], diag1[d1], diag2[d2] = true, true, true
			board[r] = c
			place(r + 1)
			cols[c], diag1[d1], diag2[d2] = false, false, false
		}
	}
	place(0)
	return solutions
}
func main() { _ = solveNQueens(4) }
$go$ FROM templates WHERE name = 'N-Queens'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func valid(board *[9][9]int, r, c, v int) bool {
	for i := 0; i < 9; i++ {
		if board[r][i] == v || board[i][c] == v {
			return false
		}
	}
	br, bc := (r/3)*3, (c/3)*3
	for i := br; i < br+3; i++ {
		for j := bc; j < bc+3; j++ {
			if board[i][j] == v {
				return false
			}
		}
	}
	return true
}
func solveSudoku(board *[9][9]int) bool {
	for r := 0; r < 9; r++ {
		for c := 0; c < 9; c++ {
			if board[r][c] != 0 {
				continue
			}
			for v := 1; v <= 9; v++ {
				if valid(board, r, c, v) {
					board[r][c] = v
					if solveSudoku(board) {
						return true
					}
					board[r][c] = 0
				}
			}
			return false
		}
	}
	return true
}
func main() {
	board := [9][9]int{{5, 3, 0, 0, 7, 0, 0, 0, 0}, {6, 0, 0, 1, 9, 5, 0, 0, 0}, {0, 9, 8, 0, 0, 0, 0, 6, 0}, {8, 0, 0, 0, 6, 0, 0, 0, 3}, {4, 0, 0, 8, 0, 3, 0, 0, 1}, {7, 0, 0, 0, 2, 0, 0, 0, 6}, {0, 6, 0, 0, 0, 0, 2, 8, 0}, {0, 0, 0, 4, 1, 9, 0, 0, 5}, {0, 0, 0, 0, 8, 0, 0, 7, 9}}
	_ = solveSudoku(&board)
}
$go$ FROM templates WHERE name = 'Sudoku Solver'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func permutations(nums []int) [][]int {
	out := [][]int{}
	var backtrack func(int)
	backtrack = func(start int) {
		if start == len(nums) {
			out = append(out, append([]int(nil), nums...))
			return
		}
		for i := start; i < len(nums); i++ {
			nums[start], nums[i] = nums[i], nums[start]
			backtrack(start + 1)
			nums[start], nums[i] = nums[i], nums[start]
		}
	}
	backtrack(0)
	return out
}
func main() { nums := []int{1, 2, 3}; _ = permutations(nums) }
$go$ FROM templates WHERE name = 'Permutations / Subsets'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func solveMaze(maze [][]int) [][]int {
	n := len(maze)
	path := make([][]int, n)
	for i := range path {
		path[i] = make([]int, n)
	}
	var walk func(int, int) bool
	walk = func(r, c int) bool {
		if r < 0 || c < 0 || r >= n || c >= n || maze[r][c] == 0 || path[r][c] == 1 {
			return false
		}
		path[r][c] = 1
		if r == n-1 && c == n-1 {
			return true
		}
		if walk(r+1, c) || walk(r, c+1) || walk(r-1, c) || walk(r, c-1) {
			return true
		}
		path[r][c] = 0
		return false
	}
	walk(0, 0)
	return path
}
func main() {
	maze := [][]int{{1, 0, 0, 0}, {1, 1, 0, 1}, {0, 1, 0, 0}, {1, 1, 1, 1}}
	_ = solveMaze(maze)
}
$go$ FROM templates WHERE name = 'Rat in a Maze'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "sort"

type Activity struct{ Start, End int }

func selectActivities(a []Activity) []Activity {
	sort.Slice(a, func(i, j int) bool { return a[i].End < a[j].End })
	out := []Activity{}
	last := -1
	for _, x := range a {
		if x.Start >= last {
			out = append(out, x)
			last = x.End
		}
	}
	return out
}
func main() { a := []Activity{{1, 2}, {3, 4}, {0, 6}, {5, 7}, {8, 9}, {5, 9}}; _ = selectActivities(a) }
$go$ FROM templates WHERE name = 'Activity Selection'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "container/heap"

type Node struct {
	Ch          rune
	Freq        int
	Left, Right *Node
}
type PQ []*Node

func (p PQ) Len() int           { return len(p) }
func (p PQ) Less(i, j int) bool { return p[i].Freq < p[j].Freq }
func (p PQ) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
func (p *PQ) Push(x any)        { *p = append(*p, x.(*Node)) }
func (p *PQ) Pop() any          { old := *p; n := len(old); x := old[n-1]; *p = old[:n-1]; return x }
func huffman(freq map[rune]int) *Node {
	pq := &PQ{}
	heap.Init(pq)
	for ch, f := range freq {
		heap.Push(pq, &Node{Ch: ch, Freq: f})
	}
	for pq.Len() > 1 {
		a := heap.Pop(pq).(*Node)
		b := heap.Pop(pq).(*Node)
		heap.Push(pq, &Node{Freq: a.Freq + b.Freq, Left: a, Right: b})
	}
	return heap.Pop(pq).(*Node)
}
func main() { _ = huffman(map[rune]int{'a': 5, 'b': 9, 'c': 12, 'd': 13, 'e': 16, 'f': 45}) }
$go$ FROM templates WHERE name = 'Huffman Coding'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

import "sort"

type Item struct{ Value, Weight float64 }

func fractional(items []Item, capacity float64) float64 {
	sort.Slice(items, func(i, j int) bool { return items[i].Value/items[i].Weight > items[j].Value/items[j].Weight })
	total := 0.0
	for _, it := range items {
		if capacity <= 0 {
			break
		}
		take := it.Weight
		if take > capacity {
			take = capacity
		}
		total += take * (it.Value / it.Weight)
		capacity -= take
	}
	return total
}
func main() { items := []Item{{60, 10}, {100, 20}, {120, 30}}; _ = fractional(items, 50) }
$go$ FROM templates WHERE name = 'Fractional Knapsack'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func lps(pattern string) []int {
	table := make([]int, len(pattern))
	for i, length := 1, 0; i < len(pattern); {
		if pattern[i] == pattern[length] {
			length++
			table[i] = length
			i++
		} else if length > 0 {
			length = table[length-1]
		} else {
			i++
		}
	}
	return table
}
func kmp(text, pattern string) int {
	table := lps(pattern)
	for i, j := 0, 0; i < len(text); {
		if text[i] == pattern[j] {
			i++
			j++
			if j == len(pattern) {
				return i - j
			}
		} else if j > 0 {
			j = table[j-1]
		} else {
			i++
		}
	}
	return -1
}
func main() { _ = kmp("ABABDABACDABABCABAB", "ABABCABAB") }
$go$ FROM templates WHERE name = 'KMP Pattern Matching'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func rabinKarp(text, pattern string) int {
	if len(pattern) > len(text) {
		return -1
	}
	const base, mod = 256, 101
	h := 1
	for i := 0; i < len(pattern)-1; i++ {
		h = (h * base) % mod
	}
	ph, th := 0, 0
	for i := 0; i < len(pattern); i++ {
		ph = (base*ph + int(pattern[i])) % mod
		th = (base*th + int(text[i])) % mod
	}
	for i := 0; i <= len(text)-len(pattern); i++ {
		if ph == th && text[i:i+len(pattern)] == pattern {
			return i
		}
		if i < len(text)-len(pattern) {
			th = (base*(th-int(text[i])*h) + int(text[i+len(pattern)])) % mod
			if th < 0 {
				th += mod
			}
		}
	}
	return -1
}
func main() { _ = rabinKarp("GEEKS FOR GEEKS", "GEEK") }
$go$ FROM templates WHERE name = 'Rabin-Karp'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func zArray(s string) []int {
	z := make([]int, len(s))
	l, r := 0, 0
	for i := 1; i < len(s); i++ {
		if i <= r {
			if z[i-l] < r-i+1 {
				z[i] = z[i-l]
			} else {
				z[i] = r - i + 1
			}
		}
		for i+z[i] < len(s) && s[z[i]] == s[i+z[i]] {
			z[i]++
		}
		if i+z[i]-1 > r {
			l, r = i, i+z[i]-1
		}
	}
	return z
}
func find(text, pattern string) []int {
	s := pattern + "$" + text
	z := zArray(s)
	out := []int{}
	for i, v := range z {
		if v == len(pattern) {
			out = append(out, i-len(pattern)-1)
		}
	}
	return out
}
func main() { _ = find("AABAACAADAABAABA", "AABA") }
$go$ FROM templates WHERE name = 'Z-Algorithm'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func longestPalindrome(s string) string {
	if len(s) < 2 {
		return s
	}
	start, end := 0, 0
	expand := func(l, r int) (int, int) {
		for l >= 0 && r < len(s) && s[l] == s[r] {
			l--
			r++
		}
		return l + 1, r - 1
	}
	for i := range s {
		l1, r1 := expand(i, i)
		l2, r2 := expand(i, i+1)
		if r1-l1 > end-start {
			start, end = l1, r1
		}
		if r2-l2 > end-start {
			start, end = l2, r2
		}
	}
	return s[start : end+1]
}
func main() { _ = longestPalindrome("babad") }
$go$ FROM templates WHERE name = 'Longest Palindromic Substring'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func sieve(n int) []int {
	prime := make([]bool, n+1)
	for i := 2; i <= n; i++ {
		prime[i] = true
	}
	for p := 2; p*p <= n; p++ {
		if prime[p] {
			for multiple := p * p; multiple <= n; multiple += p {
				prime[multiple] = false
			}
		}
	}
	out := []int{}
	for i := 2; i <= n; i++ {
		if prime[i] {
			out = append(out, i)
		}
	}
	return out
}
func main() { _ = sieve(50) }
$go$ FROM templates WHERE name = 'Sieve of Eratosthenes'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}
func lcm(a, b int) int { return a / gcd(a, b) * b }
func main()            { _ = gcd(48, 18); _ = lcm(48, 18) }
$go$ FROM templates WHERE name = 'GCD / LCM (Euclidean)'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func power(base, exp int64) int64 {
	result := int64(1)
	for exp > 0 {
		if exp&1 == 1 {
			result *= base
		}
		base *= base
		exp >>= 1
	}
	return result
}
func main() { _ = power(2, 20) }
$go$ FROM templates WHERE name = 'Fast Exponentiation'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;

INSERT INTO template_solutions (template_id, language, code)
SELECT id, 'go', $go$package main

func setBit(n uint, pos uint) uint    { return n | (1 << pos) }
func clearBit(n uint, pos uint) uint  { return n &^ (1 << pos) }
func toggleBit(n uint, pos uint) uint { return n ^ (1 << pos) }
func hasBit(n uint, pos uint) bool    { return n&(1<<pos) != 0 }
func main() {
	n := uint(10)
	n = setBit(n, 0)
	n = clearBit(n, 1)
	n = toggleBit(n, 3)
	_ = hasBit(n, 2)
}
$go$ FROM templates WHERE name = 'Bit Manipulation Basics'
ON CONFLICT (template_id, language) DO UPDATE SET code = EXCLUDED.code;
