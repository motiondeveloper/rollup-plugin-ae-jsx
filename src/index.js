import { walk } from 'estree-walker';
import MagicString from 'magic-string';

const whitespace = /\s/;

// these will be removed
const disallowedNodeTypes = [
  'ExpressionStatement',
  'DebuggerStatement',
  'ImportDeclaration',
  'ExportNamedDeclaration',
];

// these will also be removed
const expressionGlobals = ['thisComp', 'thisLayer', 'thisProperty'];

export default function afterEffectsJsx(options = { wrap: false }) {
  const exports = [];
  const wrap = options.wrap;
  return {
    name: 'after-effects-jsx', // this name will show up in warnings and errors
    generateBundle(options = {}, bundle, isWrite) {
      // format each file to be ae-jsx
      for (const file in bundle) {
        // Get the string code of the file
        let code = bundle[file].code;
        // generate AST to walk through
        let ast;
        try {
          ast = this.parse(code);
        } catch (err) {
          err.message += ` in ${file}`;
          throw err;
        }
        // create magic string to perform operations on
        let magicString = new MagicString(code);

        // removes characters from the magicString
        function remove(start, end) {
          while (whitespace.test(code[start - 1])) start -= 1;
          magicString.remove(start, end);
        }

        function isBlock(node) {
          return (
            node && (node.type === 'BlockStatement' || node.type === 'Program')
          );
        }

        // removes entire statements
        function removeStatement(node) {
          const { parent } = node;

          if (isBlock(parent)) {
            remove(node.start, node.end);
          } else {
            magicString.overwrite(node.start, node.end, '(void 0);');
          }
        }

        // Find exports by looking for expressions
        // that are exports.[exportName] = [exportName];
        walk(ast, {
          enter(node, parent) {
            Object.defineProperty(node, 'parent', {
              value: parent,
              enumerable: false,
              configurable: true,
            });

            if (
              // it's an export expression statement
              node.type === 'ExportNamedDeclaration'
            ) {
              exports.push(
                ...node.specifiers.map((exportNode) => exportNode.local.name)
              );
            }
          },
        });

        if (wrap) {
          walk(ast, {
            enter(node, parent) {
              Object.defineProperty(node, 'parent', {
                value: parent,
                enumerable: false,
                configurable: true,
              });

              if (node.type === 'VariableDeclaration') {
                const variableName = node.declarations.map(
                  (declaration) => declaration.id.name
                )[0];
                if (expressionGlobals.includes(variableName)) {
                  // Remove variables that aren't exported
                  remove(node.start, node.end);
                }
                // don't process child nodes
                this.skip();
              } else if (disallowedNodeTypes.includes(node.type)) {
                // Remove every top level node that isn't
                // a function or variable, as they're not allowed
                removeStatement(node);
                this.skip();
              }
            },
          });

          magicString
            .prepend('function get() {\n')
            .append(`\nreturn {${exports.join(',\n\t')}}\n}`);

          const asString = format(magicString.toString()).replace(
            `function get() {`,
            `get() {`
          );

          magicString = new MagicString(asString);
        } else {
          // Remove non exported nodes and convert
          // to object property style compatible syntax
          walk(ast, {
            enter(node, parent) {
              Object.defineProperty(node, 'parent', {
                value: parent,
                enumerable: false,
                configurable: true,
              });

              if (node.type === 'FunctionDeclaration') {
                // Deal with functions
                const functionName = node.id.name;
                if (!exports.includes(functionName)) {
                  // Remove non-exported functions
                  remove(node.start, node.end);
                } else {
                  // remove the function keyword
                  magicString.remove(node.start, node.id.start);
                  // add a trailing comma
                  magicString.appendLeft(node.end, ',');
                }
                // don't process child nodes
                this.skip();
              } else if (node.type === 'VariableDeclaration') {
                // deal with variables
                const variableName = node.declarations.map(
                  (declaration) => declaration.id.name
                )[0];
                if (!exports.includes(variableName)) {
                  // Remove variables that aren't exported
                  remove(node.start, node.end);
                } else {
                  const valueStart = node.declarations[0].init.start;
                  const variableName = node.declarations[0].id.name;
                  // remove anything before the variable name
                  // e.g. const, var, let
                  magicString.overwrite(
                    node.start,
                    valueStart - 1,
                    `${variableName}:`
                  );
                  const endsInSemiColon =
                    magicString.slice(node.end - 1, node.end) === ';';
                  if (endsInSemiColon) {
                    // replace ; with ,
                    magicString.overwrite(node.end - 1, node.end, ',');
                  } else {
                    // or add trailing comma
                    magicString.appendLeft(node.end, ',');
                  }
                }
                // don't process child nodes
                this.skip();
              } else if (disallowedNodeTypes.includes(node.type)) {
                // Remove every top level node that isn't
                // a function or variable, as they're not allowed
                removeStatement(node);
                this.skip();
              }
            },
          });
        }

        // Log exports to the terminal
        console.log(`Exported JSX:`, exports);
        // Sanitize output and wrap in braces
        magicString.trim().prepend('{\n').append('\n}').indent().trimStart();
        // Replace the files code with modified
        bundle[file].code = magicString.toString();
      }
    },
  };
}

// extra: use ts to format... though currently not a dep of `rollup-plugin-ae-jsx`

// https://github.com/vvakame/typescript-formatter/tree/master/lib
import * as ts from 'typescript';

const defaultOptions = {
  baseIndentSize: 0,
  indentSize: 2,
  tabSize: 2,
  indentStyle: ts.IndentStyle.Smart,
  newLineCharacter: '\r\n',
  convertTabsToSpaces: true,
  insertSpaceAfterCommaDelimiter: true,
  insertSpaceAfterSemicolonInForStatements: true,
  insertSpaceBeforeAndAfterBinaryOperators: true,
  insertSpaceAfterConstructor: false,
  insertSpaceAfterKeywordsInControlFlowStatements: true,
  insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
  insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
  insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
  insertSpaceAfterTypeAssertion: false,
  insertSpaceBeforeFunctionParenthesis: false,
  placeOpenBraceOnNewLineForFunctions: false,
  placeOpenBraceOnNewLineForControlBlocks: false,
  insertSpaceBeforeTypeAnnotation: false,
};

class LanguageServiceHost {
  constructor() {
    this.files = {};
    // for ts.LanguageServiceHost
    this.getCompilationSettings = () => ts.getDefaultCompilerOptions();
    this.getScriptFileNames = () => Object.keys(this.files);
    this.getScriptVersion = (_fileName) => '0';
    this.getScriptSnapshot = (fileName) => this.files[fileName];
    this.getCurrentDirectory = () => process.cwd();
    this.getDefaultLibFileName = (options) => ts.getDefaultLibFilePath(options);
  }
  addFile(fileName, text) {
    this.files[fileName] = ts.ScriptSnapshot.fromString(text);
  }
}

function format(text, fileName = 'temp.ts', options = defaultOptions) {
  const host = new LanguageServiceHost();
  host.addFile(fileName, text);

  const languageService = ts.createLanguageService(host);
  const edits = languageService.getFormattingEditsForDocument(
    fileName,
    options
  );

  edits
    .sort((a, b) => a.span.start - b.span.start)
    .reverse()
    .forEach((edit) => {
      const head = text.slice(0, edit.span.start);
      const tail = text.slice(edit.span.start + edit.span.length);
      text = `${head}${edit.newText}${tail}`;
    });

  return text;
}
