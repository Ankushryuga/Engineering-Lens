-- ── Algorithm template catalog — seed data ───────────────────────────────────
-- ~55 canonical, team-authored algorithms across the 11 standard DSA
-- categories (requirement_doc.md §3.6). Python solutions are provided for
-- every entry; additional language coverage is a fast-follow per the v1
-- scope note in §3.7/§3.8 ("1-2 languages per algorithm is an acceptable
-- starting point").

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

def dijkstra(graph, start, target=None):
    # ── Set up the visualization: full node/edge list + starting node ───────
    nodes = list(graph.keys())
    edges = [[u, v, w] for u in graph for v, w in graph[u]]
    record_step({
        "type": "graph_init",
        "nodes": nodes,
        "edges": edges,
        "source": start,
        "info": f"Dijkstra's algorithm — source node {start}",
    })

    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    prev = {}
    pq = [(0, start)]
    visited = set()

    def dist_snapshot():
        return {n: ("∞" if dist[n] == float('inf') else dist[n]) for n in nodes}

    while pq:
        d, node = heapq.heappop(pq)
        if node in visited:
            continue
        visited.add(node)

        record_step({
            "type": "visit",
            "node": node,
            "distances": dist_snapshot(),
            "info": f"visiting {node} (shortest known distance so far: {d})",
        })

        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = node
                heapq.heappush(pq, (new_dist, neighbor))
                record_step({
                    "type": "relax",
                    "edge": [node, neighbor],
                    "distances": dist_snapshot(),
                    "info": f"relaxed edge {node} -> {neighbor}: dist[{neighbor}] = {new_dist}",
                })

    # ── Reconstruct and highlight the shortest path to the target ───────────
    if target is None:
        # Default example target: the farthest reachable node from start.
        reachable = [n for n in nodes if dist[n] != float('inf') and n != start]
        target = max(reachable, key=lambda n: dist[n]) if reachable else start

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
        "distances": dist_snapshot(),
        "info": f"shortest route {start} -> {target}: {' -> '.join(path)} (total distance {dist[target]} km)",
    })
    record_step({"type": "done", "info": "Dijkstra's algorithm complete"})

    return dist

# Real-world example: shortest driving route between US East Coast cities.
# Edge weights are real approximate driving distances in kilometers.
#   New York --306km--> Boston
#   New York --152km--> Philadelphia
#   Philadelphia --165km--> Baltimore
#   Philadelphia --224km--> Washington DC
#   Baltimore --61km--> Washington DC
#   Boston --638km--> Washington DC
graph = {
    'New York':     [('Boston', 306), ('Philadelphia', 152)],
    'Philadelphia': [('Baltimore', 165), ('Washington DC', 224)],
    'Baltimore':    [('Washington DC', 61)],
    'Boston':       [('Washington DC', 638)],
    'Washington DC': [],
}
result = dijkstra(graph, 'New York', target='Washington DC')
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

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    open_set = [(0, start)]
    g_score = {start: 0}
    came_from = {}

    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            return path[::-1]

        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            neighbor = (current[0] + dr, current[1] + dc)
            if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and grid[neighbor[0]][neighbor[1]] == 0:
                tentative_g = g_score[current] + 1
                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f_score, neighbor))
    return None

grid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
result = a_star(grid, (0, 0), (2, 2))
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
