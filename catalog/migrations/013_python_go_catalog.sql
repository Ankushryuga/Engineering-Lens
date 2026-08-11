-- v13: restrict the product to Python + Go and backfill Go reference solutions.
-- Safe to run repeatedly. Canonical Go solutions are upserted by (template_id, language).
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $migration$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '013_python_go_catalog') THEN
        DELETE FROM template_solutions WHERE language NOT IN ('python', 'go');
        ALTER TABLE template_solutions DROP CONSTRAINT IF EXISTS template_solutions_language_check;
        ALTER TABLE template_solutions ADD CONSTRAINT template_solutions_language_check CHECK (language IN ('python', 'go'));

        INSERT INTO schema_migrations(version) VALUES ('013_python_go_catalog');
    END IF;
END
$migration$;

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
