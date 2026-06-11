const FONT_STACK = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

export function h(tag, attrs = {}, ...children) {
  return { tag, attrs, children: children.flat().filter((child) => child !== null && child !== undefined) };
}

export function renderSvg(node) {
  if (typeof node === "string" || typeof node === "number") return escapeXml(node);
  const attrs = Object.entries(node.attrs || {})
    .filter(([, value]) => value !== false && value !== null && value !== undefined)
    .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
    .join("");
  if (!node.children?.length) return `<${node.tag}${attrs}/>`;
  return `<${node.tag}${attrs}>${node.children.map(renderSvg).join("")}</${node.tag}>`;
}

export function TerminalCardSvg({ lines, title = "eduorchestrate-terminal" }) {
  const metrics = terminalMetrics(lines);
  return h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: metrics.width,
      height: metrics.height,
      viewBox: `0 0 ${metrics.width} ${metrics.height}`,
      role: "img",
      "aria-label": "EduOrchestrate terminal progress card"
    },
    h("rect", { width: metrics.width, height: metrics.height, rx: 14, fill: "#0D1117" }),
    h("rect", {
      x: 1,
      y: 1,
      width: metrics.width - 2,
      height: metrics.height - 2,
      rx: 13,
      fill: "none",
      stroke: "#30363D",
      "stroke-width": 2
    }),
    h("rect", { x: 1, y: 1, width: metrics.width - 2, height: metrics.headerHeight, rx: 13, fill: "#161B22" }),
    h("path", { d: `M1 ${metrics.headerHeight}H${metrics.width - 1}`, stroke: "#30363D", "stroke-width": 2 }),
    WindowButton({ cx: 26, fill: "#FF5F56" }),
    WindowButton({ cx: 46, fill: "#FFBD2E" }),
    WindowButton({ cx: 66, fill: "#27C93F" }),
    h(
      "text",
      {
        x: metrics.width / 2,
        y: 30,
        "text-anchor": "middle",
        "font-family": FONT_STACK,
        "font-size": 13,
        fill: "#8B949E"
      },
      title
    ),
    lines.map((line, index) => TerminalLine({ line, index, metrics }))
  );
}

function WindowButton({ cx, fill }) {
  return h("circle", { cx, cy: 24, r: 6, fill });
}

function TerminalLine({ line, index, metrics }) {
  return h(
    "text",
    {
      x: metrics.paddingX,
      y: metrics.contentTop + index * metrics.lineHeight,
      "font-family": FONT_STACK,
      "font-size": 15,
      fill: index === 0 ? "#7EE787" : "#C9D1D9"
    },
    line
  );
}

function terminalMetrics(lines) {
  const charWidth = 8.4;
  const lineHeight = 24;
  const paddingX = 28;
  const headerHeight = 46;
  const contentTop = 78;
  const maxChars = Math.max(...lines.map((line) => line.length), 32);
  return {
    charWidth,
    lineHeight,
    paddingX,
    headerHeight,
    contentTop,
    width: Math.ceil(Math.max(720, maxChars * charWidth + paddingX * 2)),
    height: contentTop + lines.length * lineHeight + 28
  };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
