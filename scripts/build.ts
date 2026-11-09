// 자료 HTML을 경로에 기대지 않고 열리게 만든다: teacher-guide.md를 HTML로 바꾸고, 쓰인 글자만 담은 Pretendard를
// 각 파일에 넣고, 예시 게임을 슬라이드 7번 iframe에 통째로 넣는다. 글이나 게임을 고친 뒤 `bun scripts/build.ts`로 다시 실행.
import { $ } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const FULL_FONT = join(root, "assets/fonts/PretendardVariable.woff2");
const SUBSET_FONT = join(root, "assets/fonts/Pretendard-embedded.woff2");
const PAGES = [
  { path: "examples/morning-dash.html", assets: "../assets" },
  { path: "worksheet.html", assets: "assets" },
  { path: "teacher-guide.html", assets: "assets" },
  { path: "index.html", assets: "assets" },
  { path: "slides/index.html", assets: "../assets" },
];
const FONT_BLOCK = /\/\* fonts:start \*\/[\s\S]*?\/\* fonts:end \*\//;
const DEMO_IFRAME = /<iframe id="demo-game"[^>]*><\/iframe>/;

const guideBody = Bun.markdown.html(await Bun.file(join(root, "teacher-guide.md")).text());
await Bun.write(join(root, "teacher-guide.html"), `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>교사용 지도안 - 말로 만드는 게임</title>
<link rel="icon" href="assets/icon.svg">
<style>
  /* fonts:start */
  /* fonts:end */
  :root { --ink: #1C1B19; --ink-2: #3A3833; --muted: #6E6A60; --rule: #CFC8B8; --hair: #E2DCCD; --accent: #B23A26; --paper: #F4F0E6; }
  @page { size: A4; margin: 16mm 15mm; }
  * { box-sizing: border-box; }
  html { background: var(--paper); }
  body { margin: 0 auto; max-width: 820px; padding: 32px 24px 72px; font-family: "Pretendard Embedded", "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; color: var(--ink-2); font-size: 16px; line-height: 1.75; word-break: keep-all; }
  .mast { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--ink); font-size: 13px; color: var(--muted); }
  .mast a { color: inherit; }
  h1 { color: var(--ink); font-size: 44px; font-weight: 800; letter-spacing: -.045em; line-height: 1.15; margin: 40px 0 16px; }
  h2 { color: var(--ink); font-size: 24px; font-weight: 700; letter-spacing: -.03em; margin: 48px 0 14px; padding-top: 14px; border-top: 1px solid var(--ink); }
  h3 { color: var(--ink); font-size: 18px; font-weight: 700; letter-spacing: -.02em; margin: 28px 0 10px; }
  p { margin: 0 0 14px; }
  strong { color: var(--ink); }
  code { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: .86em; background: #EAE4D6; padding: 1px 5px; border-radius: 3px; }
  ul, ol { padding-left: 1.3em; margin: 0 0 14px; }
  li { margin: 4px 0; }
  li.task-list-item { list-style: none; margin-left: -1.3em; }
  .task-list-item-checkbox { accent-color: var(--accent); margin-right: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 20px; font-size: 14.5px; line-height: 1.6; }
  th { text-align: left; color: var(--muted); font-size: 13px; font-weight: 700; padding: 0 12px 8px 0; border-bottom: 1px solid var(--ink); }
  td { padding: 9px 12px 9px 0; border-bottom: 1px solid var(--hair); vertical-align: top; }
  td:first-child { color: var(--ink); font-weight: 600; white-space: nowrap; }
  tr, li { break-inside: avoid; }
  h2, h3 { break-after: avoid; }
  @media print { html { background: #fff; } body { padding: 0; max-width: none; } .mast a { text-decoration: none; } }
</style>
</head>
<body>
<div class="mast"><a href="./">말로 만드는 게임 · 바이브코딩 수업</a><span>교사용</span></div>
${guideBody}
</body>
</html>
`);

const sources = new Map<string, string>();
for (const page of PAGES) {
  const text = await Bun.file(join(root, page.path)).text();
  if (!FONT_BLOCK.test(text)) throw new Error(`${page.path}: /* fonts:start */ ... /* fonts:end */ 표식이 없습니다`);
  sources.set(page.path, text.replace(FONT_BLOCK, ""));
}

const chars = new Set<string>();
for (let c = 0x20; c < 0x7f; c++) chars.add(String.fromCharCode(c));
for (const text of sources.values()) for (const ch of text) chars.add(ch);

const work = await mkdtemp(join(tmpdir(), "pretendard-"));
try {
  const textFile = join(work, "chars.txt");
  await Bun.write(textFile, [...chars].join(""));
  await $`uvx --with brotli --from fonttools pyftsubset ${FULL_FONT} --text-file=${textFile} --flavor=woff2 ${"--layout-features=*"} --output-file=${SUBSET_FONT}`.quiet();
} finally {
  await rm(work, { recursive: true, force: true });
}
const subset = Buffer.from(await Bun.file(SUBSET_FONT).arrayBuffer()).toString("base64");

const fontBlock = (assets: string) => `/* fonts:start */
  @font-face {
    font-family: "Pretendard Embedded";
    src: url(data:font/woff2;base64,${subset}) format("woff2");
    font-weight: 45 920;
    font-display: block;
  }
  @font-face {
    font-family: "Pretendard";
    src: url("${assets}/fonts/PretendardVariable.woff2") format("woff2");
    font-weight: 45 920;
    font-display: swap;
  }
  /* fonts:end */`;

const escapeAttr = (html: string) =>
  html.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const built = new Map<string, string>();
for (const page of PAGES) {
  const text = await Bun.file(join(root, page.path)).text();
  built.set(page.path, text.replace(FONT_BLOCK, fontBlock(page.assets)));
}

const game = built.get("examples/morning-dash.html")!;
if (!game.includes("<body>")) throw new Error("examples/morning-dash.html: <body> 태그를 찾지 못했습니다");
const embeddedGame = game.replace("<body>", '<body class="embed">');
const slides = built.get("slides/index.html")!;
if (!DEMO_IFRAME.test(slides)) throw new Error('slides/index.html: <iframe id="demo-game"> 를 찾지 못했습니다');
built.set("slides/index.html", slides.replace(DEMO_IFRAME, `<iframe id="demo-game" title="등굣길 대작전" srcdoc="${escapeAttr(embeddedGame)}"></iframe>`));

for (const [path, text] of built) {
  await Bun.write(join(root, path), text);
  console.log(`${path}  ${(text.length / 1024).toFixed(0)} KB`);
}
console.log(`글꼴 ${chars.size}자, ${(subset.length * 0.75 / 1024).toFixed(0)} KB`);
