// 슬라이드, 활동지, 지도안을 Chrome으로 인쇄해 pdf/ 폴더에 저장한다. `bun scripts/build.ts` 다음에 실행.
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = join(import.meta.dir, "..");
const TARGETS = [
  { page: "slides/index.html", out: "pdf/slides.pdf" },
  { page: "worksheet.html", out: "pdf/worksheet.pdf" },
  { page: "teacher-guide.html", out: "pdf/teacher-guide.pdf" },
];

await mkdir(join(root, "pdf"), { recursive: true });
const view = new Bun.WebView({ width: 1280, height: 720, backend: "chrome" });
try {
  for (const { page, out } of TARGETS) {
    await view.navigate(pathToFileURL(join(root, page)).href);
    await view.evaluate("document.fonts.ready.then(() => true)");
    const result = await view.cdp("Page.printToPDF", { printBackground: true, preferCSSPageSize: true });
    if (typeof result !== "object" || result === null || !("data" in result) || typeof result.data !== "string") {
      throw new Error(`${page}: Page.printToPDF 응답에 PDF 데이터가 없습니다`);
    }
    const bytes = Buffer.from(result.data, "base64");
    await Bun.write(join(root, out), bytes);
    console.log(`${out}  ${(bytes.length / 1024).toFixed(0)} KB`);
  }
} finally {
  view.close();
}
