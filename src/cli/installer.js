#!/usr/bin/env node
"use strict";
/**
 * Oh-My-Novel CLI Installer
 * Interactive installation and configuration wizard
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var fs = require("fs");
var path = require("path");
var os = require("os");
var program = new commander_1.Command();
// ============================================
// Helper Functions
// ============================================
function log(message, type) {
    if (type === void 0) { type = "info"; }
    var colors = {
        info: "\x1b[36m", // cyan
        success: "\x1b[32m", // green
        error: "\x1b[31m", // red
        warning: "\x1b[33m", // yellow
    };
    var reset = "\x1b[0m";
    console.log("".concat(colors[type]).concat(message).concat(reset));
}
function question(prompt, defaultValue) {
    return new Promise(function (resolve) {
        var readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        var fullPrompt = defaultValue
            ? "".concat(prompt, " [").concat(defaultValue, "]: ")
            : "".concat(prompt, ": ");
        readline.question(fullPrompt, function (answer) {
            readline.close();
            resolve(answer || defaultValue || "");
        });
    });
}
function confirm(prompt) {
    return new Promise(function (resolve) {
        var readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        readline.question("".concat(prompt, " [y/N]: "), function (answer) {
            readline.close();
            resolve(answer.toLowerCase() === "y");
        });
    });
}
function getHomeDir() {
    return os.homedir();
}
function getConfigPath() {
    var homeDir = getHomeDir();
    return path.join(homeDir, ".config", "opencode");
}
// ============================================
// Installation Checks
// ============================================
function checkOpencodeInstalled() {
    return __awaiter(this, void 0, void 0, function () {
        var execSync, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("child_process"); })];
                case 1:
                    execSync = (_a.sent()).execSync;
                    execSync("opencode --version", { stdio: "ignore" });
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function checkOpencodeVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var execSync, version, installed, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("child_process"); })];
                case 1:
                    execSync = (_a.sent()).execSync;
                    version = execSync("opencode --version", {
                        encoding: "utf-8",
                    }).trim();
                    installed = version >= "1.0.150";
                    return [2 /*return*/, {
                            installed: true,
                            version: version,
                            meetsRequirement: installed,
                        }];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, {
                            installed: false,
                            meetsRequirement: false,
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function checkDependencies() {
    return __awaiter(this, void 0, void 0, function () {
        var checks, results, _i, checks_1, check, execSync, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checks = [
                        { name: "Node.js", command: "node --version", required: true },
                        { name: "Bun", command: "bun --version", required: true },
                        { name: "ripgrep", command: "rg --version", required: false },
                        { name: "git", command: "git --version", required: false },
                    ];
                    results = [];
                    _i = 0, checks_1 = checks;
                    _a.label = 1;
                case 1:
                    if (!(_i < checks_1.length)) return [3 /*break*/, 6];
                    check = checks_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("child_process"); })];
                case 3:
                    execSync = (_a.sent()).execSync;
                    execSync(check.command, { stdio: "ignore" });
                    results.push(__assign(__assign({}, check), { installed: true }));
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    results.push(__assign(__assign({}, check), { installed: false }));
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, results];
            }
        });
    });
}
// ============================================
// Configuration Setup
// ============================================
function setupConfigPath() {
    return __awaiter(this, void 0, void 0, function () {
        var configPath;
        return __generator(this, function (_a) {
            configPath = getConfigPath();
            if (!fs.existsSync(configPath)) {
                fs.mkdirSync(configPath, { recursive: true });
                log("Created config directory: ".concat(configPath), "success");
            }
            return [2 /*return*/, configPath];
        });
    });
}
function createOrUpdateConfig(config) {
    return __awaiter(this, void 0, void 0, function () {
        var configPath, configFile, existingConfig, mergedConfig;
        return __generator(this, function (_a) {
            configPath = getConfigPath();
            configFile = path.join(configPath, "opencode.json");
            try {
                existingConfig = {};
                if (fs.existsSync(configFile)) {
                    existingConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
                    log("Found existing opencode.json", "info");
                }
                mergedConfig = __assign(__assign({}, existingConfig), config);
                // Ensure plugins array exists
                if (!mergedConfig.plugins) {
                    mergedConfig.plugins = [];
                }
                // Add oh-my-novel if not present
                if (!mergedConfig.plugins.includes("oh-my-novel")) {
                    mergedConfig.plugins.push("oh-my-novel");
                    log("Added oh-my-novel to plugins", "success");
                }
                fs.writeFileSync(configFile, JSON.stringify(mergedConfig, null, 2));
                log("Updated ".concat(configFile), "success");
                return [2 /*return*/, true];
            }
            catch (error) {
                log("Failed to create config: ".concat(error.message), "error");
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
function createNovelConfig(options) {
    return __awaiter(this, void 0, void 0, function () {
        var configPath, novelConfigFile, agentModels, defaultConfig;
        return __generator(this, function (_a) {
            configPath = getConfigPath();
            novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");
            try {
                agentModels = determineAgentModels(options);
                defaultConfig = {
                    $schema: "./oh-my-novel.schema.json",
                    // Novel settings
                    novelSettings: {
                        defaultGenre: "fantasy",
                        chapterLength: 3000,
                        autoSave: true,
                    },
                    // Long running settings
                    longRunning: {
                        maxRetries: 3,
                        retryDelay: 5000,
                        checkpointInterval: 1,
                        batchSize: 5,
                        pauseOnError: true,
                        autoResume: false,
                    },
                    // Hooks
                    disabled_hooks: [],
                    // Agent overrides based on subscriptions
                    agents: agentModels,
                };
                fs.writeFileSync(novelConfigFile, JSON.stringify(defaultConfig, null, 2));
                log("Created ".concat(novelConfigFile), "success");
                return [2 /*return*/, true];
            }
            catch (error) {
                log("Failed to create novel config: ".concat(error.message), "error");
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
function determineAgentModels(options) {
    var hasClaude = options.claude && options.claude !== "no";
    var hasChatGPT = options.chatgpt === "yes";
    var hasGemini = options.gemini === "yes";
    var hasCopilot = options.copilot === "yes";
    // Default agent configurations for oh-my-novel
    var agentModels = {
        novelist: {
            model: "anthropic/claude-opus-4-5",
            temperature: 0.7,
        },
        "plot-designer": {
            model: "openai/gpt-5.2",
            temperature: 0.3,
        },
        "character-developer": {
            model: "openai/gpt-5.2",
            temperature: 0.4,
        },
        "world-builder": {
            model: "anthropic/claude-opus-4-5",
            temperature: 0.5,
        },
        editor: {
            model: "google/gemini-3-pro-preview",
            temperature: 0.3,
        },
    };
    // Adjust models based on available subscriptions
    if (hasClaude) {
        if (options.claude === "max20") {
            agentModels.novelist.model = "anthropic/claude-opus-4-5-max20";
        }
        // Claude models are already set as defaults
    }
    else if (!hasClaude && !hasChatGPT && !hasGemini && !hasCopilot) {
        // No subscriptions - use free models
        log("No subscriptions detected. Using free models.", "warning");
        agentModels.novelist.model = "opencode/glm-4.7-free";
        agentModels.plotDesigner.model = "opencode/glm-4.7-free";
        agentModels.characterDeveloper.model = "opencode/glm-4.7-free";
        agentModels.worldBuilder.model = "opencode/glm-4.7-free";
        agentModels.editor.model = "opencode/glm-4.7-free";
    }
    if (hasGemini) {
        agentModels.editor.model = "google/gemini-3-pro-preview";
    }
    if (hasChatGPT) {
        // Could use GPT models if preferred
        agentModels.plotDesigner.model = "openai/gpt-5.2";
        agentModels.characterDeveloper.model = "openai/gpt-5.2";
    }
    if (hasCopilot) {
        // GitHub Copilot as fallback provider
        log("GitHub Copilot enabled as fallback provider", "info");
    }
    return agentModels;
}
// ============================================
// CLI Commands
// ============================================
program
    .name("oh-my-novel-installer")
    .description("Interactive installer for oh-my-novel plugin")
    .version("1.0.0");
program
    .command("install")
    .description("Interactive installation wizard")
    .option("--no-tui", "Run in non-interactive mode")
    .option("--skip-deps", "Skip dependency checks")
    .option("--claude <value>", "Claude subscription status: yes, no, max20")
    .option("--chatgpt <value>", "ChatGPT subscription status: yes, no")
    .option("--gemini <value>", "Gemini integration: yes, no")
    .option("--copilot <value>", "GitHub Copilot integration: yes, no")
    .action(function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var opencodeCheck, depChecks, criticalMissing, _i, depChecks_1, dep, genre, chapterLength, autoSave, novelConfigCreated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log("🚀 Oh-My-Novel Installation Wizard", "info");
                log("=======================================", "info");
                log("", "info");
                if (!!options.skipDeps) return [3 /*break*/, 2];
                log("Checking OpenCode installation...", "info");
                return [4 /*yield*/, checkOpencodeVersion()];
            case 1:
                opencodeCheck = _a.sent();
                if (!opencodeCheck.installed) {
                    log("❌ OpenCode is not installed!", "error");
                    log("Please install OpenCode first:", "info");
                    log("  https://opencode.ai/docs", "info");
                    process.exit(1);
                }
                if (!opencodeCheck.meetsRequirement) {
                    log("\u274C OpenCode version ".concat(opencodeCheck.version, " is too old!"), "error");
                    log("Please upgrade to version 1.0.150 or higher", "info");
                    process.exit(1);
                }
                log("\u2713 OpenCode ".concat(opencodeCheck.version, " installed"), "success");
                log("", "info");
                _a.label = 2;
            case 2:
                if (!!options.skipDeps) return [3 /*break*/, 4];
                log("Checking dependencies...", "info");
                return [4 /*yield*/, checkDependencies()];
            case 3:
                depChecks = _a.sent();
                criticalMissing = false;
                for (_i = 0, depChecks_1 = depChecks; _i < depChecks_1.length; _i++) {
                    dep = depChecks_1[_i];
                    if (dep.required && !dep.installed) {
                        log("\u2717 ".concat(dep.name, " not installed (required)"), "error");
                        criticalMissing = true;
                    }
                    else if (dep.installed) {
                        log("\u2713 ".concat(dep.name, " installed"), "success");
                    }
                    else {
                        log("\u26A0 ".concat(dep.name, " not installed (optional)"), "warning");
                    }
                }
                log("", "info");
                if (criticalMissing) {
                    log("Critical dependencies missing. Aborting installation.", "error");
                    process.exit(1);
                }
                _a.label = 4;
            case 4:
                if (!!options.noTui) return [3 /*break*/, 11];
                log("Configuration", "info");
                log("=======================================", "info");
                log("", "info");
                return [4 /*yield*/, question("Default novel genre", "fantasy")];
            case 5:
                genre = _a.sent();
                return [4 /*yield*/, question("Default chapter length (words)", "3000")];
            case 6:
                chapterLength = _a.sent();
                return [4 /*yield*/, confirm("Enable auto-save?")];
            case 7:
                autoSave = _a.sent();
                log("", "info");
                log("Setting up configuration files...", "info");
                return [4 /*yield*/, setupConfigPath()];
            case 8:
                _a.sent();
                // Create opencode.json
                return [4 /*yield*/, createOrUpdateConfig({
                    // User preferences could be added here
                    })];
            case 9:
                // Create opencode.json
                _a.sent();
                return [4 /*yield*/, createNovelConfig(options)];
            case 10:
                novelConfigCreated = _a.sent();
                if (novelConfigCreated) {
                    log("Novel configuration created successfully!", "success");
                    log("", "info");
                    log("You can customize the configuration in:", "info");
                    log("  ~/.config/opencode/oh-my-novel.jsonc", "info");
                    log("", "info");
                    log("For project-specific configuration, create:", "info");
                    log("  .opencode/oh-my-novel.jsonc", "info");
                }
                log("", "info");
                log("✅ Installation complete!", "success");
                log("", "info");
                log("Next steps:", "info");
                log("  1. Run 'opencode' to start using oh-my-novel", "info");
                log("  2. Try: 'Create a fantasy novel about dragons'", "info");
                log("  3. See README.md for usage examples", "info");
                return [3 /*break*/, 15];
            case 11:
                // Non-interactive mode
                log("Running in non-interactive mode...", "info");
                return [4 /*yield*/, setupConfigPath()];
            case 12:
                _a.sent();
                return [4 /*yield*/, createOrUpdateConfig({})];
            case 13:
                _a.sent();
                return [4 /*yield*/, createNovelConfig(options)];
            case 14:
                _a.sent();
                log("✅ Installation complete (using defaults)!", "success");
                _a.label = 15;
            case 15: return [2 /*return*/];
        }
    });
}); });
program
    .command("doctor")
    .description("Run health checks")
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var issues, opencodeCheck, depChecks, _i, depChecks_2, dep, configPath, configFile, novelConfigFile, config, _a, issues_1, issue;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                log("🏥 Oh-My-Novel Health Check", "info");
                log("=======================================", "info");
                log("", "info");
                issues = [];
                // Check OpenCode
                log("Checking OpenCode...", "info");
                return [4 /*yield*/, checkOpencodeVersion()];
            case 1:
                opencodeCheck = _b.sent();
                if (!opencodeCheck.installed) {
                    issues.push("OpenCode not installed");
                    log("✗ OpenCode not found", "error");
                }
                else if (!opencodeCheck.meetsRequirement) {
                    issues.push("OpenCode version ".concat(opencodeCheck.version, " too old (requires >= 1.0.150)"));
                    log("\u2717 OpenCode ".concat(opencodeCheck.version, " too old"), "error");
                }
                else {
                    log("\u2713 OpenCode ".concat(opencodeCheck.version, " OK"), "success");
                }
                log("", "info");
                // Check dependencies
                log("Checking dependencies...", "info");
                return [4 /*yield*/, checkDependencies()];
            case 2:
                depChecks = _b.sent();
                for (_i = 0, depChecks_2 = depChecks; _i < depChecks_2.length; _i++) {
                    dep = depChecks_2[_i];
                    if (dep.required && !dep.installed) {
                        issues.push("".concat(dep.name, " not installed"));
                        log("\u2717 ".concat(dep.name, " missing"), "error");
                    }
                    else if (dep.installed) {
                        log("\u2713 ".concat(dep.name, " OK"), "success");
                    }
                    else if (!dep.installed) {
                        log("\u26A0 ".concat(dep.name, " optional but not found"), "warning");
                    }
                }
                log("", "info");
                // Check configuration
                log("Checking configuration...", "info");
                configPath = getConfigPath();
                configFile = path.join(configPath, "opencode.json");
                novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");
                if (!fs.existsSync(configFile)) {
                    issues.push("opencode.json not found");
                    log("✗ opencode.json not found", "error");
                }
                else {
                    log("✓ opencode.json found", "success");
                    try {
                        config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
                        if (!config.plugins || !config.plugins.includes("oh-my-novel")) {
                            issues.push("oh-my-novel not registered in plugins");
                            log("✗ oh-my-novel not in plugins array", "warning");
                        }
                        else {
                            log("✓ oh-my-novel registered", "success");
                        }
                    }
                    catch (error) {
                        issues.push("opencode.json invalid JSON");
                        log("✗ opencode.json invalid", "error");
                    }
                }
                if (!fs.existsSync(novelConfigFile)) {
                    issues.push("oh-my-novel.jsonc not found");
                    log("✗ oh-my-novel.jsonc not found", "warning");
                }
                else {
                    log("✓ oh-my-novel.jsonc found", "success");
                }
                log("", "info");
                // Summary
                if (issues.length > 0) {
                    log("⚠ Issues found:", "warning");
                    for (_a = 0, issues_1 = issues; _a < issues_1.length; _a++) {
                        issue = issues_1[_a];
                        log("  - ".concat(issue), "warning");
                    }
                    process.exit(1);
                }
                else {
                    log("✅ All checks passed!", "success");
                    log("", "info");
                    log("Oh-My-Novel is ready to use!", "success");
                }
                return [2 /*return*/];
        }
    });
}); });
program
    .command("uninstall")
    .description("Uninstall oh-my-novel")
    .option("--purge", "Remove all configuration files")
    .action(function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var configPath, configFile, novelConfigFile, config, index, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                log("🗑️ Oh-My-Novel Uninstaller", "info");
                log("=======================================", "info");
                log("", "info");
                configPath = getConfigPath();
                configFile = path.join(configPath, "opencode.json");
                novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");
                // Remove plugin registration
                if (fs.existsSync(configFile)) {
                    try {
                        config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
                        if (config.plugins && Array.isArray(config.plugins)) {
                            index = config.plugins.indexOf("oh-my-novel");
                            if (index !== -1) {
                                config.plugins.splice(index, 1);
                                fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
                                log("Removed oh-my-novel from opencode.json", "success");
                            }
                            else {
                                log("oh-my-novel not found in plugins array", "warning");
                            }
                        }
                    }
                    catch (error) {
                        log("Failed to update opencode.json: ".concat(error.message), "error");
                    }
                }
                if (!fs.existsSync(novelConfigFile)) return [3 /*break*/, 3];
                _a = options.purge;
                if (_a) return [3 /*break*/, 2];
                return [4 /*yield*/, confirm("Remove oh-my-novel.jsonc?")];
            case 1:
                _a = (_b.sent());
                _b.label = 2;
            case 2:
                if (_a) {
                    fs.unlinkSync(novelConfigFile);
                    log("Removed ".concat(novelConfigFile), "success");
                }
                _b.label = 3;
            case 3:
                if (options.purge) {
                    log("Removing all configuration files...", "info");
                    // Could remove entire config directory if oh-my-novel was the only plugin
                }
                log("", "info");
                log("✅ Uninstallation complete!", "success");
                log("", "info");
                log("Note: Session data and novel files remain intact.", "info");
                log("      Remove manually if desired.", "info");
                return [2 /*return*/];
        }
    });
}); });
// ============================================
// Error Handling
// ============================================
program.on("command:*", function (operands) {
    log("Unknown command: ".concat(operands[0]), "error");
    log("Run 'oh-my-novel-installer --help' for usage", "info");
    process.exit(1);
});
program.on("error", function (error) {
    log("Error: ".concat(error.message), "error");
    process.exit(1);
});
// ============================================
// Parse and Execute
// ============================================
program.parse(process.argv);
