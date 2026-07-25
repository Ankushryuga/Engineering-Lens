"""
instrument.py — source-level instrumentation for Java sandbox jobs.

Same pragmatic strategy documented for the Go sandbox (see
sandbox/golang/instrument.go and requirement_doc.md §3.2/§3.8): rather than a
true debugger-level trace (JDWP), we inject step-recording calls at compile
time around comparisons and assignments involving the detected "subject"
int[] array. This is accurate for idiomatic comparison/swap-style
sorting/searching code — the catalog's canonical style.
"""

import re

PARAM_RE = re.compile(r"\bint\s*\[\s*\]\s*(\w+)\b.*?\)")
DECL_RE = re.compile(r"int\s*\[\s*\]\s*(\w+)\s*=\s*\{")
COMPARE_OP_RE = re.compile(r"[<>]=?|==")
MAIN_RE = re.compile(r"public\s+static\s+void\s+main\s*\([^)]*\)\s*\{")

RUNTIME_CLASS = """
class AlgoVizRuntime {
    static StringBuilder steps = new StringBuilder("[");
    static boolean first = true;
    static int[] prev = null;
    static int count = 0;

    static void appendStep(String json) {
        if (count >= 2000) return;
        count++;
        if (!first) steps.append(",");
        first = false;
        steps.append(json);
    }

    static String arrToJson(int[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    static void recordCompare(int i, int j, int[] arr) {
        String json = "{\\"type\\":\\"compare\\",\\"indices\\":[" + i + "," + j + "],\\"array\\":"
            + arrToJson(arr) + ",\\"info\\":\\"comparing arr[" + i + "] and arr[" + j + "]\\"}";
        appendStep(json);
    }

    static void recordMutation(int[] arr) {
        if (prev != null && prev.length == arr.length) {
            java.util.List<Integer> changed = new java.util.ArrayList<>();
            for (int k = 0; k < arr.length; k++) {
                if (prev[k] != arr[k]) changed.add(k);
            }
            if (changed.size() == 2) {
                int a = changed.get(0), b = changed.get(1);
                String json = "{\\"type\\":\\"swap\\",\\"indices\\":[" + a + "," + b + "],\\"array\\":"
                    + arrToJson(arr) + ",\\"info\\":\\"swapping arr[" + a + "] and arr[" + b + "]\\"}";
                appendStep(json);
            } else if (changed.size() == 1) {
                int a = changed.get(0);
                String json = "{\\"type\\":\\"set\\",\\"indices\\":[" + a + "],\\"array\\":"
                    + arrToJson(arr) + ",\\"info\\":\\"setting arr[" + a + "] = " + arr[a] + "\\"}";
                appendStep(json);
            }
        }
        prev = arr.clone();
    }

    static void finalizeSteps() {
        if (count == 0) {
            steps.append("{\\"type\\":\\"done\\",\\"info\\":\\"execution completed \\u2014 no array-based state changes detected\\"}");
        } else {
            steps.append(",{\\"type\\":\\"done\\",\\"info\\":\\"done\\"}");
        }
        steps.append("]");
        System.out.println("__STEPS_JSON__" + steps.toString());
    }
}
"""


def find_subject_name(code: str) -> str:
    m = PARAM_RE.search(code)
    if m:
        return m.group(1)
    m = DECL_RE.search(code)
    if m:
        return m.group(1)
    return ""


def _find_matching_brace(code: str, open_idx: int) -> int:
    depth = 0
    for i in range(open_idx, len(code)):
        if code[i] == "{":
            depth += 1
        elif code[i] == "}":
            depth -= 1
            if depth == 0:
                return i
    return -1


def instrument(code: str) -> str:
    subject = find_subject_name(code)

    if subject:
        idx_re = re.compile(re.escape(subject) + r"\[([^\]]+)\]")
        assign_re = re.compile(re.escape(subject) + r"\[[^\]]+\]\s*=[^=]")

        lines = code.split("\n")
        out = []
        for line in lines:
            if COMPARE_OP_RE.search(line):
                matches = idx_re.findall(line)
                if len(matches) >= 2:
                    out.append(f"AlgoVizRuntime.recordCompare(({matches[0]}), ({matches[1]}), {subject});")
            out.append(line)
            if assign_re.search(line):
                out.append(f"AlgoVizRuntime.recordMutation({subject});")
        code = "\n".join(out)

    # Insert finalizeSteps() before the closing brace of main().
    m = MAIN_RE.search(code)
    if m:
        open_brace_idx = code.index("{", m.end() - 1)
        close_idx = _find_matching_brace(code, open_brace_idx)
        if close_idx != -1:
            code = code[:close_idx] + "\nAlgoVizRuntime.finalizeSteps();\n" + code[close_idx:]

    return code + "\n" + RUNTIME_CLASS
