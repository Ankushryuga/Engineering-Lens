"""
instrument.py — source-level instrumentation for C/C++ sandbox jobs.

Same pragmatic strategy documented for the Go and Java sandboxes: inject
step-recording calls at compile time around comparisons and assignments
involving the detected "subject" std::vector<int> (or int[]) array. C/C++
is marked "beta" in the docs/UI per requirement_doc.md §3.4 — instrumentation
fidelity here is the least mature of the five languages.
"""

import re

VECTOR_PARAM_RE = re.compile(r"std::vector<int>\s*&?\s*(\w+)")
VECTOR_DECL_RE = re.compile(r"std::vector<int>\s+(\w+)\s*=\s*\{")
ARRAY_PARAM_RE = re.compile(r"\bint\s+(\w+)\s*\[\s*\]")
COMPARE_OP_RE = re.compile(r"[<>]=?|==")
MAIN_RE = re.compile(r"\bint\s+main\s*\([^)]*\)\s*\{")

RUNTIME_PRELUDE = """
#include <vector>
#include <string>
#include <sstream>
#include <iostream>

namespace __algoviz__ {
    inline std::string vecToJson(const std::vector<int>& arr) {
        std::ostringstream ss;
        ss << "[";
        for (size_t i = 0; i < arr.size(); i++) {
            if (i > 0) ss << ",";
            ss << arr[i];
        }
        ss << "]";
        return ss.str();
    }

    static std::ostringstream __steps__;
    static bool __first__ = true;
    static std::vector<int> __prev__;
    static bool __has_prev__ = false;
    static int __count__ = 0;

    inline void appendStep(const std::string& json) {
        if (__count__ >= 2000) return;
        __count__++;
        if (!__first__) __steps__ << ",";
        __first__ = false;
        __steps__ << json;
    }

    inline void recordCompare(int i, int j, const std::vector<int>& arr) {
        if (!__has_prev__) { __prev__ = arr; __has_prev__ = true; }
        std::ostringstream ss;
        ss << "{\\"type\\":\\"compare\\",\\"indices\\":[" << i << "," << j << "],\\"array\\":"
           << vecToJson(arr) << ",\\"info\\":\\"comparing arr[" << i << "] and arr[" << j << "]\\"}";
        appendStep(ss.str());
    }

    inline void recordMutation(const std::vector<int>& arr) {
        if (__has_prev__ && __prev__.size() == arr.size()) {
            std::vector<int> changed;
            for (size_t k = 0; k < arr.size(); k++) {
                if (__prev__[k] != arr[k]) changed.push_back((int)k);
            }
            if (changed.size() == 2) {
                std::ostringstream ss;
                ss << "{\\"type\\":\\"swap\\",\\"indices\\":[" << changed[0] << "," << changed[1] << "],\\"array\\":"
                   << vecToJson(arr) << ",\\"info\\":\\"swapping arr[" << changed[0] << "] and arr[" << changed[1] << "]\\"}";
                appendStep(ss.str());
            } else if (changed.size() == 1) {
                std::ostringstream ss;
                ss << "{\\"type\\":\\"set\\",\\"indices\\":[" << changed[0] << "],\\"array\\":"
                   << vecToJson(arr) << ",\\"info\\":\\"setting arr[" << changed[0] << "]\\"}";
                appendStep(ss.str());
            }
        }
        __prev__ = arr;
        __has_prev__ = true;
    }

    inline void finalizeSteps() {
        if (__count__ == 0) {
            __steps__ << "{\\"type\\":\\"done\\",\\"info\\":\\"execution completed \\u2014 no array-based state changes detected\\"}";
        } else {
            __steps__ << ",{\\"type\\":\\"done\\",\\"array\\":" << vecToJson(__prev__) << ",\\"info\\":\\"done\\"}";
        }
        std::cout << "__STEPS_JSON__[" << __steps__.str() << "]" << std::endl;
    }

    struct FinalizeGuard {
        ~FinalizeGuard() { finalizeSteps(); }
    };
}
using __algoviz__::recordCompare;
using __algoviz__::recordMutation;
"""


def find_subject_name(code: str) -> str:
    m = VECTOR_PARAM_RE.search(code)
    if m:
        return m.group(1)
    m = VECTOR_DECL_RE.search(code)
    if m:
        return m.group(1)
    m = ARRAY_PARAM_RE.search(code)
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
                    out.append(f"__algoviz__::recordCompare(({matches[0]}), ({matches[1]}), {subject});")
            out.append(line)
            if assign_re.search(line) or ("std::swap" in line and subject + "[" in line):
                out.append(f"__algoviz__::recordMutation({subject});")
        code = "\n".join(out)

    m = MAIN_RE.search(code)
    if m:
        open_brace_idx = code.index("{", m.end() - 1)
        code = (
            code[:open_brace_idx + 1]
            + "\n__algoviz__::FinalizeGuard __algoviz_finalize_guard__;\n"
            + code[open_brace_idx + 1:]
        )

    return RUNTIME_PRELUDE + "\n" + code
