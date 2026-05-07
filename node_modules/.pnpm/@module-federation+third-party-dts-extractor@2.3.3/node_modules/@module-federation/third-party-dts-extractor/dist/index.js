"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/ThirdPartyExtractor.ts
var _findpkg = require('find-pkg'); var _findpkg2 = _interopRequireDefault(_findpkg);
var _promises = require('fs/promises');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _resolve = require('resolve'); var _resolve2 = _interopRequireDefault(_resolve);

// src/utils.ts


function getTypedName(name) {
  return `@types/${name.replace(/^@/, "").replace("/", "__")}`;
}
function getPackageRootDir(packageName) {
  if (!packageName) {
    throw new Error("No package name provided.");
  }
  const entryFile = __require.resolve(packageName);
  const entryDir = _path2.default.dirname(entryFile);
  let fallbackPackageJsonPath = _path2.default.join(
    entryDir,
    "package.json"
  );
  if (!_fs2.default.existsSync(fallbackPackageJsonPath)) {
    fallbackPackageJsonPath = null;
  }
  const match = packageName.match(/^@[^/]+\/(.+)$/);
  const localName = match ? match[1] : packageName;
  let currentDir = entryDir;
  while (_path2.default.basename(currentDir) !== localName && // Keep going if names differ
  _path2.default.dirname(currentDir) !== currentDir) {
    try {
      currentDir = _path2.default.dirname(currentDir);
    } catch (err) {
      if (err.code === "EACCES") {
        continue;
      } else {
        throw err;
      }
    }
  }
  if (_path2.default.basename(currentDir) === localName) {
    const candidate = _path2.default.join(currentDir, "package.json");
    if (_fs2.default.existsSync(candidate)) {
      const pkgContent = JSON.parse(_fs2.default.readFileSync(candidate, "utf8"));
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
    if (_path2.default.isAbsolute(importPath)) {
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
      const pkgJsonPath = _path2.default.join(packageDir, "package.json");
      const dir = _path2.default.dirname(pkgJsonPath);
      const pkg = JSON.parse(_fs.readFileSync.call(void 0, pkgJsonPath, "utf-8"));
      const types = pkg.types || pkg.typings;
      if (dir === this.context) {
        return;
      }
      if (types) {
        const typesDir = _path2.default.dirname(_path2.default.resolve(dir, types));
        this.addPkgs(pkg.name, typesDir);
        return typesDir;
      } else if (_fs.existsSync.call(void 0, _path2.default.resolve(dir, "index.d.ts"))) {
        this.addPkgs(pkg.name, dir);
        return dir;
      } else {
        const typedPkgName = getTypedName(pkg.name);
        const typedPkgJsonPath = _findpkg2.default.sync(
          _resolve2.default.sync(`${typedPkgName}/package.json`, {
            basedir: this.context
          })
        );
        const typedDir = _path2.default.dirname(typedPkgJsonPath);
        _fs.readFileSync.call(void 0, typedPkgJsonPath, "utf-8");
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
    const ensureDir = async (dir) => _promises.mkdir.call(void 0, dir, { recursive: true });
    const copyFiles = async (srcDir, destDir) => {
      if (srcDir.startsWith(".")) {
        return;
      }
      const files = await _promises.readdir.call(void 0, srcDir);
      await Promise.all(
        files.map(async (file) => {
          const fullPath = _path2.default.join(srcDir, file);
          if (["node_modules", "bin"].includes(file)) {
            return;
          }
          const stats = await _promises.lstat.call(void 0, fullPath);
          if (stats.isDirectory()) {
            const destFullPath = _path2.default.join(destDir, file);
            await ensureDir(destFullPath);
            await copyFiles(fullPath, destFullPath);
          } else {
            if (fullPath.endsWith(".d.ts") || fullPath.endsWith("package.json")) {
              await _promises.copyFile.call(void 0, fullPath, _path2.default.join(destDir, file));
            }
          }
        })
      );
    };
    await ensureDir(this.destDir);
    await Promise.all(
      Object.keys(this.pkgs).map(async (pkgName) => {
        const pkgDir = this.pkgs[pkgName];
        const destDir = _path2.default.resolve(this.destDir, pkgName);
        await ensureDir(destDir);
        await copyFiles(pkgDir, destDir);
      })
    );
  }
};


exports.ThirdPartyExtractor = ThirdPartyExtractor;
