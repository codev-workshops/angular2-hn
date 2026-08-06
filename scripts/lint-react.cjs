const Module = require('module');
const modernTypeScript = require('typescript-modern');
const originalLoad = Module._load;

Module._load = function load(request, parent, isMain) {
    if (request === 'typescript') {
        return modernTypeScript;
    }
    return originalLoad.call(this, request, parent, isMain);
};

const { ESLint } = require('eslint');

async function main() {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(['web', 'scripts']);
    const formatter = await eslint.loadFormatter('stylish');
    const output = formatter.format(results);
    if (output) {
        process.stdout.write(output);
    }
    if (results.some((result) => result.errorCount > 0 || result.fatalErrorCount > 0)) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
