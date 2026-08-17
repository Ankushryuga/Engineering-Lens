"""
tracer.py — Instruments and executes untrusted Python code, emitting a
normalized steps[] trace compatible with the Engineering Lens frontend.

Approach (documented trade-off, see requirement_doc.md §3.2 / §3.8):
  We use sys.settrace() to observe line execution and local variable state.
  Rather than requiring the user to call record_step() themselves, we take a
  heuristic approach suited to array-based algorithms (sorting/searching):

    1. Find the "subject" array — the first list-of-numbers argument passed
       into the outermost user-defined function call (or, failing that, the
       first list-of-numbers found in any frame's locals).
    2. On each 'line' trace event, snapshot the subject array *before* the
       line executes. If the source line contains an indexing comparison
       (e.g. `arr[j] > arr[j+1]`), emit a "compare" step with the resolved
       indices (evaluated against the current frame's locals/globals).
    3. On the *next* line event, diff the array against the previous
       snapshot. Two elements changed → "swap"; one element changed → "set".
    4. When the top-level call returns, emit a final "done" step.

This is intentionally simple: it correctly visualizes idiomatic
comparison-swap style sorting/searching code (bubble/insertion/selection
sort, linear/binary search, etc.) without requiring any code changes from
the user. It does not attempt full symbolic execution.
"""

import sys
import re
import json
import types
from typing import Any, Optional


INDEX_RE_TEMPLATE = r"{name}\s*\[\s*([^\]]+?)\s*\]"


class Tracer:
    def __init__(self, source_lines: list[str]):
        self.source_lines = source_lines
        self.steps: list[dict[str, Any]] = []
        self.fallback_steps: list[dict[str, Any]] = []
        self.subject_name: Optional[str] = None
        self.prev_snapshot: Optional[list] = None
        self.pending_compare_line: Optional[int] = None
        self.max_steps = 2000  # hard cap to avoid runaway traces

    # ── Helpers ────────────────────────────────────────────────────────────

    def _find_subject_array(self, frame: types.FrameType) -> Optional[str]:
        """Pick the first local variable that looks like a numeric list."""
        for name, val in frame.f_locals.items():
            if isinstance(val, list) and all(
                isinstance(x, (int, float)) for x in val
            ):
                return name
        return None

    def _snapshot(self, frame: types.FrameType) -> Optional[list]:
        if not self.subject_name:
            return None
        val = frame.f_locals.get(self.subject_name)
        if isinstance(val, list):
            return list(val)
        return None

    def _resolve_indices(self, line: str, frame: types.FrameType) -> list[int]:
        """Find `subject[expr]` occurrences in the line and evaluate expr."""
        if not self.subject_name:
            return []
        pattern = INDEX_RE_TEMPLATE.format(name=re.escape(self.subject_name))
        indices = []
        for m in re.finditer(pattern, line):
            expr = m.group(1)
            try:
                idx = eval(expr, frame.f_globals, frame.f_locals)  # noqa: S307
                if isinstance(idx, int):
                    indices.append(idx)
            except Exception:
                continue
        return indices

    def _emit(self, step: dict[str, Any]):
        if len(self.steps) < self.max_steps:
            self.steps.append(step)

    def _diff_and_emit_mutation(self, before: list, after: list, line_no: int):
        if before is None or after is None:
            return
        if len(before) != len(after):
            self._emit({
                "type": "set",
                "indices": [max(len(after) - 1, 0)] if after else [],
                "array": after,
                "line": line_no,
                "info": f"list size changed from {len(before)} to {len(after)}",
            })
            return
        changed = [i for i in range(len(before)) if before[i] != after[i]]
        if len(changed) == 2:
            i, j = changed
            self._emit({
                "type": "swap",
                "indices": [i, j],
                "array": after,
                "line": line_no,
                "info": f"swapping arr[{i}] and arr[{j}]",
            })
        elif len(changed) == 1:
            i = changed[0]
            self._emit({
                "type": "set",
                "indices": [i],
                "array": after,
                "line": line_no,
                "info": f"setting arr[{i}] = {after[i]}",
            })

    # ── Trace function ───────────────────────────────────────────────────────

    def trace(self, frame: types.FrameType, event: str, arg: Any):
        if event not in ("call", "line", "return"):
            return self.trace

        # Only interpret line numbers from the submitted source. Without this
        # guard, Python-library frames can accidentally be matched against the
        # user's source_lines and produce misleading comparison events.
        if frame.f_code.co_filename != "<user_code>":
            return self.trace

        if event == "call":
            return self.trace  # trace into nested user-defined calls too

        if self.subject_name is None:
            found = self._find_subject_array(frame)
            if found:
                self.subject_name = found
                self.prev_snapshot = self._snapshot(frame)

        if event == "line":
            if len(self.steps) >= self.max_steps:
                return None  # stop tracing — runaway loop guard

            line_no = frame.f_lineno
            # Keep a lightweight execution-progress trace in parallel. It is
            # only returned when no structured array events were detected, so
            # DP/string/backtracking code still has seekable progress without
            # pretending we understood a data structure we did not observe.
            if len(self.fallback_steps) < self.max_steps - 1:
                self.fallback_steps.append({"type": "highlight", "line": line_no})
            # Diff against previous snapshot (mutation caused by the *previous* line)
            current_snapshot = self._snapshot(frame)
            if self.prev_snapshot is not None and current_snapshot is not None:
                self._diff_and_emit_mutation(self.prev_snapshot, current_snapshot, line_no)

            # Look at *this* line's source for a comparison to emit a "compare" step
            if 0 < line_no <= len(self.source_lines):
                src = self.source_lines[line_no - 1]
                if any(op in src for op in (">", "<", ">=", "<=", "==")) and self.subject_name:
                    indices = self._resolve_indices(src, frame)
                    if len(indices) >= 1:
                        compared = indices[:2]
                        if len(compared) == 1:
                            info = f"checking arr[{compared[0]}] against the target or condition"
                        else:
                            info = f"comparing arr[{compared[0]}] and arr[{compared[1]}]"
                        self._emit({
                            "type": "compare",
                            "indices": compared,
                            "array": current_snapshot,
                            "line": line_no,
                            "info": info,
                        })

            self.prev_snapshot = current_snapshot

        if event == "return" and frame.f_back is None:
            final = self._snapshot(frame)
            if final is not None:
                self._emit({
                    "type": "done",
                    "array": final,
                    "info": "done",
                })

        return self.trace


def run(code: str) -> list[dict[str, Any]]:
    source_lines = code.split("\n")
    tracer = Tracer(source_lines)

    # ── Explicit step recording ──────────────────────────────────────────────
    # Catalog reference solutions for algorithms that don't reduce to a
    # single flat numeric array (graphs, trees, DP tables) can call this
    # `record_step()` builtin directly to emit precise, semantically correct
    # steps instead of relying on the generic array-diffing heuristic below.
    # If any explicit steps are recorded, they take priority over the
    # heuristic trace entirely, since they are authoritative.
    explicit_steps: list[dict[str, Any]] = []

    def record_step(step: dict[str, Any]) -> None:
        if len(explicit_steps) < 4999:
            explicit_steps.append(dict(step))

    compiled = compile(code, "<user_code>", "exec")
    exec_globals: dict[str, Any] = {
        "__name__": "__main__",
        "__builtins__": __builtins__,
        "record_step": record_step,
    }

    sys.settrace(tracer.trace)
    try:
        exec(compiled, exec_globals)  # noqa: S102
    finally:
        sys.settrace(None)

    if explicit_steps:
        if explicit_steps[-1].get("type") != "done":
            explicit_steps.append({"type": "done", "info": "done"})
        return explicit_steps

    if not tracer.steps:
        tracer.steps = tracer.fallback_steps
        tracer.steps.append({
            "type": "done",
            "info": "execution completed",
        })
    elif tracer.steps[-1].get("type") != "done":
        tracer.steps.append({
            "type": "done",
            "array": tracer.prev_snapshot,
            "info": "done",
        })

    return tracer.steps


if __name__ == "__main__":
    user_code = sys.stdin.read()
    try:
        steps = run(user_code)
        print(json.dumps({"ok": True, "steps": steps}))
    except Exception as e:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": f"{type(e).__name__}: {e}"}))
