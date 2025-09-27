# Boldt Karate Runner

This is a fork for boldt of karate runner from Kirk Slota

Fork on version 1.2.5

Open/Run/Debug Karate Tests and Reports by leveraging Codelens, Activity Bar, Debugger and much more.

## Features

### Codelens

A `Karate: Run` and `Karate: Debug` `Codelens` will be added above each `Feature:`, `Scenario:` and `Scenario Outline:` within each feature file. Clicking on a Feature Codelens will run/debug all Scenario and Scenario Outlines within its feature file. Clicking on a Scenario or Scenario Outline Codelens will run/debug only that Scenario or Scenario Outline.

`Codelens` will additionally be shown when hovering over any row within an `Examples:` table for a `Scenario Outline:`. Clicking here will run/debug only the currently hovered over row.

### Activity Bar

A `Karate` `Activity Bar` will be added to VSCode. Clicking on the Activity Bar will reveal `Reports` and `Tests` views. Both views can be displayed as a `Flat` list or `Tree` structure. The `Tests` view can additionally be displayed in an aggregated `Tags` view. Clicking on a report within the `Reports` view will open it within the default program defined for its file type. Clicking on a test within the `Tests` view will open it for viewing within the VSCode Editor. Hovering over any node within the `Tests` view will provide a list of actions/buttons that can be clicked to run/debug/view tests.

_Note: Clicking `Run All Tests` will run all tests applicable to the given node type (Tag, Folder, File, Feature) in the `Tests` view regardless of the currently set filter. This is especially applicable when filtering by tag._

_Note: Tests annotated with the `@ignore` tag will be shown as `ignored` in the `Tests` view and will not be run._

### Debugger

`Karate` `Debug Configurations` will be added to `Debug/Run` `Activity Bar`. See `Setup > Debugger` section below for setup details. Starting the debugger after setup will enable you to use all debug controls to step through and debug your feature files.

### Smart Paste

A `Smart Paste` option will be added to detect paste operations into feature files. If a `curl` command is detected it will be transformed into Karate syntax and pasted into the VSCode Editor.

### Status Bar

A `Karate` `Status Bar` will be added to VSCode showing results for the last execution as well as the currently defined `karate.env` at setting `Karate Runner › Core: Environment`. The `Karate` `Status Bar` background will additionally be colored red when the last execution's failure percentage exceeds the defined threshold in Karate Runner settings. Clicking `Karate` `Status Bar` will reveal historical results executed from `Codelens` or `Karate` `Activity Bar`. Clicking historical results will re-execute the command which produced those results.

_Note this feature is dependent on Karate providing a results file under the root of your project._
_For Karate Version < 1.0 a file called results-json.txt_
_For Karate Version >= 1.0 a file called karate-summary-json.txt_

### Test Results (Karate 1.0 or greater)

Test Results will be shown for each `Feature:`, `Scenario:`, `Scenario Outline:` and parent folder in the `Tests` view. And will be shown for each `Feature:`, `Scenario:`, `Scenario Outline:` within each Feature file.

Test Results will be represented in three ways. By a Karate icon with a green dot (pass) or red dot (fail), with failure details on hover and finally a failure count showing how many failures are below each folder or file in the `Tests` view.

Failure details shown on hover will consist of a stack trace showing line-by-line execution. Each line will consist of an arrow showing execution direction and depth, the Karate code executed and a link to the file with the code that can be hovered over to show the error message and any arguments or clicked on to open the file. Finally a red dot will be shown on each line if it is the last line in the call chain to show the likely root cause of the failure.

Test Results are rolling results meaning they will accumulate and reset only when you click `Clear Results`.

_Note this feature is dependent on Karate Version >= 1.0 and Karate providing result files under the root of your project within a /karate-reports directory. Each file must end with a format of `.karate-json.txt`._

### Editor Menu Bar

A `Karate` `Editor Menu` will be added to the VSCode Editor Menu Bar for open feature files. The menu will have the following options:

- `Align Data Tables` to align delimiters (`|`) for all gherkin data tables
- `Clear Results` to clear test results from the gutter including from the `Tests` view
- `Open Settings` to open Karate Runner settings
- `Toggle Results In Gutter` to toggle showing or hiding test results within the gutter

### Peek

A `Peek` option will be added to the `Control-Click` or `Right-Click` context menu in the VSCode Editor. Clicking `Peek > Peek Definition` on a string or reference (or any combination of if concat'd) which equates to an existing file will display the contents of that file within an `Inline Peek Editor`.

_Note if the path being peeked starts with classpath: this extension will search recursively within the target project to find the file, searching first within `<project root>/src/test`, followed by `<project root>/src` and ending with `<project root>/`_

### Key Bindings

`Key Bindings` will be added to enable running Karate tests and Smart Paste from the keyboard.

`Smart Paste`

- Requirement: Open any file in VSCode Editor and ensure editor has focus.
- Windows: `Ctrl+V`
- Linux: `Ctrl+Shift+V`
- Mac: `Cmd+V`

`Run Karate Test`

- Requirement: Open a feature file in VSCode Editor and ensure a line associated with a test has cursor focus.
- Windows: `Ctrl+R+1`
- Linux: `Ctrl+Shift+R+1`
- Mac: `Cmd+R+1`

`Run All Karate Tests`

- Requirement: Open a feature file in VSCode Editor and ensure editor has focus.
- Windows: `Ctrl+R+A`
- Linux: `Ctrl+Shift+R+A`
- Mac: `Cmd+R+A`

_Note key bindings can be changed if desired by going to Menu > Preferences > Keyboard Shortcuts_

### Syntax Highlighting

`Syntax Highlighting` will be added to enable bracket pairing and coloring for the Karate language within .feature files. Additionally coloring will be enhanced within .js files to support Karate language integration.

_Note this is a work in progress as the Karate Language and VSCode Themes evolve._

### Intellisense

`Intellisense` will be added to the Karate `read()` command to enumerate all files in the same directory. Additionally if `<project root>/src/test/java`, `<project root>/src/test/resources` exist, all files within those directories will be enumerated. Finally entering `@` after the selected file will enumerate all tags within the file.

_Note suggested auto completion text from extensions like `Github Copilot` can interfere with this feature. This can typically be resolved by pressing the Escape key to clear the suggested text._

## Setup

### Versions

- `VSCode Version 1.83.0` or greater. (Required)
- `Karate Version 0.9.3` or greater in your Karate projects. (Required)
- `Karate Version 0.9.5` or greater in your Karate projects. (Required for Debugger or Karate Cli)
- `Karate Version 1.0.0` or greater in your Karate projects. (Required for Tests View results)

### This Extension

- Goto the following path to configure all workspace settings for this extension `Preferences > Settings > Search for Karate Runner` or click the gear icon in the header of the Tests View.

### Execution

- Ensure an `execution option` (`karate.jar`, `pom.xml (Maven)`, `build.gradle (Gradle Groovy)`, `build.gradle.kts (Gradle Kotlin)`, `package.json (NPM, Yarn, etc)`) exists at the root of your project.
- This extension will detect which `execution option` exists at your project root and execute the appropriate command.
- Note if an `execution option` is not specified this extension will still attempt to run the command provided at `Karate Runner › Karate Jar: Command Line Args`. This can be useful if you are using facilities such as `JBang`.
- Note if multiple `execution options` exist `karate.jar` will be favored and used first, followed by `pom.xml (Maven)`, then `build.gradle (Gradle Groovy)`, then `build.gradle.kts (Gradle Kotlin)` and lastly `package.json (NPM, Yarn, etc)`.

_Note Javascript package managers such as NPM, Yarn, etc are only supported on Mac and Linux at this time as there is currently an outstanding bug in Karate wherein Windows file paths are not supported._

### Debugger

_To setup from a feature file's Codelens_

- Click `Karate: Debug` Codelens in any feature file.
- Click `Karate (debug)` option from popup.
- Click `Add Configurations` in launch.json to edit configurations if needed.
  - Click `Karate (debug): Gradle` to add Gradle debug.
  - Click `Karate (debug): Maven` to add Maven debug.
- Edit debug configurations as needed.
  - Note `feature` property is always used to find project root if multiple projects are loaded in IDE.
  - Note `feature` property is also used by Karate Debug Server if `karateOptions` property is not set.
  - Recommend default value for `feature` property which dynamically finds opened feature files.
  - Note `karateOptions` is used by Karate Debug Server to enable advanced debugging and specify all Karate Options.
- Click `Debug` icon in Activity Bar to open debugger.
- Next to `Gear/Cog` icon expand dropdown and select debug configuration to use.
- See `### Gradle` section at the bottom if applicable.

_To setup from VSCode Debug/Run Activity_

- Click `Debug/Run` icon in Activity Bar to open debugger.
- Click `Gear/Cog` icon at the top.
- Follow same steps above for setting up from a feature file except for first Codelens step.

### Karate Docker Compose

- Open `Preferences > Settings > Search for Karate Runner`.
- Complete the `Karate docker compose command line...` command. This has priority over others runner (maven/gradle/js/karate jar)
- Karate runner inject karate.options and karate.env to the command line automatically letting use code lens and env settings

### Karate Cli

- Note [Karate Cli](https://github.com/karatelabs/karate/wiki/Debug-Server#karate-cli) is a work in progress feature to eliminate the need for Java files as runners.
- Open `Preferences > Settings > Search for Karate Runner`.
- Enable by adding check mark to `Karate Runner > Karate Cli: Override Karate Runner`.
- [Configure](https://github.com/karatelabs/karate/wiki/Debug-Server#karate-options) by setting `Karate Runner > Karate Cli: Command Line Args`.
- Note this extension will handle all Maven and Gradle commands and specifying the feature file(and line number if needed).
- See `### Gradle` section at the bottom if applicable.

### Karate Jar

- Open `Preferences > Settings > Search for Karate Runner`.
- [Configure](https://github.com/karatelabs/karate/tree/master/karate-netty#standalone-jar) the Karate Standalone Jar by setting `Karate Runner > Karate Jar: Command Line Args`.

### Gradle (If Applicable)

- Required for Debugger and Karate Cli.
- If using Groovy DSL:
  - Open `build.gradle` for target project.
  - Add the following task to `build.gradle`:
    ```java
    task karateExecute(type: JavaExec) {
        classpath = sourceSets.test.runtimeClasspath
        main = System.properties.getProperty('mainClass')
    }
    ```
- If using Kotlin DSL:
  - Open `build.gradle.kts` for target project.
  - Add the following task to `build.gradle.kts`:
    ```java
    tasks.register<JavaExec>("karateExecute") {
        classpath = sourceSets.test.get().runtimeClasspath
        main = System.getProperty("mainClass")
    }
    ```

### License

Licensed under the [MIT](LICENSE) license.

# Build this plugin (developers)

vsce package

## Install vsce

npm install -g @vscode/vsce
