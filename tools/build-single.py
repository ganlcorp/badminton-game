#!/usr/bin/env python3
"""Gộp toàn bộ dự án thành 1 file HTML duy nhất (dist/game.html) để chia sẻ nhanh hoặc chạy offline.
Cách dùng:  python3 tools/build-single.py
"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')

# 1) chèn CSS
def css_inline(m):
    return '<style>\n' + (root / m.group(1)).read_text(encoding='utf-8') + '</style>'
html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css_inline, html)

# 2) chèn tranh SVG thay cho chỗ giữ chỗ data-art
def art_inline(m):
    return (root / m.group(1)).read_text(encoding='utf-8').strip()
html = re.sub(r'<i data-art="([^"]+)"></i>', art_inline, html)

# 3) chèn JS; tranh đã nằm sẵn trong trang nên loadArt() không cần tải gì thêm
def js_inline(m):
    return '<script>\n' + (root / m.group(1)).read_text(encoding='utf-8') + '</script>'
html = re.sub(r'<script src="(js/[^"]+)"></script>', js_inline, html)

out = root / 'dist' / 'game.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'Đã tạo {out.relative_to(root)} ({out.stat().st_size/1024:.0f} KB)')
