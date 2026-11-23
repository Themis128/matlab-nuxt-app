#!/usr/bin/env python3
"""Scan all .vue files for unbalanced <template> tag structure.

Catches the orphan-closing-tag class of bugs that broke `nuxt build`
(RolldownError: Invalid end tag) — e.g. a stray </DPageLayout> or </div>
after template edits. Dependency-free: a simple tag stack over the
<template>...</template> block of each SFC.

Usage: python3 vue_template_check.py [dir ...]   (default: repo root)
Exit 0 = clean, 1 = errors found.
"""
import os
import re
import sys
from html.parser import HTMLParser

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}
# Vue/Svelte-style component tags and directives we still want to balance.


class TemplateChecker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []
        self.in_template = False
        self.template_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag == "template" and not self.in_template:
            self.in_template = True
            self.template_depth = 1
            return
        if not self.in_template:
            return
        if tag == "template":
            self.template_depth += 1
        if tag not in VOID and not tag.startswith(("!",)):
            self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag, attrs):
        # self-closing <Foo /> — no stack effect
        pass

    def handle_endtag(self, tag):
        if not self.in_template:
            return
        if tag == "template":
            if self.stack and self.stack[-1][0] == "template":
                self.stack.pop()
            self.template_depth -= 1
            if self.template_depth <= 0:
                self.in_template = False
            return
        if not self.stack:
            self.errors.append(f"{self.getpos()}: orphan </{tag}>")
            return
        # pop until match (tolerate implicit closes like <p><div>)
        names = [t for t, _ in self.stack]
        if tag in names:
            while self.stack and self.stack[-1][0] != tag:
                self.errors.append(
                    f"{self.stack[-1][1]}: unclosed <{self.stack[-1][0]}> before </{tag}> at {self.getpos()}"
                )
                self.stack.pop()
            self.stack.pop()
        else:
            self.errors.append(f"{self.getpos()}: unmatched </{tag}>")


def check_file(path):
    src = open(path, encoding="utf-8", errors="replace").read()
    m = re.search(r"<template[^>]*>(.*)</template>", src, re.S)
    if not m:
        return []
    body = m.group(1)
    # strip mustache interpolations so {{ a < b }} can't confuse the parser
    body = re.sub(r"\{\{.*?\}\}", "", body, flags=re.S)
    p = TemplateChecker()
    try:
        p.feed(body)
        p.close()
    except Exception as e:  # HTMLParser is lenient; this is belt & braces
        return [f"parse exception: {e}"]
    errs = list(p.errors)
    for tag, pos in p.stack:
        errs.append(f"{pos}: unclosed <{tag}> at end of template")
    return errs


def main():
    roots = sys.argv[1:] or ["."]
    bad = 0
    checked = 0
    for root in roots:
        for dirpath, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in {"node_modules", ".nuxt", ".output", "dist", ".git"}]
            for f in files:
                if not f.endswith(".vue"):
                    continue
                path = os.path.join(dirpath, f)
                errs = check_file(path)
                checked += 1
                if errs:
                    bad += 1
                    print(f"{path}:")
                    for e in errs:
                        print(f"  {e}")
    print(f"checked {checked} files, {bad} with template errors")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
