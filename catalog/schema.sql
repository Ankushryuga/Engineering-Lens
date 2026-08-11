-- ── Algorithm template catalog schema ────────────────────────────────────────
-- See requirement_doc.md §3.6/§3.7 for the design rationale: every entry is a
-- canonical, team-authored implementation — no third-party platform in the
-- loop, no scraping, no ToS exposure.

CREATE TABLE IF NOT EXISTS templates (
    id               SERIAL PRIMARY KEY,
    name             TEXT NOT NULL,
    category         TEXT NOT NULL,
    difficulty       TEXT NOT NULL CHECK (difficulty IN ('Fundamental', 'Intermediate', 'Advanced')),
    time_complexity  TEXT NOT NULL,
    space_complexity TEXT NOT NULL,
    -- Selects which frontend visualization component renders this
    -- algorithm's steps[] trace:
    --   "array"       — bar-chart step player (default, sorting/searching)
    --   "graph"       — node/edge graph view with distances and
    --                   shortest-path highlighting (BFS/DFS/Dijkstra/etc.)
    --   "tree"        — hierarchical node/edge tree view with traversal
    --                   order and path highlighting
    --   "linked_list" — horizontal chain-of-nodes view with pointer
    --                   markers, pointer rewiring, and multi-list merges
    render_type      TEXT NOT NULL DEFAULT 'array' CHECK (render_type IN ('array', 'graph', 'tree', 'linked_list')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_difficulty ON templates(difficulty);

CREATE TABLE IF NOT EXISTS template_solutions (
    id          SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    language    TEXT NOT NULL CHECK (language IN ('python', 'go')),
    code        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (template_id, language)
);

CREATE INDEX IF NOT EXISTS idx_template_solutions_template_id ON template_solutions(template_id);
