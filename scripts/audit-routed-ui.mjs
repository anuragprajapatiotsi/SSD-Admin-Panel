import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Source-only guard for the active application's complete local import graph.
// Does not build the application or claim runtime/accessibility verification.
const root = path.resolve("src");
const visited = new Set();
const issues = [];
const tabViews = new Map();
const retiredClasses = /^(workflow-page|page-heading-row|drawer-backdrop|drawer-overlay|modal-backdrop|side-drawer|form-drawer|primary-button|secondary-button|status-pill|form-field|metric-card)$/;

function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const report = (node, message) => issues.push(`${relative}:${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1}: ${message}`);
  function walk(node) {
    let specifier;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) specifier = node.moduleSpecifier.text;
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) specifier = node.arguments[0]?.text;
    if (specifier?.endsWith("legacy.css")) report(node, "Legacy stylesheet import");
    if (specifier && /(?:radix.*tabs|react-aria-components)/.test(specifier) && relative !== "components/ui/tabs.tsx" && ts.isImportDeclaration(node) && node.importClause?.namedBindings?.elements?.some(element => /^(Tab|TabList|TabPanel|Tabs)$/.test(element.propertyName?.text ?? element.name.text))) report(node, "Import tabs from the shared UI tabs component");
    if (specifier && (specifier.startsWith(".") || specifier.startsWith("@/"))) {
      const base = specifier.startsWith("@/") ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
      const resolved = [".tsx", ".ts", "/index.tsx", "/index.ts"].map(extension => base + extension).find(candidate => fs.existsSync(candidate));
      if (resolved) visit(resolved);
    }
    if (relative.startsWith("pages/")) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const name = node.tagName.getText(ast);
        if (["TableSurface", "Table"].includes(name)) report(node, "Use DataTable or its report composition for page tables");
        if (name === "TabButton" || node.attributes.properties.some(attribute => attribute.name?.getText(ast) === "role" && ["tab", "tablist", "tabpanel"].includes(attribute.initializer?.text))) report(node, "Compose tab navigation with shared Tabs, TabsList, TabsTrigger and TabsContent");
        if (["button", "select", "textarea", "table"].includes(name)) report(node, `Use the shared ${name} component`);
        if (name === "input" && !node.attributes.properties.some(attribute => attribute.name?.getText(ast) === "type" && attribute.initializer?.text === "hidden")) report(node, "Use a shared visible input");
      }
      if (ts.isJsxAttribute(node) && ["className", "tableClassName", "scrollContainerClassName"].includes(node.name.text)) {
        function check(value) {
          if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value) || ts.isTemplateHead(value) || ts.isTemplateMiddle(value) || ts.isTemplateTail(value)) {
            for (const token of value.text.split(/\s+/)) {
              if (retiredClasses.test(token)) report(value, `Retired page class: ${token}`);
            }
          }
          ts.forEachChild(value, check);
        }
        check(node);
      }
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "window.confirm") report(node, "Use the shared confirmation dialog");
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName.getText(ast);
      if (["Tabs", "CustomTabs", "TabsContent"].includes(name) && relative !== "components/ui/tabs.tsx") {
        const id = node.attributes.properties.find(attribute => attribute.name?.getText(ast) === "id")?.initializer?.getText(ast);
        const entries = tabViews.get(relative) ?? [];
        entries.push(`${name}${id ? ` ${id}` : ""} (line ${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1})`);
        tabViews.set(relative, entries);
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(ast);
}

visit(path.join(root, "main.tsx"));
if (process.argv.includes("--tabs")) for (const [file, entries] of [...tabViews].sort()) console.log(`${file}: ${entries.join(", ")}`);
console.log(`Inspected ${visited.size} reachable local modules, including ${[...visited].filter(file => file.includes(`${path.sep}pages${path.sep}`) && file.endsWith(".tsx")).length} page/form modules.`);
if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else {
  console.log("No retired page classes, raw visible page controls, browser confirmations, or legacy stylesheet imports.");
}
