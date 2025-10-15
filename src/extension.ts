import * as fs from "fs";
import * as path from "path";
import ProviderReports from "./providerReports";
import ProviderKarateTests from "./providerKarateTests";
import ProviderDebugAdapter from "./providerDebugAdapter";
import ProviderDebugConfiguration from "./providerDebugConfiguration";
import { ProviderResults } from "./providerResults";
import ProviderExecutions from "./providerExecutions";
import ProviderStatusBar from "./providerStatusBar";
import ProviderCodeLens from "./providerCodeLens";
import ProviderDefinition from "./providerDefinition";
import ProviderHoverRunDebug from "./providerHoverRunDebug";
import ProviderCompletionItem from "./providerCompletionItem";
import ProviderInlineCompletionItem from "./providerInlineCompletionItem";
import ProviderDecorations from "./providerDecorations";
import ProviderDocumentSymbol from "./providerDocumentSymbol";
import ProviderTelemetry from "./providerTelemetry";
import { ServiceLocalStorage } from "./serviceLocalStorage";
//import { ProviderOutputChannel } from "./providerOutputChannel";

import {
  smartPaste,
  getDebugPort,
  getDebugFile,
  getDebugBuildFile,
  debugKarateTest,
  runKarateTest,
  runAllKarateTests,
  runTagKarateTests,
  displayReportsTree,
  filterReportsTree,
  displayTestsTree,
  filterTestsTree,
  openExternalUri,
  openFileInEditor,
  moveLineUp,
  moveLineDown,
  cloneLine,
  deleteLine,
  openKarateSettings,
  toggleResultsInGutter,
  setEnvironment,
  alignDataTables,
} from "./commands";
import { createTreeViewWatcher, showWhatsNew } from "./helper";
import * as vscode from "vscode";

const reportsWatcher = null;
const karateTestsWatcher = null;
let telemetryProvider = null;

export function activate(context: vscode.ExtensionContext) {
  //showWhatsNew(context);
  //let outputChannelProvider = new ProviderOutputChannel();
  ServiceLocalStorage.initialize(context.globalState);
  telemetryProvider = new ProviderTelemetry(context);

  const resultsProvider = new ProviderResults();
  const reportsProvider = new ProviderReports();
  const karateTestsProvider = new ProviderKarateTests();
  const debugAdapterProvider = new ProviderDebugAdapter();
  const debugConfigurationProvider = new ProviderDebugConfiguration();
  const executionsProvider = new ProviderExecutions();
  const statusBarProvider = new ProviderStatusBar(context);
  const codeLensProvider = new ProviderCodeLens();
  const definitionProvider = new ProviderDefinition();
  const hoverRunDebugProvider = new ProviderHoverRunDebug(context);
  const completionItemProvider = new ProviderCompletionItem();
  const inlineCompletionItemProvider = new ProviderInlineCompletionItem();
  const decorationsProvider = new ProviderDecorations(context);
  const documentSymbolProvider = new ProviderDocumentSymbol();

  const karateFile = { language: "karate", scheme: "file" };

  const smartPasteCommand = vscode.commands.registerCommand(
    "karateRunner.paste",
    smartPaste
  );
  const getDebugPortCommand = vscode.commands.registerCommand(
    "karateRunner.getDebugPort",
    () => getDebugPort()
  );
  const getDebugFileCommand = vscode.commands.registerCommand(
    "karateRunner.getDebugFile",
    getDebugFile
  );
  const getDebugBuildFileCommand = vscode.commands.registerCommand(
    "karateRunner.getDebugBuildFile",
    getDebugBuildFile
  );
  const debugTestCommand = vscode.commands.registerCommand(
    "karateRunner.tests.debug",
    debugKarateTest
  );
  const debugAllCommand = vscode.commands.registerCommand(
    "karateRunner.tests.debugAll",
    debugKarateTest
  );
  const runTestCommand = vscode.commands.registerCommand(
    "karateRunner.tests.run",
    runKarateTest
  );
  const runAllCommand = vscode.commands.registerCommand(
    "karateRunner.tests.runAll",
    runAllKarateTests
  );
  const runTagCommand = vscode.commands.registerCommand(
    "karateRunner.tests.runTag",
    runTagKarateTests
  );
  const displayListReportsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.reports.displayList",
    () => displayReportsTree("List")
  );
  const displayTreeReportsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.reports.displayTree",
    () => displayReportsTree("Tree")
  );
  const displayListTestsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.tests.displayList",
    () => displayTestsTree("List")
  );
  const displayTreeTestsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.tests.displayTree",
    () => displayTestsTree("Tree")
  );
  const displayTagTestsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.tests.displayTag",
    () => displayTestsTree("Tag")
  );
  const openReportCommand = vscode.commands.registerCommand(
    "karateRunner.reports.open",
    openExternalUri
  );
  const refreshReportsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.reports.refreshTree",
    () => reportsProvider.refresh()
  );
  const refreshTestsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.tests.refreshTree",
    () => karateTestsProvider.refresh()
  );
  const filterReportsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.reports.filterTree",
    () => filterReportsTree(context)
  );
  const filterTestsTreeCommand = vscode.commands.registerCommand(
    "karateRunner.tests.filterTree",
    () => filterTestsTree(context)
  );
  const setEnvironmentCommand = vscode.commands.registerCommand(
    "karateRunner.tests.setEnvironment",
    () => setEnvironment()
  );
  const alignDataTablesCommand = vscode.commands.registerCommand(
    "karateRunner.editor.alignDataTables",
    () => alignDataTables()
  );
  const clearResultsCommand = vscode.commands.registerCommand(
    "karateRunner.tests.clearResults",
    () => {
      karateTestsProvider.clearResults();
      decorationsProvider.triggerUpdateDecorations();
      ProviderStatusBar.resetStatus();
    }
  );
  const openSettingsCommand = vscode.commands.registerCommand(
    "karateRunner.tests.openSettings",
    openKarateSettings
  );
  const toggleResultsInGutterCommand = vscode.commands.registerCommand(
    "karateRunner.editor.toggleResultsInGutter",
    toggleResultsInGutter
  );
  const openFileCommand = vscode.commands.registerCommand(
    "karateRunner.tests.open",
    openFileInEditor
  );
  const moveLineUpCommand = vscode.commands.registerCommand(
    "karateRunner.file.moveLineUp",
    moveLineUp
  );
  const moveLineDownCommand = vscode.commands.registerCommand(
    "karateRunner.file.moveLineDown",
    moveLineDown
  );
  const cloneLineCommand = vscode.commands.registerCommand(
    "karateRunner.file.cloneLine",
    cloneLine
  );
  const deleteLineCommand = vscode.commands.registerCommand(
    "karateRunner.file.deleteLine",
    deleteLine
  );

  const registerDebugAdapterProvider =
    vscode.debug.registerDebugAdapterDescriptorFactory(
      "karate",
      debugAdapterProvider
    );
  const registerDebugConfigurationProvider =
    vscode.debug.registerDebugConfigurationProvider(
      "karate",
      debugConfigurationProvider
    );
  const registerCodeLensProvider = vscode.languages.registerCodeLensProvider(
    karateFile,
    codeLensProvider
  );
  const registerDefinitionProvider =
    vscode.languages.registerDefinitionProvider(karateFile, definitionProvider);
  const registerProviderHoverRunDebug = vscode.languages.registerHoverProvider(
    karateFile,
    hoverRunDebugProvider
  );
  const registerCompletionItemProvider =
    vscode.languages.registerCompletionItemProvider(
      karateFile,
      completionItemProvider,
      ...["'", '"', "@", " "]
    );
  const registerDocumentSymbolProvider =
    vscode.languages.registerDocumentSymbolProvider(
      karateFile,
      documentSymbolProvider
    );

  createTreeViewWatcher(
    reportsWatcher,
    String(
      vscode.workspace
        .getConfiguration("karateRunner.reports")
        .get("toTargetByGlob")
    ),
    reportsProvider
  );

  createTreeViewWatcher(
    karateTestsWatcher,
    String(
      vscode.workspace
        .getConfiguration("karateRunner.tests")
        .get("toTargetByGlob")
    ),
    karateTestsProvider
  );

  vscode.workspace.onDidChangeConfiguration((e) => {
    const toggleResultsInGutter = e.affectsConfiguration(
      "karateRunner.editor.toggleResultsInGutter"
    );

    if (toggleResultsInGutter) {
      decorationsProvider.triggerUpdateDecorations();
    }

    const reportsDisplayType = e.affectsConfiguration(
      "karateRunner.reports.activityBarDisplayType"
    );
    const reportsToTarget = e.affectsConfiguration(
      "karateRunner.reports.toTargetByGlob"
    );

    if (reportsDisplayType) {
      reportsProvider.refresh();
    }

    if (reportsToTarget) {
      try {
        reportsWatcher.dispose();
      } catch (e) {
        // do nothing
      }

      createTreeViewWatcher(
        reportsWatcher,
        String(
          vscode.workspace
            .getConfiguration("karateRunner.reports")
            .get("toTargetByGlob")
        ),
        reportsProvider
      );
    }

    const karateTestsDisplayType = e.affectsConfiguration(
      "karateRunner.tests.activityBarDisplayType"
    );
    const karateTestsHideIgnored = e.affectsConfiguration(
      "karateRunner.tests.hideIgnored"
    );
    const karateTestsToTargetByGlob = e.affectsConfiguration(
      "karateRunner.tests.toTargetByGlob"
    );
    const karateTestsToTargetByTag = e.affectsConfiguration(
      "karateRunner.tests.toTargetByTag"
    );

    if (
      karateTestsDisplayType ||
      karateTestsHideIgnored ||
      karateTestsToTargetByTag
    ) {
      karateTestsProvider.refresh();
    }

    if (karateTestsToTargetByGlob) {
      try {
        karateTestsWatcher.dispose();
      } catch (e) {
        // do nothing
      }

      createTreeViewWatcher(
        karateTestsWatcher,
        String(
          vscode.workspace
            .getConfiguration("karateRunner.tests")
            .get("toTargetByGlob")
        ),
        karateTestsProvider
      );
    }
  });

  context.subscriptions.push(smartPasteCommand);
  context.subscriptions.push(getDebugPortCommand);
  context.subscriptions.push(getDebugFileCommand);
  context.subscriptions.push(getDebugBuildFileCommand);
  context.subscriptions.push(debugTestCommand);
  context.subscriptions.push(debugAllCommand);
  context.subscriptions.push(runTestCommand);
  context.subscriptions.push(runAllCommand);
  context.subscriptions.push(runTagCommand);
  context.subscriptions.push(displayListReportsTreeCommand);
  context.subscriptions.push(displayTreeReportsTreeCommand);
  context.subscriptions.push(displayListTestsTreeCommand);
  context.subscriptions.push(displayTreeTestsTreeCommand);
  context.subscriptions.push(displayTagTestsTreeCommand);
  context.subscriptions.push(openReportCommand);
  context.subscriptions.push(refreshReportsTreeCommand);
  context.subscriptions.push(refreshTestsTreeCommand);
  context.subscriptions.push(filterReportsTreeCommand);
  context.subscriptions.push(filterTestsTreeCommand);
  context.subscriptions.push(setEnvironmentCommand);
  context.subscriptions.push(alignDataTablesCommand);
  context.subscriptions.push(clearResultsCommand);
  context.subscriptions.push(openSettingsCommand);
  context.subscriptions.push(toggleResultsInGutterCommand);
  context.subscriptions.push(openFileCommand);
  context.subscriptions.push(moveLineUpCommand);
  context.subscriptions.push(moveLineDownCommand);
  context.subscriptions.push(cloneLineCommand);
  context.subscriptions.push(deleteLineCommand);
  context.subscriptions.push(registerDebugAdapterProvider);
  context.subscriptions.push(registerDebugConfigurationProvider);
  context.subscriptions.push(registerCodeLensProvider);
  context.subscriptions.push(registerDefinitionProvider);
  context.subscriptions.push(resultsProvider);
  context.subscriptions.push(registerProviderHoverRunDebug);
  context.subscriptions.push(registerCompletionItemProvider);
  context.subscriptions.push(registerDocumentSymbolProvider);

  registerHoverEnvProvider(context);

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("karateRunner.core.environment")) {
      vscode.window.showInformationMessage(
        "🌍 Environment updated — hover will now read new settings"
      );
    }
  });
}

export function deactivate() {
  telemetryProvider.dispose();
  reportsWatcher.dispose();
  karateTestsWatcher.dispose();
}

function registerHoverEnvProvider(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerHoverProvider(
    { pattern: "**/*.feature" },
    {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(
          position,
          /\b[A-Z0-9_]+\b/
        );
        if (!range) return;

        const variable = document.getText(range);
        const workspaceRoot =
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) return;

        // 🟢 Always read the current environment dynamically
        const config = vscode.workspace.getConfiguration("karateRunner.core");
        const envName = config.get("environment") || "dev-er";

        const basePath = vscode.workspace
          .getConfiguration("karateRunner.core")
          .get("environmentsPath", "src/test/resources/environments");

        const fullBasePath = path.join(workspaceRoot, basePath);

        const candidates = [
          path.join(fullBasePath, "global.json"),
          path.join(fullBasePath, "e2e-seed.json"),
          path.join(fullBasePath, `${envName}.json`),
        ];

        for (const filePath of candidates) {
          if (!fs.existsSync(filePath)) continue;

          try {
            const content = fs.readFileSync(filePath, "utf8");
            const json = JSON.parse(content);

            const findDeep = (obj: any): any => {
              if (typeof obj !== "object" || obj === null) return undefined;
              if (obj[variable] !== undefined) return obj[variable];
              for (const key of Object.keys(obj)) {
                const found = findDeep(obj[key]);
                if (found !== undefined) return found;
              }
              return undefined;
            };

            const value = findDeep(json);
            if (value !== undefined) {
              const formattedValue =
                typeof value === "string" && value.startsWith("http")
                  ? `[${value}](${value})`
                  : `\`${value}\``;

              const md = new vscode.MarkdownString(
                `**${variable}**\n\n${formattedValue}\n\n🌎 Environment: **${envName}**\n📁 _${path.relative(
                  workspaceRoot,
                  filePath
                )}_`
              );
              md.supportHtml = true;
              md.isTrusted = true;
              return new vscode.Hover(md);
            }
          } catch (err: any) {
            return new vscode.Hover(
              new vscode.MarkdownString(
                `❌ Error reading \`${path.basename(filePath)}\`:\n${
                  err.message
                }`
              )
            );
          }
        }

        const notFound = new vscode.MarkdownString(
          `⚠️ Variable **${variable}** not found in:\n- ${envName}.json\n- global.json\n- e2e-seed.json\n\n 📁 on path \`${basePath}\``
        );
        return new vscode.Hover(notFound);
      },
    }
  );

  context.subscriptions.push(provider);
}
