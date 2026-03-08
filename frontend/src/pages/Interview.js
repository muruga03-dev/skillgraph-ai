import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const ROUNDS = [
  {
    id: "aptitude", label: "Aptitude", icon: "🧮",
    questions: [
      { q: "A train 120m long passes a pole in 12 seconds. What is the speed?", a: "Speed = 120/12 = 10 m/s = 36 km/h", type: "quantitative" },
      { q: "If 6 men can complete a work in 12 days, how many days will 9 men take?", a: "6×12 = 9×x → x = 72/9 = 8 days", type: "work" },
      { q: "A can do a job in 10 days and B in 15 days. Together, how many days?", a: "Together: 1/10 + 1/15 = 5/30 = 1/6 → 6 days", type: "work" },
      { q: "What is 15% of 240?", a: "15/100 × 240 = 36", type: "percentage" },
      { q: "Find compound interest on ₹10,000 at 10% for 2 years compounded annually.", a: "CI = 10000(1+0.1)² − 10000 = 12100 − 10000 = ₹2100", type: "interest" },
      { q: "A shopkeeper marks up goods by 30% and gives 10% discount. Profit%?", a: "Profit% = (1.3×0.9 − 1)×100 = 17%", type: "profit" },
      { q: "Two pipes fill a tank in 12h and 15h. Together, how long?", a: "1/12 + 1/15 = 9/60 = 3/20 → 20/3 ≈ 6.67 hours", type: "pipes" },
      { q: "Speed of boat in still water 8 km/h, stream 2 km/h. Upstream speed?", a: "Upstream = 8 − 2 = 6 km/h", type: "boats" },
      { q: "In how many ways can 4 books be arranged on a shelf?", a: "4! = 24 ways", type: "permutation" },
      { q: "Sum of first 20 odd numbers?", a: "Sum of first n odd numbers = n² = 20² = 400", type: "series" },
    ]
  },
  {
    id: "technical", label: "Technical", icon: "💻",
    questions: [
      { q: "What is the difference between == and === in JavaScript?", a: "== checks value with type coercion (1 == '1' is true). === checks value AND type (1 === '1' is false). Always prefer ===.", type: "JavaScript" },
      { q: "Explain closure in JavaScript with an example.", a: "A closure is a function that remembers its outer scope even after the outer function has returned.\n\nExample:\nfunction counter() {\n  let count = 0;\n  return function() { return ++count; };\n}\nconst c = counter();\nc(); // 1, c(); // 2", type: "JavaScript" },
      { q: "What is Event Loop in JavaScript?", a: "The Event Loop allows JS (single-threaded) to handle async operations. It continuously checks the Call Stack. If empty, it pushes callbacks from the Task Queue (setTimeout, etc.) or Microtask Queue (Promises) to the stack.", type: "JavaScript" },
      { q: "Explain Python's GIL (Global Interpreter Lock).", a: "The GIL is a mutex that allows only one thread to execute Python bytecode at a time. It prevents race conditions in CPython but limits multi-core performance for CPU-bound tasks. Use multiprocessing for CPU-bound parallelism.", type: "Python" },
      { q: "What is a list comprehension in Python?", a: "A concise way to create lists:\n[x**2 for x in range(10) if x%2==0]\nOutputs: [0, 4, 16, 36, 64]", type: "Python" },
      { q: "Explain React's Virtual DOM.", a: "React creates a lightweight JS object copy (Virtual DOM) of the actual DOM. On state changes, React diffs the new virtual DOM with the old one (reconciliation), and only updates changed parts in the real DOM — making updates fast.", type: "React" },
      { q: "What are React hooks? Name 5 built-in hooks.", a: "Hooks let functional components use state and lifecycle. Built-in hooks: useState, useEffect, useContext, useRef, useMemo, useCallback, useReducer, useLayoutEffect.", type: "React" },
      { q: "Explain REST vs GraphQL.", a: "REST: Multiple endpoints, over/under-fetching possible, simpler caching.\nGraphQL: Single endpoint, client specifies exact data needed, strongly typed schema, ideal for complex/nested data needs.", type: "API" },
      { q: "What is ACID in databases?", a: "Atomicity: Transaction fully succeeds or fully fails.\nConsistency: DB always stays in valid state.\nIsolation: Concurrent transactions don't interfere.\nDurability: Committed data persists even after crash.", type: "Database" },
      { q: "Difference between SQL and NoSQL databases?", a: "SQL: Structured (tables), ACID compliant, fixed schema (MySQL, PostgreSQL). Good for complex queries.\nNoSQL: Flexible schema, horizontal scaling, various data models (MongoDB, Redis, Cassandra). Good for unstructured/high-volume data.", type: "Database" },
    ]
  },
  {
    id: "dsa", label: "DSA", icon: "🔢",
    questions: [
      { q: "What is Big O notation? Explain O(1), O(n), O(n²).", a: "Big O describes algorithm time/space complexity in worst case.\nO(1): Constant — array access by index.\nO(n): Linear — loop through n elements.\nO(n²): Quadratic — nested loops (bubble sort).\nO(log n): Logarithmic — binary search.\nO(n log n): Linearithmic — merge sort.", type: "Theory" },
      { q: "Implement Binary Search in Python.", a: "def binary_search(arr, target):\n    lo, hi = 0, len(arr)-1\n    while lo <= hi:\n        mid = (lo+hi)//2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: lo = mid+1\n        else: hi = mid-1\n    return -1\n\nTime: O(log n), Space: O(1)", type: "Searching" },
      { q: "Explain how a Hash Map works internally.", a: "A hash map uses a hash function to convert keys to bucket indices. Collisions are handled via chaining (linked lists at each bucket) or open addressing. Average case: O(1) for get/put. Worst case O(n) if all keys collide.", type: "Data Structures" },
      { q: "What is dynamic programming? Solve Fibonacci with DP.", a: "DP solves problems by storing subproblem results (memoization/tabulation).\n\n# Tabulation O(n):\ndp = [0]*(n+1)\ndp[1] = 1\nfor i in range(2,n+1):\n    dp[i] = dp[i-1]+dp[i-2]\nreturn dp[n]", type: "DP" },
      { q: "Explain BFS vs DFS graph traversal.", a: "BFS (Breadth-First): Uses queue, explores level-by-level. Best for shortest path in unweighted graphs. O(V+E).\n\nDFS (Depth-First): Uses stack/recursion, explores as deep as possible before backtracking. Best for topological sort, cycle detection. O(V+E).", type: "Graphs" },
      { q: "What is a Linked List? Implement reversal.", a: "A Linked List is a chain of nodes where each node has data and a pointer to next.\n\ndef reverse(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev", type: "Linked List" },
      { q: "Solve Two Sum problem (LeetCode #1).", a: "Given nums and target, return indices of two numbers that add to target.\n\ndef two_sum(nums, target):\n    seen = {}  # val -> index\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n\nTime: O(n), Space: O(n)", type: "Arrays" },
      { q: "What is a Min-Heap? What is its time complexity for insert/extract?", a: "A Min-Heap is a complete binary tree where each parent ≤ children. Root is always the minimum.\n\nInsert: O(log n) — add at end, bubble up.\nExtract Min: O(log n) — remove root, replace with last, bubble down.\nBuild Heap: O(n).\nUsed in: Priority queues, Dijkstra's algorithm, Kth smallest.", type: "Heap" },
    ]
  },
  {
    id: "hr", label: "HR", icon: "🤝",
    questions: [
      { q: "Tell me about yourself.", a: "Structure: Present → Past → Future.\n\n'I'm a final-year CS student at [college]. I have strong skills in React, Python, and Node.js, which I've applied in 3 major projects including a full-stack ML career platform. Previously I completed an internship at [company] where I improved API response time by 40%. I'm looking for a full-time role where I can build impactful products at scale.'\n\nTip: Keep it 90 seconds. Tie your background to the role.", type: "Introduction" },
      { q: "Why do you want to work at our company?", a: "Research the company first! Structure:\n1. What you admire about the company (specific product, culture, mission)\n2. How your skills align with their work\n3. What you hope to contribute\n\nExample: 'I've admired Razorpay's developer-first approach to payments. I want to work on infrastructure that millions of businesses depend on, and my Node.js and system design skills align directly with your backend challenges.'", type: "Motivation" },
      { q: "Describe a challenge you overcame. (STAR Method)", a: "STAR: Situation → Task → Action → Result\n\nSituation: Final year project had a critical ML model accuracy issue 2 weeks before deadline.\nTask: I needed to improve accuracy from 67% to 80%+.\nAction: I researched feature engineering, tried 4 different algorithms, added cross-validation.\nResult: Achieved 84% accuracy, project got highest marks in class.", type: "Behavioral" },
      { q: "Where do you see yourself in 5 years?", a: "Be realistic and company-aligned:\n\n'In 2 years, I aim to be a confident full-stack developer contributing to meaningful product features. By year 5, I see myself in a senior role, possibly leading a small team or owning a product module. I'm excited about growing my system design and architecture skills over time.'\n\nAvoid: 'In your role' or 'Starting my own company'.", type: "Career Goals" },
      { q: "What is your greatest weakness?", a: "Pick a real weakness, show self-awareness and growth:\n\n'I used to struggle with perfectionism — spending too long on a feature trying to make it perfect. I've been actively working on this by time-boxing tasks and reminding myself that shipping something good is better than delaying for perfect. I've improved significantly over the last year.'\n\nAvoid: 'I work too hard' or clichéd non-answers.", type: "Self-Awareness" },
      { q: "Tell me about a time you worked in a team.", a: "Use STAR. Focus on your role, communication, and outcome:\n\n'During my hackathon project, our team of 4 had a disagreement about the tech stack. I organized a quick discussion where each person presented their case with trade-offs. We chose React + FastAPI and I took ownership of the backend API. We built the MVP in 24 hours and won 2nd place. I learned that structured discussion saves time.'\n\nKey: Show collaboration, not just individual work.", type: "Teamwork" },
      { q: "Do you have any questions for us?", a: "Always say yes! Ask 2-3 thoughtful questions:\n\n1. 'What does the onboarding process look like for new engineers?'\n2. 'What does success look like in the first 6 months for this role?'\n3. 'What's the biggest technical challenge the team is working on right now?'\n4. 'How does the engineering team handle code reviews and mentorship?'\n\nAvoid: Salary/leave questions in first round.", type: "Closing" },
      { q: "How do you handle pressure and tight deadlines?", a: "Structure: Acknowledge → Method → Example\n\n'I actually perform well under pressure when I have a clear plan. I break the work into smaller tasks, prioritize by impact, and communicate proactively if timelines are at risk.\n\nFor example, during exams + project season, I made a 2-week sprint plan, eliminated non-essential tasks, and delivered the project on time while scoring well in exams. Pressure helps me focus.'\n\nKey: Show method + real example.", type: "Behavioral" },
    ]
  },
  {
    id: "system", label: "System Design", icon: "🏗️",
    questions: [
      { q: "Design a URL Shortener (like bit.ly)", a: "Requirements: Shorten URLs, redirect, analytics.\n\nComponents:\n• API: POST /shorten → returns short code\n• DB: URLs table (id, short_code, original_url, created_at, clicks)\n• Cache (Redis): short_code → original_url for fast lookups\n• Short code: Base62 encoding of auto-increment ID\n\nScale: 100M URLs, 1B redirects/day:\n• Read-heavy → Redis cache (cache hit rate 99%)\n• Consistent hashing for distributed cache\n• CDN at edge for global low-latency", type: "Design" },
      { q: "Design Twitter's Feed (News Feed System)", a: "Requirements: Post tweets, follow users, see feed.\n\nApproach — Fan-out on Write (Push Model):\n• When user tweets, push to all followers' feed cache\n• Good for users with < 1M followers\n\nApproach — Fan-out on Read (Pull Model):\n• On feed load, fetch from followed users\n• Good for celebrity accounts (millions of followers)\n\nHybrid (Twitter's actual approach):\n• Push for regular users, pull for celebrities\n• Cache: Redis sorted set per user (score = timestamp)\n• DB: Cassandra for tweets (write-heavy)", type: "Design" },
      { q: "Design WhatsApp Messaging", a: "Requirements: 1-1 chat, group chat, message delivery, read receipts.\n\nComponents:\n• WebSocket servers for real-time connections\n• Message Queue (Kafka): decouple send from deliver\n• Message DB: Cassandra (high write throughput)\n• Presence service: Redis (online status)\n• Push notification service for offline users\n\nMessage flow:\nUser A sends → WebSocket Server → Kafka → Message Server → Cassandra → deliver to User B via WebSocket or push notification\n\nScale: 65B messages/day, E2E encryption", type: "Design" },
      { q: "Design a Rate Limiter", a: "Algorithms:\n1. Token Bucket: Tokens added at fixed rate. Request consumes token. Allows bursts.\n2. Fixed Window Counter: Count per time window. Simple but boundary problem.\n3. Sliding Window Log: Accurate but memory-heavy.\n4. Sliding Window Counter: Best accuracy/performance balance.\n\nImplementation:\n• Redis + Lua scripts for atomic operations\n• Key: user_id:timestamp_bucket\n• Middleware: check limit before processing request\n\nDistributed: Use Redis cluster, accept slight inaccuracy for performance", type: "Design" },
      { q: "Design Netflix Video Streaming", a: "Requirements: Upload videos, transcode, stream globally with low latency.\n\nComponents:\n• Upload Service: S3 for raw video storage\n• Transcoding: Convert to multiple resolutions (480p, 720p, 1080p, 4K) using worker clusters\n• CDN (Netflix Open Connect): Cache popular content at ISP level globally\n• Adaptive Bitrate Streaming (ABR): Client adjusts quality based on bandwidth\n• Metadata DB: PostgreSQL for video info\n• Recommendation: ML service\n\nScale: 15% of global internet traffic at peak. CDN serves 95% of traffic.", type: "Design" },
    ]
  },
];

export default function Interview() {
  const { user } = useAuth();
  const [activeRound, setActiveRound] = useState(0);
  const [revealed, setRevealed] = useState({});
  const [skills] = useState(user?.skills || ["JavaScript", "Python", "React"]);

  const toggle = (key) => setRevealed(r => ({ ...r, [key]: !r[key] }));
  const round = ROUNDS[activeRound];

  const total = ROUNDS.reduce((s, r) => s + r.questions.length, 0);
  const seen = Object.keys(revealed).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar/>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom: ".4rem" }}>💼 Interview Preparation</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem", fontSize: ".9rem" }}>
          5 complete interview rounds with answers. Click any question to reveal the answer.
        </p>

        {/* Progress */}
        <div className="sg-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(56,226,154,.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}>
            <span style={{ fontWeight: 600 }}>Practice Progress</span>
            <span style={{ color: "var(--green)", fontWeight: 700 }}>{seen}/{total} reviewed</span>
          </div>
          <div className="sg-progress"><div className="sg-bar" style={{ width: `${(seen / total) * 100}%` }} /></div>
        </div>

        {/* Round tabs */}
        <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {ROUNDS.map((r, i) => (
            <button key={r.id} onClick={() => setActiveRound(i)} style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".5rem 1rem", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: ".85rem", transition: "all .2s",
              background: activeRound === i ? "linear-gradient(135deg,var(--blue),#6c63ff)" : "var(--bg3)",
              color: activeRound === i ? "#fff" : "var(--muted)",
              border: activeRound === i ? "none" : "1px solid var(--border)" }}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div style={{ display: "grid", gap: ".8rem" }}>
          {round.questions.map((q, i) => {
            const key = `${round.id}-${i}`;
            const open = revealed[key];
            return (
              <div key={i} className="sg-card" style={{ borderColor: open ? "rgba(61,142,240,.3)" : "var(--border)", cursor: "pointer" }}
                onClick={() => toggle(key)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", flexWrap: "wrap" }}>
                      <span style={{ background: "var(--bg3)", color: "var(--blue)", border: "1px solid var(--border)", borderRadius: 6, padding: ".1rem .5rem", fontSize: ".72rem", fontWeight: 600 }}>Q{i + 1}</span>
                      {q.type && <span style={{ background: "rgba(159,122,234,.1)", color: "var(--purple)", border: "1px solid rgba(159,122,234,.3)", borderRadius: 6, padding: ".1rem .5rem", fontSize: ".72rem" }}>{q.type}</span>}
                    </div>
                    <p style={{ fontWeight: 600, lineHeight: 1.5, marginBottom: open ? "1rem" : 0 }}>{q.q}</p>
                    {open && (
                      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem", marginTop: ".5rem" }}>
                        <p style={{ color: "var(--green)", fontSize: ".75rem", fontWeight: 600, marginBottom: ".5rem" }}>✅ ANSWER / EXPLANATION</p>
                        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Space Grotesk',sans-serif", fontSize: ".85rem", lineHeight: 1.7, color: "var(--muted)", margin: 0 }}>{q.a}</pre>
                      </div>
                    )}
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: "1.2rem", flexShrink: 0, marginTop: 4 }}>{open ? "▲" : "▼"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
