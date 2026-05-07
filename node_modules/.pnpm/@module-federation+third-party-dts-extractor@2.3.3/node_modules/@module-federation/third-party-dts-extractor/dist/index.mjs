var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/ThirdPartyExtractor.ts
import findPkg from "find-pkg";
import { copyFile, lstat, mkdir, readdir } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import path2 from "path";
import resolve from "resolve";

// src/utils.ts
import path from "path";
import fs from "fs";
function getTypedName(name) {
  return `@types/${name.replace(/^@/, "").replace("/", "__")}`;
}
function getPackageRootDir(packageName) {
  if (!packageName) {
    throw new Error("No package name provided.");
  }
  const entryFile = __require.resolve(packageName);
  const entryDir = path.dirname(entryFile);
  let fallbackPackageJsonPath = path.join(
    entryDir,
    "package.json"
  );
  if (!fs.existsSync(fallbackPackageJsonPath)) {
    fallbackPackageJsonPath = null;
  }
  const match = packageName.match(/^@[^/]+\/(.+)$/);
  const localName = match ? match[1] : packageName;
  let currentDir = entryDir;
  while (path.basename(currentDir) !== localName && // Keep going if names differ
  path.dirname(currentDir) !== currentDir) {
    try {
      currentDir = path.dirname(currentDir);
    } catch (err) {
      if (err.code === "EACCES") {
        continue;
      } else {
        throw err;
      }
    }
  }
  if (path.basename(currentDir) === localName) {
    const candidate = path.join(currentDir, "package.json");
    if (fs.existsSync(candidate)) {
      const pkgContent = JSON.parse(fs.readFileSync(candidate, "utf8"));
      if (pkgContent.name === packageName) {
        return currentDir;
      }
    }
  }
  if (fallbackPackageJsonPath) {
    return entryDir;
  }
  throw new Error(
    `Could not find a matching package.json for "${packageName}" and no fallback was found.`
  );
}

// src/ThirdPartyExtractor.ts
var ignoredPkgs = ["typescript"];
var isNodeUtils = (pkgJsonPath, importPath) => {
  return pkgJsonPath === importPath;
};
var ThirdPartyExtractor = class {
  constructor({
    destDir,
    context = process.cwd(),
    exclude = []
  }) {
    this.destDir = destDir;
    this.context = context;
    this.pkgs = {};
    this.pattern = /(from|import\()\s*['"]([^'"]+)['"]/g;
    this.exclude = exclude;
  }
  addPkgs(pkgName, dirName) {
    if (ignoredPkgs.includes(pkgName)) {
      return;
    }
    if (this.exclude.some((pattern) => {
      if (typeof pattern === "string") {
        return new RegExp(pattern).test(pkgName);
      } else {
        return pattern.test(pkgName);
      }
    })) {
      return;
    }
    this.pkgs[pkgName] = dirName;
  }
  inferPkgDir(importPath) {
    if (this.pkgs[importPath]) {
      return;
    }
    if (path2.isAbsolute(importPath)) {
      return;
    }
    if (importPath.startsWith(".")) {
      return;
    }
    try {
      const importEntry = __require.resolve(importPath, {
        paths: [this.context]
      });
      if (isNodeUtils(importEntry, importPath)) {
        return;
      }
      const packageDir = getPackageRootDir(importPath);
      const pkgJsonPath = path2.join(packageDir, "package.json");
      const dir = path2.dirname(pkgJsonPath);
      const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      const types = pkg.types || pkg.typings;
      if (dir === this.context) {
        return;
      }
      if (types) {
        const typesDir = path2.dirname(path2.resolve(dir, types));
        this.addPkgs(pkg.name, typesDir);
        return typesDir;
      } else if (existsSync(path2.resolve(dir, "index.d.ts"))) {
        this.addPkgs(pkg.name, dir);
        return dir;
      } else {
        const typedPkgName = getTypedName(pkg.name);
        const typedPkgJsonPath = findPkg.sync(
          resolve.sync(`${typedPkgName}/package.json`, {
            basedir: this.context
          })
        );
        const typedDir = path2.dirname(typedPkgJsonPath);
        readFileSync(typedPkgJsonPath, "utf-8");
        this.addPkgs(typedPkgName, typedDir);
        return typedDir;
      }
    } catch (_err) {
      return;
    }
  }
  collectTypeImports(str) {
    const { pattern } = this;
    let match;
    const imports = /* @__PURE__ */ new Set();
    while ((match = pattern.exec(str)) !== null) {
      imports.add(match[2]);
    }
    return [...imports];
  }
  collectPkgs(str) {
    const imports = this.collectTypeImports(str);
    imports.forEach((importPath) => {
      this.inferPkgDir(importPath);
    });
  }
  async copyDts() {
    if (!Object.keys(this.pkgs).length) {
      return;
    }
    const ensureDir = async (dir) => mkdir(dir, { recursive: true });
    const copyFiles = async (srcDir, destDir) => {
      if (srcDir.startsWith(".")) {
        return;
      }
      const files = await readdir(srcDir);
      await Promise.all(
        files.map(async (file) => {
          const fullPath = path2.join(srcDir, file);
          if (["node_modules", "bin"].includes(file)) {
            return;
          }
          const stats = await lstat(fullPath);
          if (stats.isDirectory()) {
            const destFullPath = path2.join(destDir, file);
            await ensureDir(destFullPath);
            await copyFiles(fullPath, destFullPath);
          } else {
            if (fullPath.endsWith(".d.ts") || fullPath.endsWith("package.json")) {
              await copyFile(fullPath, path2.join(destDir, file));
            }
          }
        })
      );
    };
    await ensureDir(this.destDir);
    await Promise.all(
      Object.keys(this.pkgs).map(async (pkgName) => {
        const pkgDir = this.pkgs[pkgName];
        const destDir = path2.resolve(this.destDir, pkgName);
        await ensureDir(destDir);
        await copyFiles(pkgDir, destDir);
      })
    );
  }
};
export {
  ThirdPartyExtractor
};
