#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "site", "shared-asset-versions.json");
const versions = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const fix = process.argv.includes("--fix");
const checkedAssets = Object.keys(versions);
const escapedAssets = checkedAssets.map((name) => name.replaceAll(".", "\\.")).join("|");
const referencePattern = new RegExp(`(${escapedAssets})\\?v=(\\d+)`, "g");
const unversionedPattern = new RegExp(`((?:src|href)=["'][^"']*)(${escapedAssets})(?=["'])`, "g");
const themeLinkPattern = /<link\b[^>]*\bhref=["'][^"']*themes\.css(?:\?v=\d+)?["'][^>]*>\s*/g;
const sourceRoots = [path.join(root, "site"), path.join(root, "scripts")];
const sourceExtensions = new Set([".html", ".mjs", ".js"]);
const mismatches = [];
let checkedFiles = 0;
let checkedReferences = 0;
let changedFiles = 0;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return sourceExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

for (const file of sourceRoots.flatMap(walk)) {
  let source = fs.readFileSync(file, "utf8");
  let changed = false;
  checkedFiles += 1;
  source = source.replace(referencePattern, (full, asset, actual, offset) => {
    checkedReferences += 1;
    const expected = versions[asset];
    if (actual === expected) return full;
    const relative = path.relative(root, file);
    const line = source.slice(0, offset).split("\n").length;
    mismatches.push(`${relative}:${line} ${asset}?v=${actual} (expected v=${expected})`);
    if (!fix) return full;
    changed = true;
    return `${asset}?v=${expected}`;
  });
  source = source.replace(unversionedPattern, (full, prefix, asset, offset) => {
    checkedReferences += 1;
    const relative = path.relative(root, file);
    const line = source.slice(0, offset).split("\n").length;
    mismatches.push(`${relative}:${line} ${asset} has no cache version (expected v=${versions[asset]})`);
    if (!fix) return full;
    changed = true;
    return `${prefix}${asset}?v=${versions[asset]}`;
  });
  source = source.replace(themeLinkPattern, (full, offset) => {
    const relative = path.relative(root, file);
    const line = source.slice(0, offset).split("\n").length;
    mismatches.push(`${relative}:${line} still loads the removed theme stylesheet`);
    if (!fix) return full;
    changed = true;
    return "";
  });
  if (path.extname(file) === ".html" && source.includes("settings.js") && !source.includes(`theme-init.js?v=${versions["theme-init.js"]}`)) {
    mismatches.push(`${path.relative(root, file)} loads reader settings without the current pre-paint Classic guard`);
  }
  if (changed) {
    fs.writeFileSync(file, source);
    changedFiles += 1;
  }
}

const classicOnlyRules = [
  ["site/settings.js", /data-view|data-theme|theme-swatch|__cvamLoadThemeCss/, "contains a removed layout or theme control"],
  ["site/settings.js", /classList\.toggle\(["']view-modern/, "can enable the removed Modern view"],
  ["site/theme-init.js", /classList\.toggle\(["']view-modern/, "can enable the removed Modern view"],
  ["site/app.js", /classList\.toggle\(["']view-modern/, "can enable the removed Modern view"],
  ["site/modern.js", /classList\.toggle\(["']view-modern/, "can enable the removed Modern view"],
  ["site/theme-init.js", /__cvamLoadThemeCss|\/themes\/theme-/, "can dynamically load a removed theme"]
];
for (const [relative, pattern, message] of classicOnlyRules) {
  if (pattern.test(fs.readFileSync(path.join(root, relative), "utf8"))) mismatches.push(`${relative} ${message}`);
}
const themeInitSource = fs.readFileSync(path.join(root, "site", "theme-init.js"), "utf8");
if (!themeInitSource.includes('localStorage.setItem("cvam-view", "classic")')) {
  mismatches.push("site/theme-init.js does not enforce the sole supported Classic view");
}

if (fix) {
  console.log(`Normalized ${mismatches.length} stale references across ${changedFiles} files.`);
  process.exit(0);
}

if (mismatches.length) {
  console.error("Shared asset version drift detected:\n" + mismatches.join("\n"));
  console.error("\nRun: node scripts/check-shared-assets.mjs --fix");
  process.exit(1);
}

console.log(`Shared asset versions OK: ${checkedReferences} references across ${checkedFiles} files.`);
