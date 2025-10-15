import * as readline from "readline";
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import {
  isPortFree,
  getProjectDetail,
  getTestExecutionDetail,
  getActiveFeatureFile,
  IProjectDetail,
  ITestExecutionDetail,
  getLightIcon,
  getDarkIcon,
} from "./helper";
import { Feature, ISection } from "./feature";
import { ENTRY_TYPE } from "./types/entry";
import ProviderStatusBar from "./providerStatusBar";
import ProviderExecutions from "./providerExecutions";
import parse = require("parse-curl");
import * as vscode from "vscode";
import os = require("os");
import open = require("open");
import ProviderKarateTests from "./providerKarateTests";
import ProviderReports from "./providerReports";

let debugPortNumber: number = 0;
let debugLineNumber: number = 0;
let debugFeatureFile: string = "";
let responsePanel: vscode.WebviewPanel | undefined;

// 🧱 HTML base reutilizable
// const RESPONSE_VIEWER_HTML = `
// <!DOCTYPE html>
// <html lang="es">
// <head>
//   <meta charset="UTF-8">
//   <style>
//     body {
//       background-color: #0b0f14;
//       color: #e5e7eb;
//       font-family: system-ui, sans-serif;
//       margin: 0;
//       padding: 16px;
//     }
//     h2 { color: #60a5fa; margin-top: 0; }
//     pre {
//       background: #121820;
//       padding: 12px;
//       border-radius: 8px;
//       overflow-x: auto;
//       font-family: monospace;
//     }
//   </style>
// </head>
// <body>
//   <h2>🧩 Karate Response Viewer</h2>
//   <div id="status">Waiting...</div>
//   <div id="console" style="
//     margin-top:16px;
//     background:#0f172a;
//     border:1px solid #334155;
//     border-radius:6px;
//     padding:8px;
//     font-family:monospace;
//     font-size:12px;
//     height:200px;
//     overflow-y:auto;
//     white-space:pre-wrap;
//     color:#e5e7eb;
//   "></div>
//   <script>
//       const vscode = acquireVsCodeApi();

//       // Escucha mensajes enviados desde el extension host
//       window.addEventListener('message', event => {
//         const msg = event.data;
//         if (msg.command === 'console') {
//           const div = document.getElementById('console');
//           div.textContent += msg.text;
//           div.scrollTop = div.scrollHeight; // autoscroll
//         }
//       });
//     </script>
// </body>
// </html>
// `;

// async function showResult(e) {
//   if (
//     e.fsPath.endsWith("karate-summary-json.txt") ||
//     e.fsPath.endsWith("karate-summary.json")
//   ) {
//     try {
//       const content = await vscode.workspace.fs.readFile(e);
//       const json = JSON.parse(content.toString());
//       console.log("🧩 Karate Summary:", json);

//       // 🧱 Extraemos los datos principales (según nuevo formato)
//       const {
//         env,
//         version,
//         resultDate,
//         threads,
//         efficiency,
//         totalTime,
//         elapsedTime,
//         featuresPassed,
//         featuresFailed,
//         featuresSkipped,
//         scenariosPassed,
//         scenariosfailed,
//         featureSummary,
//       } = json;

//       const html = `
//         <div id="console" style="
//           margin-top:16px;
//           background:#0f172a;
//           border:1px solid #334155;
//           border-radius:6px;
//           padding:8px;
//           font-family:monospace;
//           font-size:12px;
//           height:200px;
//           overflow-y:auto;
//           white-space:pre-wrap;
//           color:#e5e7eb;
//         "></div>
//         <h2>🧩 Karate Test Summary</h2>
//         <table style="border-collapse:collapse;margin-top:8px;">
//           <tr><td><strong>Environment:</strong></td><td>${env || "-"}</td></tr>
//           <tr><td><strong>Version:</strong></td><td>${version || "-"}</td></tr>
//           <tr><td><strong>Date:</strong></td><td>${resultDate || "-"}</td></tr>
//           <tr><td><strong>Threads:</strong></td><td>${threads || 1}</td></tr>
//           <tr><td><strong>Efficiency:</strong></td><td>${(
//             efficiency || 0
//           ).toFixed(4)}</td></tr>
//           <tr><td><strong>Total Time:</strong></td><td>${
//             totalTime || 0
//           } ms</td></tr>
//           <tr><td><strong>Elapsed Time:</strong></td><td>${(
//             (elapsedTime || 0) / 1000
//           ).toFixed(2)} s</td></tr>
//         </table>

//         <h3 style="margin-top:20px;color:#60a5fa;">Results</h3>
//         <table style="border-collapse:collapse;margin-top:8px;width:100%;text-align:center;">
//           <thead>
//             <tr style="background:#1e293b;color:#e5e7eb;">
//               <th style="padding:6px;border-bottom:1px solid #374151;"></th>
//               <th style="padding:6px;border-bottom:1px solid #374151;">✅ Passed</th>
//               <th style="padding:6px;border-bottom:1px solid #374151;">❌ Failed</th>
//               <th style="padding:6px;border-bottom:1px solid #374151;">⏭ Ignored</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr style="background:#121820;color:#e5e7eb;">
//               <td style="padding:6px;border-bottom:1px solid #374151;text-align:left;"><strong>Features</strong></td>
//               <td style="padding:6px;border-bottom:1px solid #374151;">${
//                 featuresPassed || 0
//               }</td>
//               <td style="padding:6px;border-bottom:1px solid #374151;color:#f87171;">${
//                 featuresFailed || 0
//               }</td>
//               <td style="padding:6px;border-bottom:1px solid #374151;">${
//                 featuresSkipped || 0
//               }</td>
//             </tr>
//             <tr style="background:#121820;color:#e5e7eb;">
//               <td style="padding:6px;text-align:left;"><strong>Scenarios</strong></td>
//               <td style="padding:6px;">${scenariosPassed || 0}</td>
//               <td style="padding:6px;color:#f87171;">${
//                 scenariosfailed || 0
//               }</td>
//               <td style="padding:6px;">0</td>
//             </tr>
//           </tbody>
//         </table>
//       `;

//       const panel = showResponsePanel();
//       const htmlReport = e.fsPath.replace(
//         /karate-summary-json\.txt$/,
//         "karate-summary.html"
//       );
//       panel.webview.html = panel.webview.html.replace(
//         /<div id="status">.*<\/div>/,
//         `<div id="status">${html}</div>`
//       );
//     } catch (err) {
//       console.error("Error reading summary:", err);
//     }
//   }
// }

// function showResponsePanel(statusMessage = "Waiting...") {
//   const updateHtml = (panel: vscode.WebviewPanel, message: string) => {
//     // Simplemente actualiza un texto dentro del HTML
//     const updated = RESPONSE_VIEWER_HTML.replace("Waiting...", message);
//     panel.webview.html = updated;
//   };

//   if (responsePanel) {
//     // Si ya está abierta, reutilizarla
//     responsePanel.reveal(vscode.ViewColumn.Beside);
//     updateHtml(responsePanel, statusMessage);
//   } else {
//     // Crear una nueva si no existe
//     responsePanel = vscode.window.createWebviewPanel(
//       "karateResponse",
//       "Karate Response Viewer",
//       vscode.ViewColumn.Beside,
//       { enableScripts: true, retainContextWhenHidden: true }
//     );

//     updateHtml(responsePanel, statusMessage);

//     responsePanel.onDidDispose(() => {
//       responsePanel = undefined;
//     });
//   }

//   return responsePanel;
// }

async function showResult(e: vscode.Uri) {
  if (
    e.fsPath.endsWith("karate-summary-json.txt") ||
    e.fsPath.endsWith("karate-summary.json")
  ) {
    try {
      const content = await vscode.workspace.fs.readFile(e);
      const json = JSON.parse(content.toString());

      const panel = showResponsePanel();
      panel.webview.postMessage({
        command: "status",
        text: "✅ Karate summary loaded",
      });
      panel.webview.postMessage({
        command: "result-data",
        data: json,
      });
    } catch (err) {
      const panel = showResponsePanel();
      panel.webview.postMessage({
        command: "status",
        text: `❌ Error reading summary: ${err.message}`,
      });
    }
  }
}

function showResponsePanel(statusMessage = "Waiting...") {
  const extensionPath =
    vscode.extensions.getExtension("amperecode.boldt-karate-runner")
      ?.extensionPath || __dirname;
  const htmlPath = path.join(extensionPath, "media", "karateViewer.html");
  const htmlContent = fs.readFileSync(htmlPath, "utf8");

  if (responsePanel) {
    responsePanel.reveal(vscode.ViewColumn.Beside);
  } else {
    responsePanel = vscode.window.createWebviewPanel(
      "karateResponse",
      "Karate Viewer",
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    responsePanel.webview.html = htmlContent;

    responsePanel.onDidDispose(() => {
      responsePanel = undefined;
    });
  }

  // mostrar estado inicial
  responsePanel.webview.postMessage({ command: "status", text: statusMessage });
  return responsePanel;
}

// Authority (http://www.iana.org)
//
//      0-1023 - System Ports or Well Known Ports are assigned
//  1024-49151 - User Ports or Registered Ports are assigned
// 49152-65535 - Dynamic Ports or Private/Ephemeral Ports are unassigned and free for private use
async function getDebugPort(useCache: boolean = false): Promise<string> {
  const userPortNumber = Number(
    vscode.workspace.getConfiguration("karateRunner.debugger").get("serverPort")
  );
  if (userPortNumber >= 0) {
    debugPortNumber = userPortNumber;
    return userPortNumber.toString();
  }

  if (useCache) {
    return debugPortNumber.toString();
  }

  const PORT_MIN = 49152;
  const PORT_MAX = 65535;

  for (let port = PORT_MIN; port <= PORT_MAX; port++) {
    if (await isPortFree(port)) {
      debugPortNumber = port;
      return port.toString();
    }
  }

  throw "Ports unavailable in private class range: 49152-65535";
}

async function smartPaste() {
  const curlIgnores = [
    "accept-",
    "upgrade-",
    "user-",
    "connection",
    "referer",
    "sec-",
    "origin",
    "host",
    "content-length",
  ];

  const curlIgnoreHeader = (header: string) => {
    for (const ignore of curlIgnores) {
      if (header.toLowerCase().startsWith(ignore)) {
        return true;
      }
    }

    return false;
  };

  const convertCurl = (raw: string) => {
    const steps: Array<string> = [];
    raw = raw.replace("--data-binary", "--data");
    const curl: object = parse(raw);
    steps.push("* url '" + curl["url"] + "'");
    const headers: object = curl["header"] || {};

    for (const key of Object.keys(headers)) {
      if (curlIgnoreHeader(key)) {
        continue;
      }

      const val: string = headers[key];
      steps.push("* header " + key + " = '" + val + "'");
    }

    const method: string = curl["method"];
    let body = curl["body"];

    if (
      !body &&
      (method === "POST" || method === "PUT" || method === "PATCH")
    ) {
      body = "''";
    }

    if (body) {
      steps.push("* request " + body);
    }

    steps.push("* method " + method.toLowerCase());
    return steps.join("\n");
  };

  const editor = vscode.window.activeTextEditor;
  const start = editor.selection.start;

  vscode.commands
    .executeCommand("editor.action.clipboardPasteAction")
    .then(() => {
      const end = editor.selection.end;
      const selection = new vscode.Selection(
        start.line,
        start.character,
        end.line,
        end.character
      );
      const selectedText = editor.document.getText(selection).trim();

      if (selectedText.startsWith("curl")) {
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
          editBuilder.replace(selection, convertCurl(selectedText) + "\n");
          editor.revealRange(new vscode.Range(start, start));
        });
      }
    });
}

function getDebugFile() {
  const debugLine: string = debugLineNumber === 0 ? "" : `:${debugLineNumber}`;
  debugLineNumber = 0;

  const debugFile: string = debugFeatureFile;

  if (debugFile !== null) {
    return debugFile + debugLine;
  } else {
    return "";
  }
}

async function getDebugBuildFile() {
  let debugFile: string = debugFeatureFile;
  debugFeatureFile = "";

  if (debugFile === "") {
    debugFile = await getActiveFeatureFile();
  }

  if (debugFile !== null && debugFile !== "") {
    const projectDetail: IProjectDetail = getProjectDetail(
      vscode.Uri.file(debugFile),
      vscode.FileType.File
    );
    return projectDetail.runFile;
  } else {
    return "";
  }
}

async function runTagKarateTests(args) {
  args.karateOptions = `--tags ${args.tag}`;
  args.karateJarOptions = `-t ${args.tag}`;
  args.fileType = vscode.FileType.Directory;
  args.testUri = args.uri;
  runKarateTest([args]);
}

async function runAllKarateTests(args = null) {
  if (args === null) {
    const activeEditor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (
      activeEditor === undefined ||
      activeEditor.document.languageId !== "karate"
    ) {
      return;
    }

    args = { uri: activeEditor.document.uri, type: ENTRY_TYPE.FILE };
  }

  if (args.type !== ENTRY_TYPE.TEST) {
    const tedArray: ITestExecutionDetail[] = await getTestExecutionDetail(
      args.uri,
      args.type
    );
    const ted: ITestExecutionDetail = tedArray[0];

    if (ted === undefined) {
      return;
    }

    if (args.tag) {
      ted.karateOptions = `--tags ${args.tag} ${ted.karateOptions}`;
      ted.karateJarOptions = `-t ${args.tag} ${ted.karateJarOptions}`;
    }

    args = [];
    args[0] = {
      karateOptions: ted.karateOptions,
      karateJarOptions: ted.karateJarOptions,
      testUri: ted.testUri,
      fileType: ted.fileType,
    };
  }

  runKarateTest(args);
}

async function runKarateTest(args = null) {
  let karateRunner = null;

  const panel = showResponsePanel("Executing tests...");

  panel.webview.postMessage({
    command: "reset",
  });

  if (args === null) {
    const activeEditor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (
      activeEditor === undefined ||
      activeEditor.document.languageId !== "karate"
    ) {
      return;
    }

    const activeLine = activeEditor.selection.active.line;

    const feature: Feature = new Feature(activeEditor.document);
    const sections: ISection[] = feature.getTestSections();
    const activeSection = sections.find((section) => {
      return activeLine >= section.startLine && activeLine <= section.endLine;
    });

    if (activeSection === undefined) {
      return;
    }

    const tedArray: ITestExecutionDetail[] = await getTestExecutionDetail(
      activeEditor.document.uri,
      ENTRY_TYPE.FILE
    );
    const ted: ITestExecutionDetail = tedArray.find((ted) => {
      return ted.codelensLine === activeSection.startLine;
    });

    if (ted === undefined) {
      return;
    }

    args = {};
    args.karateOptions = ted.karateOptions;
    args.karateJarOptions = ted.karateJarOptions;
    args.testUri = activeEditor.document.uri;
    args.fileType = ted.fileType;
  } else {
    args = args.command ? args.command.arguments[0] : args[0];
  }

  let karateOptions = args.karateOptions;
  const karateJarOptions = args.karateJarOptions;
  const targetTestUri = args.testUri;
  const targetTestUriType = args.fileType;

  let mavenCmd = "mvn";
  let gradleCmd = "gradle";
  const mavenBuildFile = "pom.xml";
  const gradleGroovyBuildFile = "build.gradle";
  const gradleKotlinBuildFile = "build.gradle.kts";
  const javaScriptBuildFile = "package.json";
  const standaloneBuildFile = "karate.jar";
  const mavenBuildFileSwitch = "-f";
  const gradleBuildFileSwitch = "-b";
  const dockerComposeFile = "docker-compose.yml";

  let runPhases = null;
  let runCommandPrefix = null;
  let runCommand = null;

  const projectDetail: IProjectDetail = getProjectDetail(
    targetTestUri,
    targetTestUriType
  );
  const projectRootPath = projectDetail.projectRoot;
  const runFilePath = projectDetail.runFile;

  const karateEnv = String(
    vscode.workspace.getConfiguration("karateRunner.core").get("environment")
  ).trim();

  // PRIORIDAD: Docker Compose
  const karateDockerComposeCmd = String(
    vscode.workspace
      .getConfiguration("karateRunner.karateDockerCompose")
      .get("commandLine")
  );

  const folders = vscode.workspace.workspaceFolders;
  let projectPath = "";

  if (folders && folders.length > 0) {
    // Primer workspace abierto
    projectPath = folders[0].uri.fsPath.replace(/\\/g, "/");
    projectPath += projectPath.endsWith("/") ? "" : "/";
  }

  if (
    karateDockerComposeCmd &&
    karateDockerComposeCmd.trim() !== "" &&
    fs.existsSync(projectPath + dockerComposeFile)
  ) {
    const karateRunnerEnv =
      karateEnv === "" ? "" : `"-Dkarate.env=${karateEnv}"`;

    karateOptions = karateOptions.replace(/\\/g, "/");
    const resourcesIndex = karateOptions.indexOf("/src/test/resources/");
    if (resourcesIndex !== -1) {
      // recorto a partir de /features/...
      const relPath = karateOptions.substring(
        resourcesIndex + "/src/test/resources/".length
      );
      karateOptions = `classpath:${relPath}`;
    }

    karateOptions = !karateOptions ? "" : `"-Dkarate.options=${karateOptions}"`;

    runCommand =
      karateDockerComposeCmd.trim() + ` ${karateOptions} ${karateRunnerEnv}`;
  } else if (
    runFilePath !== "" &&
    !runFilePath.toLowerCase().endsWith(standaloneBuildFile)
  ) {
    if (!runFilePath.toLowerCase().endsWith(javaScriptBuildFile)) {
      if (
        vscode.workspace
          .getConfiguration("karateRunner.buildSystem")
          .get("useWrapper")
      ) {
        if (os.platform() == "win32") {
          mavenCmd = "mvnw";
          gradleCmd = "gradlew";
        } else {
          mavenCmd = "./mvnw";
          gradleCmd = "./gradlew";
        }
      }

      if (
        vscode.workspace
          .getConfiguration("karateRunner.buildDirectory")
          .get("cleanBeforeEachRun")
      ) {
        runPhases = "clean test";
      } else {
        runPhases = "test";
      }

      const karateRunnerEnv =
        karateEnv === "" ? "" : ` -Dkarate.env=${karateEnv}`;
      const karateRunnerArgs = String(
        vscode.workspace
          .getConfiguration("karateRunner.karateRunner")
          .get("commandLineArgs")
      );

      if (
        vscode.workspace
          .getConfiguration("karateRunner.karateCli")
          .get("overrideKarateRunner")
      ) {
        const karateCliArgs = String(
          vscode.workspace
            .getConfiguration("karateRunner.karateCli")
            .get("commandLineArgs")
        );

        if (karateCliArgs !== undefined && karateCliArgs !== "") {
          karateOptions = `${karateCliArgs} ${karateOptions}`;
        }

        if (runFilePath.toLowerCase().endsWith(mavenBuildFile)) {
          if (
            vscode.workspace
              .getConfiguration("karateRunner.buildDirectory")
              .get("cleanBeforeEachRun")
          ) {
            runPhases = "clean test-compile";
          } else {
            runPhases = "";
          }

          runCommand = `${mavenCmd} ${runPhases} ${mavenBuildFileSwitch} "${runFilePath}"`;
          runCommand += ` exec:java -Dexec.mainClass="com.intuit.karate.cli.Main" -Dexec.args="${karateOptions}"`;
          runCommand += ` -Dexec.classpathScope="test" ${karateRunnerArgs}${karateRunnerEnv}`;
        }

        if (
          runFilePath.toLowerCase().endsWith(gradleGroovyBuildFile) ||
          runFilePath.toLowerCase().endsWith(gradleKotlinBuildFile)
        ) {
          runCommand = `${gradleCmd} ${runPhases} ${gradleBuildFileSwitch} "${runFilePath}"`;
          runCommand += ` karateExecute -DmainClass="com.intuit.karate.cli.Main" --args="${karateOptions}"`;
          runCommand += ` ${karateRunnerArgs}${karateRunnerEnv}`;
        }

        if (runCommand === null) {
          return;
        }
      } else {
        if (
          vscode.workspace
            .getConfiguration("karateRunner.karateRunner")
            .get("promptToSpecify")
        ) {
          karateRunner = await vscode.window.showInputBox({
            prompt: "Karate Runner",
            value: String(
              vscode.workspace
                .getConfiguration("karateRunner.karateRunner")
                .get("default")
            ),
          });

          if (karateRunner !== undefined && karateRunner !== "") {
            await vscode.workspace
              .getConfiguration()
              .update("karateRunner.karateRunner.default", karateRunner);
          }
        } else {
          karateRunner = String(
            vscode.workspace
              .getConfiguration("karateRunner.karateRunner")
              .get("default")
          );
        }

        if (karateRunner === undefined || karateRunner === "") {
          return;
        }

        if (runFilePath.toLowerCase().endsWith(mavenBuildFile)) {
          runCommandPrefix = `${mavenCmd} ${runPhases} ${mavenBuildFileSwitch}`;

          if (runCommandPrefix === null) {
            return;
          }

          runCommand = `${runCommandPrefix} "${runFilePath}" -Dtest=${karateRunner} "-Dkarate.options=${karateOptions}" ${karateRunnerArgs}${karateRunnerEnv}`;
        }

        if (
          runFilePath.toLowerCase().endsWith(gradleGroovyBuildFile) ||
          runFilePath.toLowerCase().endsWith(gradleKotlinBuildFile)
        ) {
          runCommandPrefix = `${gradleCmd} ${runPhases} ${gradleBuildFileSwitch}`;

          if (runCommandPrefix === null) {
            return;
          }

          runCommand = `${runCommandPrefix} "${runFilePath}" --tests ${karateRunner} -Dkarate.options="${karateOptions}" ${karateRunnerArgs}${karateRunnerEnv}`;
        }
      }
    } else {
      const karateJSArgs = String(
        vscode.workspace
          .getConfiguration("karateRunner.karateJS")
          .get("commandLineArgs")
      );

      if (karateJSArgs === undefined || karateJSArgs === "") {
        return;
      }

      runCommand = `${karateJSArgs} "${karateOptions}"`;
    }
  } else {
    const karateJarEnv = karateEnv === "" ? "" : ` -e ${karateEnv}`;
    const karateJarArgs = String(
      vscode.workspace
        .getConfiguration("karateRunner.karateJar")
        .get("commandLineArgs")
    );

    if (karateJarArgs === undefined || karateJarArgs === "") {
      return;
    }

    runCommand = `${karateJarArgs} "${karateJarOptions}"${karateJarEnv}`;
  }

  const relativePattern = new vscode.RelativePattern(
    projectRootPath,
    String(
      vscode.workspace
        .getConfiguration("karateRunner.reports")
        .get("toTargetByGlob")
    )
  );
  const watcher = vscode.workspace.createFileSystemWatcher(relativePattern);
  const reportUrisFound: vscode.Uri[] = [];

  watcher.onDidCreate(async (e) => {
    if (reportUrisFound.toString().indexOf(e.toString()) === -1) {
      reportUrisFound.push(e);
    }
  });

  watcher.onDidChange((e) => {
    if (reportUrisFound.toString().indexOf(e.toString()) === -1) {
      reportUrisFound.push(e);
    }
  });

  // nwtachers for json/txt for view results

  let globPattern = String(
    vscode.workspace
      .getConfiguration("karateRunner.reports")
      .get("toTargetByGlob")
  );

  const lastDotIndex = globPattern.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    globPattern = globPattern.substring(0, lastDotIndex);
  }

  const extendedPattern = `${globPattern}.txt`;

  // Creamos el watcher extendido
  const watcherResult = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(projectRootPath, extendedPattern)
  );

  console.log(
    `projectRootPath: ${projectRootPath}, extendedPattern: ${extendedPattern}`
  );

  watcherResult.onDidCreate(async (e) => {
    showResult(e);
  });

  watcherResult.onDidChange((e) => {
    showResult(e);
  });

  const seo: vscode.ShellExecutionOptions = { cwd: projectRootPath };
  if (os.platform() == "win32") {
    seo.executable = "cmd.exe";
    seo.shellArgs = ["/d", "/c"];
  }

  setTimeout(() => {
    panel.webview.postMessage({
      command: "console",
      text: `$ ${runCommand}\n\n`,
    });
  }, 250);

  const child = child_process.spawn(runCommand, {
    cwd: projectRootPath,
    shell: true,
    env: process.env,
  });

  // 🔹 Capture block logic with auto-derived OFF command
  let capturingBlock = false;
  let captureTag = "Untitled";
  let captureBuffer = "";

  const rl = readline.createInterface({ input: child.stdout });

  // 🧩 Configurable commands
  const config = vscode.workspace.getConfiguration("karateRunner.core");
  const captureOnCmd = config.get("captureCommand", "CAPTURE-ON");
  let captureOffCmd = config.get("captureOffCommand", "");

  // 🔹 Auto-generate the OFF command if not explicitly provided
  if (!captureOffCmd) {
    if (captureOnCmd.toUpperCase().includes("ON")) {
      captureOffCmd = captureOnCmd.toUpperCase().replace("ON", "OFF");
    } else {
      captureOffCmd = "CAPTURE-OFF";
    }
  }

  const captureOnRegex = new RegExp(
    `\\b${captureOnCmd}(?:\\s+([A-Z0-9_-]+))?`,
    "i"
  );
  const captureOffRegex = new RegExp(`\\b${captureOffCmd}\\b`, "i");

  rl.on("line", (line) => {
    // eslint-disable-next-line no-control-regex
    const clean = line.replace(/\u001b\[[0-9;]*m/g, "").trim();

    panel.webview.postMessage({ command: "console", text: line + "\n" });

    // 🟢 Begin capture
    if (captureOnRegex.test(clean)) {
      const match = clean.match(captureOnRegex);
      captureTag = match?.[1] || "Untitled";
      capturingBlock = true;
      captureBuffer = "";

      panel.webview.postMessage({
        command: "console",
        text: `<span style="color:#60a5fa;">🟢 Capture started (${captureTag}) — waiting for ${captureOffCmd}</span>\n`,
      });
      return;
    }

    // 🔴 End capture
    if (captureOffRegex.test(clean)) {
      if (capturingBlock && captureBuffer.trim()) {
        panel.webview.postMessage({
          command: "capture",
          tag: captureTag,
          text: captureBuffer.trim(),
        });

        panel.webview.postMessage({
          command: "console",
          text: `<span style="color:#22c55e;">✅ Capture finished (${captureTag})</span>\n`,
        });
      }

      capturingBlock = false;
      captureTag = "Untitled";
      captureBuffer = "";
      return;
    }

    const sanitized = clean
      // quita timestamps + [INFO] [print]
      .replace(/^(\d{2}:\d{2}:\d{2}\.\d+)?\s*\[INFO\]\s*\[print\]\s*/g, "")
      // quita otros logs tipo [DEBUG], [WARN], etc.
      .replace(/^\[([A-Z]+)\]\s*/g, "")
      .trim();

    // Acumula solo si queda contenido útil
    if (capturingBlock && sanitized.length > 0) {
      captureBuffer += sanitized + "\n";
    }
    // // ✏️ While capturing, accumulate lines
    // if (capturingBlock) {
    //   captureBuffer += clean + "\n";
    // }
  });

  // // Captura stdout

  // let capturingResponse = false;
  // let buffer = "";

  // const rl = readline.createInterface({ input: child.stdout });

  // rl.on("line", (line) => {
  //   // 🔹 Limpia colores ANSI y espacios
  //   // eslint-disable-next-line no-control-regex
  //   const clean = line.replace(/\u001b\[[0-9;]*m/g, "").trim();

  //   // 🔹 Siempre mostrar en consola
  //   panel.webview.postMessage({ command: "console", text: line + "\n" });

  //   // 🔹 Detectar inicio
  //   if (clean.includes("--- begin response ---")) {
  //     capturingResponse = true;
  //     buffer = "";
  //     return;
  //   }

  //   // 🔹 Detectar fin
  //   if (clean.includes("--- end response ---")) {
  //     capturingResponse = false;

  //     try {
  //       // Limpieza avanzada: quita timestamps y [INFO] [print]
  //       const cleaned = buffer
  //         .split("\n")
  //         .map((l) =>
  //           l
  //             .replace(
  //               /^(\d{2}:\d{2}:\d{2}\.\d+)?\s*\[INFO\]\s*\[print\]\s*/,
  //               ""
  //             )
  //             .trim()
  //         )
  //         .filter((l) => l.length > 0)
  //         .join("\n")
  //         .trim();

  //       // Mostrar bloque crudo
  //       panel.webview.postMessage({
  //         command: "console",
  //         text: `<span style="color:#9ca3af;">🧾 Raw captured block:\n${cleaned}</span>\n`,
  //       });

  //       // Detectar el inicio real del JSON
  //       const startIdx = cleaned.search(/[{\[]/);
  //       if (startIdx === -1) throw new Error("Not a valid JSON block");
  //       const jsonText = cleaned.substring(startIdx);

  //       const json = JSON.parse(jsonText);

  //       // ✅ Mostrar en panel
  //       panel.webview.postMessage({
  //         command: "response",
  //         text: JSON.stringify(json, null, 2),
  //       });

  //       // ✅ Mostrar en consola (verde)
  //       panel.webview.postMessage({
  //         command: "console",
  //         text: `<span style="color:#16a34a;">📦 Captured Response:\n${JSON.stringify(
  //           json,
  //           null,
  //           2
  //         )}</span>\n\n`,
  //       });
  //     } catch (err) {
  //       // ❌ Error + bloque fallido
  //       panel.webview.postMessage({
  //         command: "console",
  //         text:
  //           `<span style="color:#f87171;">⚠️ Error parsing response: ${err.message}</span>\n` +
  //           `<span style="color:#fbbf24;">🪵 Raw block (unformatted):</span>\n${buffer}\n\n`,
  //       });
  //     }

  //     buffer = "";
  //     return;
  //   }

  //   // 🔹 Acumular solo mientras estamos dentro del bloque
  //   if (capturingResponse) {
  //     // ignorar líneas vacías
  //     if (!clean) return;
  //     buffer += clean + "\n";
  //   }
  // });

  // Captura stderr
  child.stderr.on("data", (data) => {
    const text = data.toString().replace(/\\x1b\\[[0-9;]*m/g, "");
    panel.webview.postMessage({ command: "console", text: `❌ ${text}` });
  });

  child.on("exit", (code) => {
    if (code === 0) {
      panel.webview.postMessage({
        command: "status",
        text: "✅ Finished successfully",
      });
    } else {
      panel.webview.postMessage({
        command: "status",
        text: `❌ Finished with errors (exit code ${code})`,
      });
    }
  });

  // Evento al cerrar el proceso
  child.on("close", (code) => {
    panel.webview.postMessage({
      command: "console",
      text: `\n🏁 Finished with exit code ${code}\n`,
    });
  });

  // const exec = new vscode.ShellExecution(runCommand, seo);
  // const task = new vscode.Task(
  //   { type: "karate" },
  //   vscode.TaskScope.Workspace,
  //   "Karate Runner",
  //   "karate",
  //   exec,
  //   []
  // );

  /*
	vscode.tasks.onDidStartTask((e) => 
	{
		if (e.execution.task.name == 'Karate Runner')
		{
		}
	});
	*/

  // vscode.tasks.onDidEndTask((e) => {
  //   if (e.execution.task.name == "Karate Runner") {
  //     ProviderStatusBar.setExecutionState(false);
  //     ProviderStatusBar.setStatus();
  //     isTaskExecuting = false;
  //     watcher.dispose();

  //     ProviderExecutions.addExecutionToHistory();
  //     ProviderExecutions.executionArgs = null;

  //     if (
  //       vscode.workspace
  //         .getConfiguration("karateRunner.reports")
  //         .get("openAfterEachRun")
  //     ) {
  //       reportUrisFound.forEach((reportUri) => {
  //         openExternalUri(reportUri);
  //       });
  //     }
  //   }

  //   reportUrisFound = [];
  // });

  // ProviderStatusBar.resetStatus();
  // ProviderExecutions.executionArgs = args;

  // const showProgress = (task: vscode.TaskExecution) => {
  //   vscode.window.withProgress(
  //     {
  //       location: { viewId: "karate-tests" },
  //       cancellable: false,
  //     },
  //     async (progress) => {
  //       await new Promise<void>((resolve) => {
  //         const interval = setInterval(() => {
  //           if (!isTaskExecuting) {
  //             clearInterval(interval);
  //             resolve();
  //           }
  //         }, 1000);
  //       });
  //     }
  //   );
  // };

  // const isTaskExecuting = true;
  // ProviderStatusBar.setExecutionState(true);
  // ProviderStatusBar.setStatus();

  // vscode.tasks.executeTask(task).then((task) => showProgress(task));
}

async function debugKarateTest(args = null) {
  if (args !== null) {
    args = args.command ? args.command.arguments[0] : args[0];

    debugFeatureFile = args.testUri.fsPath;
    debugLineNumber = args.debugLine;
  } else {
    debugFeatureFile = await getActiveFeatureFile();
    debugLineNumber = 0;
  }

  vscode.commands.executeCommand("workbench.action.debug.start");
}

function displayReportsTree(displayType) {
  vscode.workspace
    .getConfiguration()
    .update("karateRunner.reports.activityBarDisplayType", displayType);
}

async function filterReportsTree(context: vscode.ExtensionContext) {
  class InputButton implements vscode.QuickInputButton {
    constructor(
      public iconPath: { light: vscode.Uri; dark: vscode.Uri },
      public tooltip: string
    ) {}
  }

  const resetButton = new InputButton(
    {
      dark: vscode.Uri.file(getDarkIcon("refresh.svg")),
      light: vscode.Uri.file(getLightIcon("refresh.svg")),
    },
    "Reset Filter"
  );

  const filterByGlob = async () => {
    const disposables: vscode.Disposable[] = [];
    try {
      await new Promise<string>((resolve) => {
        const inputBox = vscode.window.createInputBox();
        inputBox.title = "Reports Filter";
        inputBox.step = 1;
        inputBox.totalSteps = 1;
        inputBox.value = String(
          vscode.workspace
            .getConfiguration("karateRunner.reports")
            .get("toTargetByGlob")
        );
        inputBox.prompt = "Filter By Glob (e.g. text, **/*.html)";
        inputBox.buttons = [...[resetButton]];
        disposables.push(
          inputBox.onDidTriggerButton((item) => {
            if (item === resetButton) {
              inputBox.value =
                context.extension.packageJSON.contributes.configuration.properties[
                  "karateRunner.reports.toTargetByGlob"
                ].default;
            }
          }),
          inputBox.onDidAccept(async () => {
            if (initialValue.trim() != inputBox.value.trim()) {
              inputBox.busy = true;
              inputBox.enabled = false;

              await new Promise((resolve) => {
                ProviderReports.onRefreshEnd(() => {
                  resolve(null);
                });

                vscode.workspace
                  .getConfiguration()
                  .update(
                    "karateRunner.reports.toTargetByGlob",
                    inputBox.value
                  );
              });
            }

            inputBox.enabled = true;
            inputBox.busy = false;
            inputBox.hide();
            resolve(null);
          }),
          inputBox.onDidHide(() => {
            resolve(null);
          })
        );

        const initialValue = inputBox.value;
        inputBox.show();
      });
    } finally {
      disposables.forEach((d) => d.dispose());
    }
  };

  await filterByGlob();
}

function displayTestsTree(displayType) {
  vscode.workspace
    .getConfiguration()
    .update("karateRunner.tests.activityBarDisplayType", displayType);
}

async function filterTestsTree(context: vscode.ExtensionContext) {
  class InputButton implements vscode.QuickInputButton {
    constructor(
      public iconPath: { light: vscode.Uri; dark: vscode.Uri },
      public tooltip: string
    ) {}
  }

  const resetButton = new InputButton(
    {
      dark: vscode.Uri.file(getDarkIcon("refresh.svg")),
      light: vscode.Uri.file(getLightIcon("refresh.svg")),
    },
    "Reset Filter"
  );

  const filterByGlob = async () => {
    const disposables: vscode.Disposable[] = [];
    let accepted = false;
    try {
      await new Promise<string>((resolve) => {
        const inputBox = vscode.window.createInputBox();
        inputBox.title = "Tests Filter";
        inputBox.step = 1;
        inputBox.totalSteps = 2;
        inputBox.value = String(
          vscode.workspace
            .getConfiguration("karateRunner.tests")
            .get("toTargetByGlob")
        );
        inputBox.prompt = "Filter By Glob (e.g. text, **/*.feature)";
        inputBox.buttons = [...[resetButton]];
        disposables.push(
          inputBox.onDidTriggerButton((item) => {
            if (item === resetButton) {
              inputBox.value =
                context.extension.packageJSON.contributes.configuration.properties[
                  "karateRunner.tests.toTargetByGlob"
                ].default;
            }
          }),
          inputBox.onDidAccept(async () => {
            if (initialValue.trim() != inputBox.value.trim()) {
              inputBox.busy = true;
              inputBox.enabled = false;

              await new Promise((resolve) => {
                ProviderKarateTests.onRefreshEnd(() => {
                  resolve(null);
                });

                vscode.workspace
                  .getConfiguration()
                  .update("karateRunner.tests.toTargetByGlob", inputBox.value);
              });
            }

            inputBox.enabled = true;
            inputBox.busy = false;
            accepted = true;
            resolve(null);
          }),
          inputBox.onDidHide(() => {
            resolve(null);
          })
        );

        const initialValue = inputBox.value;
        inputBox.show();
      });
    } finally {
      disposables.forEach((d) => d.dispose());

      if (accepted) {
        filterByTag();
      }
    }
  };

  const filterByTag = async () => {
    const disposables: vscode.Disposable[] = [];
    try {
      await new Promise<string>((resolve) => {
        const inputBox = vscode.window.createInputBox();
        inputBox.title = "Tests Filter";
        inputBox.step = 2;
        inputBox.totalSteps = 2;
        inputBox.value = String(
          vscode.workspace
            .getConfiguration("karateRunner.tests")
            .get("toTargetByTag")
        );
        inputBox.prompt = "Filter By Tags (e.g. @abc, @def=.+, @.+=.+)";
        inputBox.buttons = [
          ...[vscode.QuickInputButtons.Back],
          ...[resetButton],
        ];
        disposables.push(
          inputBox.onDidTriggerButton((item) => {
            if (item === vscode.QuickInputButtons.Back) {
              filterByGlob();
              resolve(null);
            }

            if (item === resetButton) {
              inputBox.value =
                context.extension.packageJSON.contributes.configuration.properties[
                  "karateRunner.tests.toTargetByTag"
                ].default;
            }
          }),
          inputBox.onDidAccept(async () => {
            if (initialValue.trim() != inputBox.value.trim()) {
              inputBox.busy = true;
              inputBox.enabled = false;

              await new Promise((resolve) => {
                ProviderKarateTests.onRefreshEnd(() => {
                  resolve(null);
                });

                vscode.workspace
                  .getConfiguration()
                  .update("karateRunner.tests.toTargetByTag", inputBox.value);
              });
            }

            inputBox.enabled = true;
            inputBox.busy = false;
            inputBox.hide();
            resolve(null);
          }),
          inputBox.onDidHide(() => {
            resolve(null);
          })
        );

        const initialValue = inputBox.value;
        inputBox.show();
      });
    } finally {
      disposables.forEach((d) => d.dispose());
    }
  };

  await filterByGlob();
}

function openExternalUri(uri) {
  openExternalUrl(`${uri.scheme}://${uri.authority}${uri.path}`);
}

function openExternalUrl(url) {
  open(url);
}

async function openFileInEditor(args) {
  args = args.command ? args.command.arguments[0] : args;

  if (args.testRange && args.testRange !== null) {
    vscode.window.showTextDocument(args.testUri, { selection: args.testRange });
  } else {
    if (args.testLine && args.testLine !== null) {
      const editor: vscode.TextEditor = await vscode.window.showTextDocument(
        args.testUri
      );
      const line: vscode.TextLine = editor.document.lineAt(args.testLine);
      const range: vscode.Range = new vscode.Range(
        args.testLine,
        line.firstNonWhitespaceCharacterIndex,
        args.testLine,
        line.text.length
      );
      editor.selection = new vscode.Selection(range.start, range.end);
      editor.revealRange(range);
    } else {
      vscode.window.showTextDocument(args.testUri);
    }
  }
}

function gotoLineNumber(args) {
  const editor = vscode.window.activeTextEditor;

  if (editor !== undefined) {
    const line = args[0];
    const lineText = editor.document.lineAt(line).text;
    const range = new vscode.Range(
      line,
      editor.document.lineAt(line).firstNonWhitespaceCharacterIndex,
      line,
      lineText.length
    );
    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range);
  }
}

function moveLineUp(args) {
  gotoLineNumber(args);
  vscode.commands.executeCommand("editor.action.moveLinesUpAction");
}

function moveLineDown(args) {
  gotoLineNumber(args);
  vscode.commands.executeCommand("editor.action.moveLinesDownAction");
}

function cloneLine(args) {
  gotoLineNumber(args);
  vscode.commands.executeCommand("editor.action.copyLinesDownAction");
}

function deleteLine(args) {
  gotoLineNumber(args);
  vscode.commands.executeCommand("editor.action.deleteLines");
}

function openKarateSettings() {
  vscode.commands.executeCommand(
    "workbench.action.openWorkspaceSettings",
    "Karate Runner"
  );
}

function toggleResultsInGutter() {
  const value = Boolean(
    vscode.workspace
      .getConfiguration("karateRunner.editor")
      .get("toggleResultsInGutter")
  );
  vscode.workspace
    .getConfiguration()
    .update("karateRunner.editor.toggleResultsInGutter", !value);
}

async function setEnvironment() {
  const env = await vscode.window.showInputBox({
    prompt: "Karate Environment",
    value: String(
      vscode.workspace.getConfiguration("karateRunner.core").get("environment")
    ),
  });

  if (env !== undefined) {
    await vscode.workspace
      .getConfiguration()
      .update("karateRunner.core.environment", env);
  }
}

function alignDataTables() {
  const preserveWhitespace = Boolean(
    vscode.workspace
      .getConfiguration("karateRunner.alignDataTables")
      .get("PreserveWhitespace")
  );
  const indent = Number(
    vscode.workspace
      .getConfiguration("karateRunner.alignDataTables")
      .get("Indent")
  );

  vscode.window.visibleTextEditors.forEach((editor) => {
    if (editor.document.languageId !== "karate") {
      return;
    }

    const edits: { range: vscode.Range; newLine: string }[] = [];
    const feature: Feature = new Feature(editor.document);
    const sections: ISection[] = feature.getTestSections();

    sections.forEach((section) => {
      const dataTableSections: ISection[] =
        feature.getDataTableSections(section);
      dataTableSections.forEach((dataTableSection) => {
        const columnWidths: number[] = [];
        let startIndex: number = -1;
        for (
          let line = dataTableSection.startLine;
          line <= dataTableSection.endLine;
          line++
        ) {
          const lineAt = editor.document.lineAt(line);
          const text = lineAt.text.trim();

          if (line == dataTableSection.startLine) {
            startIndex = lineAt.firstNonWhitespaceCharacterIndex + indent;
          }

          if (text.match(/^\|.+\|$/)) {
            const cells = text.split("|").slice(1, -1);
            cells.forEach((c, idx) => {
              let cell: string;
              if (preserveWhitespace) {
                cell = c;
              } else {
                cell = c.trim();
              }

              if (!columnWidths[idx] || cell.length > columnWidths[idx]) {
                columnWidths[idx] = cell.length;
              }
            });
          }
        }

        for (
          let line = dataTableSection.startLine;
          line <= dataTableSection.endLine;
          line++
        ) {
          const lineAt = editor.document.lineAt(line);
          const text = lineAt.text.trim();

          if (text.match(/^\|.+\|$/)) {
            const cells = text.split("|").slice(1, -1);
            let newLine = " ".repeat(startIndex) + "|";
            cells.forEach((c, idx) => {
              let newCell = c.trim();

              let cellWidth: number;
              if (preserveWhitespace) {
                cellWidth = columnWidths[idx] - newCell.length - 1;
              } else {
                cellWidth = columnWidths[idx] - newCell.length + 1;
              }

              newCell = ` ${newCell}`;
              newCell = newCell + " ".repeat(cellWidth);

              newLine += newCell + "|";
            });

            const range = new vscode.Range(line, 0, line, lineAt.text.length);
            edits.push({ range: range, newLine: newLine });
          }
        }
      });
    });

    editor.edit((editBuilder: vscode.TextEditorEdit) => {
      edits.forEach((edit) => {
        editBuilder.replace(edit.range, edit.newLine);
      });
    });
  });
}

export {
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
  openExternalUrl,
  openFileInEditor,
  gotoLineNumber,
  moveLineUp,
  moveLineDown,
  cloneLine,
  deleteLine,
  openKarateSettings,
  toggleResultsInGutter,
  setEnvironment,
  alignDataTables,
};
