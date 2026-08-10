export interface ScenarioUseCase {
  icon: string
  text: string
}

export interface ScenarioDefinition {
  icon: string
  title: string
  sub: string
  blurb: string
  irl: ScenarioUseCase[]
  category?: string
}

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  "Bubble Sort": {
    "icon": "📦",
    "title": "Warehouse Sorting Line",
    "sub": "Sorting packages by weight before loading a delivery truck",
    "blurb": "A conveyor belt carries packages of different weights. Two neighbouring packages are compared at a time — if the one closer to the truck is heavier, they swap places. Repeat enough passes and the lightest packages end up loaded first, heaviest last, so the truck balances safely.",
    "irl": [
      {
        "icon": "📦",
        "text": "Package loading order"
      },
      {
        "icon": "🎟️",
        "text": "Sorting a small stack of ticket stubs"
      },
      {
        "icon": "🏫",
        "text": "Teaching sorting to beginners"
      }
    ],
    "category": "Sorting"
  },
  "Insertion Sort": {
    "icon": "🃏",
    "title": "Sorting a Hand of Playing Cards",
    "sub": "Inserting each new card into its correct spot among the ones already sorted",
    "blurb": "Picture holding a hand of cards. You pick up cards one at a time and slide each new card into its correct position relative to the ones you're already holding — exactly how insertion sort builds a sorted array left to right.",
    "irl": [
      {
        "icon": "🃏",
        "text": "Sorting cards in your hand"
      },
      {
        "icon": "📥",
        "text": "Inserting a new order into a sorted queue"
      }
    ],
    "category": "Sorting"
  },
  "Merge Sort": {
    "icon": "📚",
    "title": "Merging Two Sorted Bookshelves",
    "sub": "Combining two already-alphabetised shelves into one",
    "blurb": "Two librarians each sort half the returned books, then stand side by side merging their two sorted stacks into one — always taking whichever book comes first alphabetically. That merge step, repeated recursively on smaller and smaller stacks, is merge sort.",
    "irl": [
      {
        "icon": "📚",
        "text": "Merging two sorted book piles"
      },
      {
        "icon": "🧾",
        "text": "Combining two sorted invoice logs"
      }
    ],
    "category": "Sorting"
  },
  "Quick Sort": {
    "icon": "🎯",
    "title": "Splitting a Crowd by a Reference Height",
    "sub": "Picking one person as a pivot and splitting everyone shorter/taller around them",
    "blurb": "Pick one person as a reference (\"pivot\"). Everyone shorter steps to the left, everyone taller steps to the right. Now repeat that same trick within each smaller group — that recursive partitioning is exactly quicksort.",
    "irl": [
      {
        "icon": "🧍",
        "text": "Lining people up by height at events"
      },
      {
        "icon": "💰",
        "text": "Splitting transactions above/below a threshold"
      }
    ],
    "category": "Sorting"
  },
  "Heap Sort": {
    "icon": "🏥",
    "title": "Emergency Room Re-Triage",
    "sub": "Repeatedly pulling out the most urgent patient from a shifting waiting room",
    "blurb": "A max-heap keeps the most urgent patient always at the front. Pull them out, and the next-most-urgent patient bubbles up to take their place. Do that repeatedly and you get patients discharged to treatment in fully sorted priority order.",
    "irl": [
      {
        "icon": "🚑",
        "text": "ER patient re-prioritisation"
      }
    ],
    "category": "Sorting"
  },
  "Counting Sort": {
    "icon": "🗳️",
    "title": "Tallying Election Ballots",
    "sub": "Counting votes per candidate, then reconstructing order from the tallies",
    "blurb": "Instead of comparing ballots to each other, you just tally how many votes each candidate got in labelled bins, then read the bins off in order. No comparisons needed — only works because the range of possible values (candidates) is small and known.",
    "irl": [
      {
        "icon": "🗳️",
        "text": "Tallying votes by candidate"
      },
      {
        "icon": "🎓",
        "text": "Grouping exam scores 0–100"
      }
    ],
    "category": "Sorting"
  },
  "Radix Sort": {
    "icon": "📮",
    "title": "Sorting Mail by Postal Code",
    "sub": "Sorting digit-by-digit, rightmost digit first, like postal sorting machines",
    "blurb": "A postal sorting machine buckets letters by the last digit of the zip code, collects them back up, then re-buckets by the next digit over — repeating until every digit has been used. No two letters are ever compared directly to each other.",
    "irl": [
      {
        "icon": "📮",
        "text": "Postal/zip code sorting machines"
      }
    ],
    "category": "Sorting"
  },
  "Binary Search": {
    "icon": "📖",
    "title": "Looking Up a Word in a Dictionary",
    "sub": "Flipping to the middle, then halving the remaining pages each time",
    "blurb": "You don't read a dictionary front to back to find \"quartz\" — you open to the middle, see you've landed too far (\"R\"), and flip back halfway again. Each guess eliminates half the remaining pages, which is why it only takes a handful of flips even for a huge book.",
    "irl": [
      {
        "icon": "📖",
        "text": "Dictionary / phone book lookup"
      },
      {
        "icon": "🐛",
        "text": "Git bisect to find a bad commit"
      },
      {
        "icon": "🎚️",
        "text": "Guessing a number in a range"
      }
    ],
    "category": "Searching"
  },
  "Linear Search": {
    "icon": "🎒",
    "title": "Digging Through an Unsorted Bag",
    "sub": "Checking every item one by one until you find your keys",
    "blurb": "Your bag isn't organised, so finding your keys means checking item after item until you feel them. No shortcuts — that's linear search: works on anything, but scales with how much stuff is in the bag.",
    "irl": [
      {
        "icon": "🎒",
        "text": "Finding keys in an unsorted bag"
      },
      {
        "icon": "📼",
        "text": "Scanning an unsorted playlist for a track"
      }
    ],
    "category": "Searching"
  },
  "Ternary Search": {
    "icon": "🎚️",
    "title": "Tuning a Radio Dial to Peak Signal",
    "sub": "Splitting the dial into thirds to zero in on the strongest signal",
    "blurb": "Instead of halving like binary search, you check two points that split the range into thirds, keep the third that's trending toward the peak, and repeat — useful when you're hunting for a single maximum/minimum rather than an exact match.",
    "irl": [
      {
        "icon": "📻",
        "text": "Tuning to the strongest signal"
      }
    ],
    "category": "Searching"
  },
  "Reverse a Linked List": {
    "icon": "🚂",
    "title": "Turning a Train Around",
    "sub": "Flipping each coupling one car at a time until the whole train faces the other way",
    "blurb": "Each train car is only coupled to the next one — it has no idea what's further down the line. To reverse the train, you walk car by car and flip each coupling to point backward instead of forward, one at a time, until the whole train faces the opposite direction.",
    "irl": [
      {
        "icon": "🚂",
        "text": "Reversing a train's direction"
      },
      {
        "icon": "↩️",
        "text": "Undo/redo history chains"
      }
    ],
    "category": "Linked Lists"
  },
  "Merge Two Sorted Lists": {
    "icon": "🚃",
    "title": "Coupling Two Trains Into One",
    "sub": "Interleaving two sorted trains car-by-car by their station order",
    "blurb": "Two trains are each already sorted by upcoming station. To combine them into a single sorted train, you repeatedly grab whichever front car has the nearer station and couple it on — the same logic as merging two sorted linked lists.",
    "irl": [
      {
        "icon": "🚃",
        "text": "Combining two sorted queues into one"
      }
    ],
    "category": "Linked Lists"
  },
  "BST Insert / Delete / Search": {
    "icon": "🗂️",
    "title": "Filing a Document by Reference Number",
    "sub": "At every folder, go left if your number is smaller, right if it's bigger",
    "blurb": "A filing cabinet is organised as a tree of folders. To file (or find) a document, you compare its number to the folder in front of you: smaller goes left, larger goes right, and you repeat until you land in the right spot. Same rule, insert or search.",
    "irl": [
      {
        "icon": "🗂️",
        "text": "Filing systems / reference lookups"
      },
      {
        "icon": "🏪",
        "text": "Product catalog category drill-down"
      }
    ],
    "category": "Trees"
  },
  "Inorder / Preorder / Postorder Traversal": {
    "icon": "🏢",
    "title": "Touring an Org Chart",
    "sub": "Different orders for visiting every person in a company hierarchy",
    "blurb": "Visiting everyone in a company's reporting structure can happen in different orders: report on the manager first then their team (preorder), or visit the team then summarize with the manager (postorder). Same tree, different tour itinerary.",
    "irl": [
      {
        "icon": "🏢",
        "text": "Walking an org chart top-down or bottom-up"
      },
      {
        "icon": "🧾",
        "text": "Rendering nested folder structures"
      }
    ],
    "category": "Trees"
  },
  "Level-Order (BFS) Traversal": {
    "icon": "🏬",
    "title": "Announcing Floor by Floor",
    "sub": "Visiting a building one whole floor at a time before moving to the next",
    "blurb": "A fire warden clears a building floor by floor, not room-by-room down one staircase — every room on floor 1, then every room on floor 2. That's level-order traversal: visit every node at the current depth before going deeper.",
    "irl": [
      {
        "icon": "🏬",
        "text": "Floor-by-floor building announcements"
      },
      {
        "icon": "👥",
        "text": "\"Friends of friends\" social suggestions"
      }
    ],
    "category": "Trees"
  },
  "AVL Tree Rotations": {
    "icon": "⚖️",
    "title": "Rebalancing an Overloaded Bookshelf Ladder",
    "sub": "Shuffling shelves so no single side of the ladder gets too tall to reach",
    "blurb": "If one branch of a filing tree grows much taller than the other, lookups on that side get slow. A rotation quietly reshuffles a few folders so both sides stay roughly balanced — like re-distributing books so no shelf ladder leans dangerously to one side.",
    "irl": [
      {
        "icon": "⚖️",
        "text": "Keeping lookup structures balanced under load"
      }
    ],
    "category": "Trees"
  },
  "Trie Insert / Search": {
    "icon": "✍️",
    "title": "Autocomplete While Typing",
    "sub": "Each keystroke walks one level deeper into a tree of shared prefixes",
    "blurb": "When your phone suggests words as you type, it's walking a tree where every branch is one letter. \"CAR\" and \"CAT\" share the same first two branches and split at the third letter — so common prefixes are stored once, and autocomplete is just \"how far down can I still go\".",
    "irl": [
      {
        "icon": "✍️",
        "text": "Autocomplete / predictive text"
      },
      {
        "icon": "🌐",
        "text": "IP routing table lookups"
      }
    ],
    "category": "Trees"
  },
  "Lowest Common Ancestor": {
    "icon": "👪",
    "title": "Finding a Shared Ancestor on a Family Tree",
    "sub": "The closest relative that connects two people on a genealogy chart",
    "blurb": "Given two people on a family tree, their lowest common ancestor is the closest relative both descend from. It's the same question as \"what's the nearest shared manager of these two employees\" on an org chart.",
    "irl": [
      {
        "icon": "👪",
        "text": "Genealogy \"how are we related\" lookups"
      },
      {
        "icon": "🏢",
        "text": "Nearest shared manager in an org chart"
      }
    ],
    "category": "Trees"
  },
  "Heap Insert / Extract-Min": {
    "icon": "🚑",
    "title": "Hospital Triage Queue",
    "sub": "Whoever is most critical is always pulled next, regardless of arrival time",
    "blurb": "A triage nurse doesn't treat patients in the order they walked in — the most critical patient always gets pulled next, and every new arrival slots in based on severity, not queue position. That's a priority queue (min-heap) in action.",
    "irl": [
      {
        "icon": "🚑",
        "text": "ER triage ordering"
      },
      {
        "icon": "🖥️",
        "text": "OS process/task scheduling"
      }
    ],
    "category": "Heaps & Priority Queues"
  },
  "Build Heap (Heapify)": {
    "icon": "📋",
    "title": "Turning a Messy Sign-Up Sheet Into a Priority List",
    "sub": "Reorganising an unsorted list into valid priority order all at once",
    "blurb": "Instead of inserting patients one at a time into a triage queue, imagine getting a messy list of everyone already in the waiting room and needing to instantly reorganise it into valid priority order — that bulk reorganisation is heapify.",
    "irl": [
      {
        "icon": "📋",
        "text": "Bulk-loading an existing list into a priority queue"
      }
    ],
    "category": "Heaps & Priority Queues"
  },
  "K-th Largest Element": {
    "icon": "🏆",
    "title": "Finding the 3rd-Highest Bid",
    "sub": "Tracking only the top few candidates instead of ranking everyone",
    "blurb": "In an auction with thousands of bids, you don't need to fully sort every bid to know the 3rd highest — you just keep a small \"top 3 so far\" pool and swap the weakest one out whenever a stronger bid comes in.",
    "irl": [
      {
        "icon": "🏆",
        "text": "Leaderboards / top-N bids"
      }
    ],
    "category": "Heaps & Priority Queues"
  },
  "A* Search": {
    "icon": "🗺️",
    "title": "GPS Turn-by-Turn Navigation",
    "sub": "Finding the fastest route between two cities on a road network",
    "blurb": "Every road is a connection with a travel cost (distance or time). Starting from home, the algorithm keeps exploring the currently-cheapest-known road outward, updating \"fastest way there so far\" for each city it reaches, until it locks in the shortest path to work.",
    "irl": [
      {
        "icon": "🗺️",
        "text": "GPS / maps routing"
      },
      {
        "icon": "🎮",
        "text": "NPC pathfinding in games"
      },
      {
        "icon": "🚚",
        "text": "Delivery route planning"
      }
    ],
    "category": "Graphs"
  },
  "Breadth-First Search": {
    "icon": "👥",
    "title": "\"Friends of Friends\" on a Social Network",
    "sub": "Finding everyone within N connections of you, one ring at a time",
    "blurb": "To find everyone within \"2 degrees\" of you, you first list your direct friends, then their friends, expanding outward one full ring at a time rather than chasing one deep friend chain first. That ring-by-ring expansion is BFS, and it always finds the shortest connection first.",
    "irl": [
      {
        "icon": "👥",
        "text": "\"People you may know\" suggestions"
      },
      {
        "icon": "🧩",
        "text": "Shortest moves in a puzzle/maze"
      }
    ],
    "category": "Graphs"
  },
  "Depth-First Search": {
    "icon": "🌀",
    "title": "Solving a Maze by Committing to One Path",
    "sub": "Following a corridor as far as it goes, backtracking only when stuck",
    "blurb": "In a maze, DFS is the strategy of committing fully to one corridor, following it until you hit a dead end, and only then backing up to try the last unexplored branch — as opposed to exploring every nearby branch evenly like BFS does.",
    "irl": [
      {
        "icon": "🌀",
        "text": "Maze solving"
      },
      {
        "icon": "📁",
        "text": "Recursively walking a folder tree"
      }
    ],
    "category": "Graphs"
  },
  "Bellman-Ford": {
    "icon": "💱",
    "title": "Spotting Profitable Currency Exchange Loops",
    "sub": "Shortest paths that also tolerate \"costs\" that can go negative",
    "blurb": "Some routes have a cost that can effectively be negative — like a currency exchange chain that circles back for a profit. Bellman-Ford still finds shortest paths in that world, and as a bonus flags cycles where costs keep dropping forever (arbitrage).",
    "irl": [
      {
        "icon": "💱",
        "text": "Currency arbitrage detection"
      },
      {
        "icon": "🛣️",
        "text": "Routing with discounts/rebates as negative cost"
      }
    ],
    "category": "Graphs"
  },
  "Floyd-Warshall": {
    "icon": "🧮",
    "title": "Building a \"Distance Between Any Two Cities\" Table",
    "sub": "Precomputing every shortest route between every pair of cities at once",
    "blurb": "A road atlas's mileage chart shows the driving distance between every pair of cities, not just one route. Floyd-Warshall builds that entire table at once by checking, for every pair, whether routing through some middle city is a shortcut.",
    "irl": [
      {
        "icon": "🧮",
        "text": "All-pairs mileage charts"
      },
      {
        "icon": "🌐",
        "text": "Network latency tables between all servers"
      }
    ],
    "category": "Graphs"
  },
  "Topological Sort": {
    "icon": "👨‍🍳",
    "title": "Ordering Recipe Steps With Dependencies",
    "sub": "Sequencing tasks so nothing runs before what it depends on",
    "blurb": "You can't frost a cake before it's baked, and you can't bake it before the batter's mixed. Topological sort takes a web of \"must happen before\" rules and produces one valid order that respects every dependency — recipes, build systems, course prerequisites.",
    "irl": [
      {
        "icon": "👨‍🍳",
        "text": "Recipe / assembly step ordering"
      },
      {
        "icon": "🎓",
        "text": "Course prerequisite planning"
      },
      {
        "icon": "🛠️",
        "text": "Build system task ordering"
      }
    ],
    "category": "Graphs"
  },
  "Union-Find / Disjoint Set": {
    "icon": "👨‍👩‍👧",
    "title": "Tracking Which Friend Groups Have Merged",
    "sub": "Quickly answering \"are these two people in the same group?\" as groups combine",
    "blurb": "At a party, groups of friends mingle and merge over the night. Union-Find keeps track of who's in which cluster and can instantly answer \"are these two in the same group now?\" or merge two groups together, without re-scanning everyone.",
    "irl": [
      {
        "icon": "👨‍👩‍👧",
        "text": "Social circle / cluster merging"
      },
      {
        "icon": "🖼️",
        "text": "Detecting connected regions in an image"
      }
    ],
    "category": "Graphs"
  },
  "0/1 Knapsack": {
    "icon": "🧳",
    "title": "Packing a Weight-Limited Suitcase",
    "sub": "Choosing which items to bring for the most value without exceeding baggage limits",
    "blurb": "Airlines cap your baggage weight, but not every item is equally valuable to bring. The algorithm checks, item by item, whether including it (and bumping something else) beats leaving it out — building up the best possible combination for every possible weight limit along the way.",
    "irl": [
      {
        "icon": "🧳",
        "text": "Packing luggage under a weight limit"
      },
      {
        "icon": "💰",
        "text": "Budget-constrained project selection"
      }
    ],
    "category": "Dynamic Programming"
  },
  "Longest Common Subsequence": {
    "icon": "🧬",
    "title": "Comparing Two DNA Strands",
    "sub": "Finding the longest sequence both strands share, in order",
    "blurb": "Two DNA strands rarely match exactly, but they often share a long sub-pattern in the same relative order. LCS finds the longest such shared thread — the same technique powers \"track changes\" style diffing between two documents.",
    "irl": [
      {
        "icon": "🧬",
        "text": "DNA sequence comparison"
      },
      {
        "icon": "📝",
        "text": "Document diff / \"track changes\""
      }
    ],
    "category": "Dynamic Programming"
  },
  "Longest Increasing Subsequence": {
    "icon": "📈",
    "title": "Finding the Longest Winning Streak of Growth",
    "sub": "The longest run of values that keep increasing, skipping the dips",
    "blurb": "Given a stock's daily prices, LIS finds the longest stretch of days you could have picked (not necessarily consecutive) where the price kept climbing — useful for spotting the best underlying growth trend hidden inside noisy data.",
    "irl": [
      {
        "icon": "📈",
        "text": "Spotting growth trends in noisy data"
      }
    ],
    "category": "Dynamic Programming"
  },
  "Edit Distance": {
    "icon": "🔤",
    "title": "Spell-Checker Suggestions",
    "sub": "Counting the fewest edits to turn a typo into a real word",
    "blurb": "When you type \"recieve\", a spell-checker measures how many single-letter edits (insert, delete, substitute) it takes to turn your typo into \"receive\" versus every other candidate word, and suggests the one needing the fewest edits.",
    "irl": [
      {
        "icon": "🔤",
        "text": "Spell-check suggestions"
      },
      {
        "icon": "🧬",
        "text": "DNA mutation distance"
      }
    ],
    "category": "Dynamic Programming"
  },
  "Coin Change": {
    "icon": "🪙",
    "title": "Making Exact Change With Fewest Coins",
    "sub": "Choosing coin denominations to hit an amount using as few coins as possible",
    "blurb": "A cashier making change for $0.67 wants the fewest coins possible. Coin change DP works out, for every smaller amount along the way, the minimum coins needed — building up to the full amount instead of greedily guessing.",
    "irl": [
      {
        "icon": "🪙",
        "text": "Making change with minimum coins"
      },
      {
        "icon": "📦",
        "text": "Filling an order using fewest package sizes"
      }
    ],
    "category": "Dynamic Programming"
  },
  "Matrix Chain Multiplication": {
    "icon": "🏗️",
    "title": "Choosing the Cheapest Build Order for a Pipeline",
    "sub": "Grouping a chain of operations to minimize total work",
    "blurb": "Multiplying a chain of matrices in a different grouping order can be far cheaper computationally even though the result is identical — like choosing which sub-assemblies to build first on a factory line to minimize total effort.",
    "irl": [
      {
        "icon": "🏗️",
        "text": "Optimal computation/build ordering"
      }
    ],
    "category": "Dynamic Programming"
  },
  "Fibonacci (memoized)": {
    "icon": "🐇",
    "title": "Not Re-Solving a Question You Already Answered",
    "sub": "Caching answers to repeated sub-questions instead of recomputing them",
    "blurb": "Without memoization, computing Fibonacci recomputes the same smaller values over and over — like a group project where nobody checks if a teammate already finished a subtask. Caching each answer the first time avoids all that repeated work.",
    "irl": [
      {
        "icon": "🐇",
        "text": "Caching repeated sub-computations"
      },
      {
        "icon": "🌐",
        "text": "Web request/response caching"
      }
    ],
    "category": "Dynamic Programming"
  },
  "N-Queens": {
    "icon": "♛",
    "title": "Seating Guests With No Two in the Same Line of Sight",
    "sub": "Placing pieces one at a time, undoing a placement the moment it conflicts",
    "blurb": "You seat guests one at a time at a banquet table, making sure no two can see each other along a row, column, or diagonal sightline. The moment a new placement creates a conflict, you undo it and try the next seat — that's backtracking.",
    "irl": [
      {
        "icon": "♛",
        "text": "Constraint-based seating/scheduling"
      }
    ],
    "category": "Backtracking"
  },
  "Sudoku Solver": {
    "icon": "🔢",
    "title": "Filling a Sudoku Grid",
    "sub": "Trying a digit, undoing it the instant a row/column/box rule breaks",
    "blurb": "You place a candidate digit, and the moment it breaks a row, column, or box rule, you erase it and try the next digit — backing out of failed guesses instead of grinding forward blindly. That trial-and-undo loop is backtracking in its purest form.",
    "irl": [
      {
        "icon": "🔢",
        "text": "Sudoku / logic puzzle solving"
      }
    ],
    "category": "Backtracking"
  },
  "Permutations / Subsets": {
    "icon": "👕",
    "title": "Trying Every Outfit Combination",
    "sub": "Building every combination by adding/removing one item at a time",
    "blurb": "To list every possible outfit from a small wardrobe, you add one item, recurse into all combinations that include it, then remove it and recurse into all combinations without it — systematically generating every subset or ordering.",
    "irl": [
      {
        "icon": "👕",
        "text": "Enumerating outfit/combo options"
      },
      {
        "icon": "🧪",
        "text": "Testing all feature-flag combinations"
      }
    ],
    "category": "Backtracking"
  },
  "Rat in a Maze": {
    "icon": "🐀",
    "title": "A Mouse Exploring a Maze for Cheese",
    "sub": "Trying a direction, backing out the moment it's a dead end",
    "blurb": "A mouse tries a direction, and if it leads to a wall, it retraces its steps back to the last junction and tries a different direction — never repeating a dead-end path. That's literally the textbook framing backtracking is named after.",
    "irl": [
      {
        "icon": "🐀",
        "text": "Maze solving with dead-end recovery"
      }
    ],
    "category": "Backtracking"
  },
  "Activity Selection": {
    "icon": "📅",
    "title": "Booking the Most Meetings Into One Room",
    "sub": "Always picking the next meeting that ends soonest",
    "blurb": "You have one conference room and a pile of meeting requests with start/end times. Greedily always picking whichever remaining meeting ends soonest (and doesn't overlap what you've already booked) turns out to maximize the total meetings you can fit.",
    "irl": [
      {
        "icon": "📅",
        "text": "Meeting room scheduling"
      },
      {
        "icon": "🎬",
        "text": "Fitting the most movies into one screen's day"
      }
    ],
    "category": "Greedy"
  },
  "Huffman Coding": {
    "icon": "📡",
    "title": "Shrinking a Message for Cheaper Transmission",
    "sub": "Giving common letters shorter codes, rare letters longer ones",
    "blurb": "Morse code already does this intuitively: \"E\", the most common English letter, gets a single dot. Huffman coding formalizes that idea — build shorter binary codes for frequent characters and longer ones for rare characters, shrinking the average message size.",
    "irl": [
      {
        "icon": "📡",
        "text": "File/text compression (zip, image formats)"
      }
    ],
    "category": "Greedy"
  },
  "Fractional Knapsack": {
    "icon": "🛢️",
    "title": "Filling a Tanker With the Most Valuable Cargo per Litre",
    "sub": "Taking as much as possible of the highest value-per-unit cargo first",
    "blurb": "Unlike suitcase packing, here cargo can be split — think oil, grain, or fuel. You fill up on the highest value-per-litre cargo first, then the next best, topping off the tank exactly at its limit. Being able to take partial amounts is what makes the greedy approach provably optimal here.",
    "irl": [
      {
        "icon": "🛢️",
        "text": "Filling capacity with divisible high-value cargo"
      }
    ],
    "category": "Greedy"
  },
  "KMP Pattern Matching": {
    "icon": "🔎",
    "title": "\"Find\" in a Word Processor, Without Restarting From Scratch",
    "sub": "Reusing partial matches instead of re-scanning from the mismatch point",
    "blurb": "A naive text search restarts from scratch after every near-miss. KMP precomputes how much of a partial match can be reused, so a mismatch doesn't throw away everything you already confirmed — like Ctrl+F skipping redundant re-checking on a long document.",
    "irl": [
      {
        "icon": "🔎",
        "text": "Ctrl+F / find-in-document"
      },
      {
        "icon": "🧬",
        "text": "DNA motif searching"
      }
    ],
    "category": "Strings"
  },
  "Rabin-Karp": {
    "icon": "🎼",
    "title": "Detecting a Plagiarized Passage",
    "sub": "Comparing rolling \"fingerprints\" of text chunks instead of every character",
    "blurb": "Instead of comparing every character of a suspected copied passage, Rabin-Karp hashes a rolling window of the text into a quick \"fingerprint\" and only does a full character check when fingerprints match — much faster for scanning large documents.",
    "irl": [
      {
        "icon": "🎓",
        "text": "Plagiarism / duplicate content detection"
      }
    ],
    "category": "Strings"
  },
  "Z-Algorithm": {
    "icon": "🪞",
    "title": "Finding Every Place a Phrase Repeats",
    "sub": "Measuring, at every position, how far the text matches its own beginning",
    "blurb": "The Z-algorithm scans a string once and, at every position, records how long a match against the very start of the string extends — instantly revealing every repeated occurrence of the opening phrase without rechecking from scratch each time.",
    "irl": [
      {
        "icon": "🪞",
        "text": "Finding all repeats of a phrase in a document"
      }
    ],
    "category": "Strings"
  },
  "Longest Palindromic Substring": {
    "icon": "🔁",
    "title": "Finding the Longest Mirror-Image Word Inside Text",
    "sub": "Expanding outward from each center to find the longest symmetric stretch",
    "blurb": "From every possible center point in a string, you expand outward while the left and right characters still mirror each other, tracking the longest stretch that stays symmetric — like finding \"racecar\" hiding inside a longer sentence.",
    "irl": [
      {
        "icon": "🔁",
        "text": "Symmetric pattern detection in text/DNA"
      }
    ],
    "category": "Strings"
  },
  "Sieve of Eratosthenes": {
    "icon": "🎫",
    "title": "Crossing Out Non-Winning Raffle Numbers",
    "sub": "Eliminating every multiple of each number, leaving only primes standing",
    "blurb": "Starting from 2, cross out every multiple of it. Move to the next number left standing, cross out its multiples too, and keep going. Whatever numbers survive the entire process are exactly the primes — fast because you never test individual numbers one by one for primality.",
    "irl": [
      {
        "icon": "🔐",
        "text": "Generating primes for cryptographic keys"
      }
    ],
    "category": "Math & Bit Manipulation"
  },
  "GCD / LCM (Euclidean)": {
    "icon": "🍫",
    "title": "Cutting a Chocolate Bar Into Equal Squares With No Waste",
    "sub": "Finding the largest equal-size piece that divides two bar lengths evenly",
    "blurb": "Two chocolate bars of different lengths need to be cut into identical-size squares with nothing left over. The Euclidean algorithm finds the largest such square size by repeatedly trading the larger length for the remainder — the same trick used to simplify fractions.",
    "irl": [
      {
        "icon": "🍫",
        "text": "Simplifying ratios / fractions"
      },
      {
        "icon": "⏱️",
        "text": "Finding a common repeating interval for events"
      }
    ],
    "category": "Math & Bit Manipulation"
  },
  "Fast Exponentiation": {
    "icon": "🦠",
    "title": "Modeling Rapid Population Doubling",
    "sub": "Computing huge powers by repeatedly squaring instead of repeated multiplying",
    "blurb": "Multiplying a number by itself 1,000 times one step at a time is slow. Fast exponentiation instead squares the running result and halves the exponent each round, reaching huge powers (like population doubling forecasts, or cryptographic keys) in a fraction of the steps.",
    "irl": [
      {
        "icon": "🔐",
        "text": "Modular exponentiation in cryptography (RSA)"
      }
    ],
    "category": "Math & Bit Manipulation"
  },
  "Bit Manipulation Basics": {
    "icon": "🚦",
    "title": "Toggling a Bank of Light Switches",
    "sub": "Flipping, checking, or masking individual switches in a row using flags",
    "blurb": "A row of on/off switches (bits) can represent settings compactly — like feature flags for a product, where each bit toggles one feature on or off independently, and bitwise operations flip or check any switch instantly without touching the others.",
    "irl": [
      {
        "icon": "🚦",
        "text": "Feature flags / permission flags"
      },
      {
        "icon": "🎨",
        "text": "Packing RGB color channels into one number"
      }
    ],
    "category": "Math & Bit Manipulation"
  },
  "Selection Sort": {
    "icon": "🛒",
    "title": "Picking the Lightest Item First",
    "sub": "Scan the remaining shelf, choose the lightest item, and place it next in the cart",
    "blurb": "Imagine arranging groceries from lightest to heaviest. For each open spot, you scan everything still unsorted, pick the lightest remaining item, and move it into that spot. Selection sort repeats exactly that choose-the-best-remaining-item routine.",
    "irl": [
      { "icon": "🛒", "text": "Ordering a small set of items by weight" },
      { "icon": "🥇", "text": "Repeatedly selecting the next-best candidate" }
    ],
    "category": "Sorting"
  },
  "Cycle Detection (Floyd's)": {
    "icon": "🏃",
    "title": "Two Runners on a Circular Track",
    "sub": "A fast runner eventually catches a slow runner only when the route loops",
    "blurb": "Put two runners on the same route: one moves one checkpoint at a time, the other moves two. On a route that eventually ends they never meet again, but on a circular route the faster runner must eventually catch the slower one. That is Floyd's cycle-detection idea.",
    "irl": [
      { "icon": "🏃", "text": "Detecting a loop in a repeated route" },
      { "icon": "🔁", "text": "Finding recurring workflow states" }
    ],
    "category": "Linked Lists"
  },
  "Dijkstra's Shortest Path": {
    "icon": "🚗",
    "title": "Finding the Fastest Drive Across Town",
    "sub": "Always expand the closest place whose best travel time is already known",
    "blurb": "A navigation app starts at home and keeps a best-known travel time to every nearby place. It permanently settles the closest unfinished place, then checks whether going through it creates a faster route to its neighbours. Repeating that process gives the shortest route when all road costs are non-negative.",
    "irl": [
      { "icon": "🚗", "text": "GPS shortest-route planning" },
      { "icon": "📦", "text": "Cheapest delivery path through a network" }
    ],
    "category": "Graphs"
  },
  "Kruskal's MST": {
    "icon": "🛣️",
    "title": "Connecting Villages With the Cheapest Roads",
    "sub": "Consider roads from cheapest upward, skipping any that only create a loop",
    "blurb": "Suppose every possible road between villages has a construction cost. Start with the cheapest road in the whole region and keep adding the next-cheapest road whenever it connects two groups that were previously separate. Skip roads that merely make a cycle. The result connects everyone for minimum total cost.",
    "irl": [
      { "icon": "🛣️", "text": "Low-cost road or cable planning" },
      { "icon": "🌐", "text": "Building a minimum-cost backbone network" }
    ],
    "category": "Graphs"
  },
  "Prim's MST": {
    "icon": "⚡",
    "title": "Growing a Power Grid One Cheap Link at a Time",
    "sub": "Start from one town and repeatedly attach the cheapest new town reachable from the grid",
    "blurb": "A utility company begins with one powered town. At each step it looks only at connections leaving the already-powered region and chooses the cheapest one that reaches a new town. The grid grows outward until every town is connected with minimum total cable cost.",
    "irl": [
      { "icon": "⚡", "text": "Expanding an electricity or fiber network" },
      { "icon": "🏘️", "text": "Connecting sites with minimum infrastructure" }
    ],
    "category": "Graphs"
  }
}

const CATEGORY_FALLBACKS: Record<string, ScenarioDefinition> = {
  "Sorting": {
    "icon": "📦",
    "title": "Sorting a Delivery Queue",
    "sub": "Putting everyday items into a useful order",
    "blurb": "Imagine a loading area where items need to be arranged before they can move on. The algorithm decides which items to compare, move, or lock into place.",
    "irl": [
      {
        "icon": "📦",
        "text": "Warehouse loading order"
      },
      {
        "icon": "🧾",
        "text": "Ordering receipts or scores"
      }
    ]
  },
  "Searching": {
    "icon": "🔎",
    "title": "Finding One Item in Everyday Records",
    "sub": "Narrowing down where the thing you need could be",
    "blurb": "Instead of thinking about indexes, imagine looking for one real item in a shelf, directory, or bag. Each step shows where the search is looking next.",
    "irl": [
      {
        "icon": "📖",
        "text": "Dictionary lookup"
      },
      {
        "icon": "🎒",
        "text": "Finding an item in a bag"
      }
    ]
  },
  "Linked Lists": {
    "icon": "🚂",
    "title": "Following Connected Train Cars",
    "sub": "Each item only knows what comes next",
    "blurb": "Think of the data as train cars coupled one after another. Pointer changes become coupling changes, so you can watch the chain reconnect in real terms.",
    "irl": [
      {
        "icon": "🚂",
        "text": "Train-car couplings"
      }
    ]
  },
  "Trees": {
    "icon": "🏢",
    "title": "Walking a Company Org Chart",
    "sub": "Following parent-to-child reporting relationships",
    "blurb": "Tree operations become a tour through an organisation chart: start from the top, choose a branch, and visit the relevant people or teams.",
    "irl": [
      {
        "icon": "🏢",
        "text": "Organisation hierarchy"
      },
      {
        "icon": "🗂️",
        "text": "Folder navigation"
      }
    ]
  },
  "Heaps & Priority Queues": {
    "icon": "🚑",
    "title": "Hospital Triage Queue",
    "sub": "The most urgent case should be handled first",
    "blurb": "Priority-queue operations are shown like a triage desk, where urgency determines who is served next rather than simple arrival order.",
    "irl": [
      {
        "icon": "🚑",
        "text": "Emergency-room triage"
      }
    ]
  },
  "Graphs": {
    "icon": "🗺️",
    "title": "Planning a Route Through a City",
    "sub": "Exploring connected places until the best route is known",
    "blurb": "Nodes become real places and edges become roads or connections. The algorithm explores options, updates better routes, and eventually confirms a path.",
    "irl": [
      {
        "icon": "🚚",
        "text": "Delivery routing"
      },
      {
        "icon": "👥",
        "text": "Social connections"
      }
    ]
  },
  "Dynamic Programming": {
    "icon": "🎒",
    "title": "Making the Best Choice Under Constraints",
    "sub": "Reusing earlier answers instead of solving the same choice again",
    "blurb": "Dynamic programming is shown as a practical planning problem: keep useful answers from smaller decisions, then build the best overall result from them.",
    "irl": [
      {
        "icon": "🎒",
        "text": "Packing and budgeting"
      },
      {
        "icon": "🪙",
        "text": "Making exact change"
      }
    ]
  },
  "Backtracking": {
    "icon": "🧩",
    "title": "Trying Choices and Undoing Dead Ends",
    "sub": "Make a choice, check it, and back out when it fails",
    "blurb": "Backtracking behaves like solving a puzzle: try one option, keep it if it works, and undo it as soon as it blocks the goal.",
    "irl": [
      {
        "icon": "🔢",
        "text": "Sudoku solving"
      },
      {
        "icon": "🐀",
        "text": "Maze exploration"
      }
    ]
  },
  "Greedy": {
    "icon": "📅",
    "title": "Choosing the Best Immediate Option",
    "sub": "Take the locally best choice and continue",
    "blurb": "Greedy algorithms become everyday scheduling and packing decisions where the best available next choice is selected immediately.",
    "irl": [
      {
        "icon": "📅",
        "text": "Meeting scheduling"
      },
      {
        "icon": "🛢️",
        "text": "Loading valuable cargo"
      }
    ]
  },
  "Strings": {
    "icon": "🔎",
    "title": "Finding Patterns Inside Text",
    "sub": "Reusing what is already known about previous characters",
    "blurb": "String algorithms are shown like search, typing, and document-matching tools rather than raw character indexes.",
    "irl": [
      {
        "icon": "🔎",
        "text": "Find in document"
      },
      {
        "icon": "✍️",
        "text": "Autocomplete and text matching"
      }
    ]
  },
  "Math & Bit Manipulation": {
    "icon": "🚦",
    "title": "Solving Repeating Everyday Number Patterns",
    "sub": "Use compact rules instead of repeating the same work",
    "blurb": "Number and bit operations become switches, repeated intervals, grouping, and other concrete patterns you can recognize outside code.",
    "irl": [
      {
        "icon": "🚦",
        "text": "Feature switches"
      },
      {
        "icon": "🍫",
        "text": "Equal-size grouping"
      }
    ]
  }
}

const CODE_SCENARIO_HINTS: [RegExp, string][] = [
  [/\bbubble[_\s-]?sort\b/i, 'Bubble Sort'],
  [/\binsertion[_\s-]?sort\b/i, 'Insertion Sort'],
  [/\bselection[_\s-]?sort\b/i, 'Selection Sort'],
  [/\bmerge[_\s-]?sort\b/i, 'Merge Sort'],
  [/\bquick[_\s-]?sort\b/i, 'Quick Sort'],
  [/\bheap[_\s-]?sort\b/i, 'Heap Sort'],
  [/\bbinary[_\s-]?search\b/i, 'Binary Search'],
  [/\blinear[_\s-]?search\b/i, 'Linear Search'],
  [/\bdijkstra\b/i, "Dijkstra's Shortest Path"],
  [/\b(?:floyd.{0,3}cycle|tortoise.{0,3}hare)\b/i, "Cycle Detection (Floyd's)"],
  [/\bkruskal\b/i, "Kruskal's MST"],
  [/\bprim(?:'s)?\b/i, "Prim's MST"],
  [/\bbreadth[_\s-]?first|\bbfs\b/i, 'Breadth-First Search'],
  [/\bdepth[_\s-]?first|\bdfs\b/i, 'Depth-First Search'],
  [/\bknapsack\b/i, '0/1 Knapsack'],
  [/\bfibonacci\b/i, 'Fibonacci (memoized)'],
  [/\bkmp\b|knuth.{0,3}morris.{0,3}pratt/i, 'KMP Pattern Matching'],
]

export function inferScenarioName(code: string): string | undefined {
  for (const [pattern, name] of CODE_SCENARIO_HINTS) {
    if (pattern.test(code)) return name
  }
  return undefined
}

export function inferScenarioCategory(code: string): string | undefined {
  if (/\b(?:bubble|insertion|selection|merge|quick|heap)[_\s-]?sort\b/i.test(code)) return 'Sorting'
  if (/\b(?:binary|linear|ternary)[_\s-]?search\b/i.test(code)) return 'Searching'
  if (/\bdijkstra\b|\bkruskal\b|\bprim(?:'s)?\b|\bbreadth[_\s-]?first\b|\bdepth[_\s-]?first\b|\bbfs\b|\bdfs\b/i.test(code)) return 'Graphs'
  if (/\bfloyd.{0,3}cycle\b|tortoise.{0,3}hare/i.test(code)) return 'Linked Lists'
  if (/\bknapsack\b|\bfibonacci\b/i.test(code)) return 'Dynamic Programming'
  if (/\bkmp\b|knuth.{0,3}morris.{0,3}pratt/i.test(code)) return 'Strings'
  return undefined
}

export function getScenario(name?: string, category?: string): ScenarioDefinition {
  if (name && SCENARIOS[name]) return SCENARIOS[name]
  if (category && CATEGORY_FALLBACKS[category]) return CATEGORY_FALLBACKS[category]
  return {
    icon: '🌍',
    title: 'Everyday Scenario',
    sub: 'Watch the same algorithm through a real-world story',
    blurb: 'The underlying steps are unchanged; only the way they are explained and drawn is translated into familiar objects and actions.',
    irl: [{ icon: '🧠', text: 'Connect code steps to a familiar situation' }],
  }
}
