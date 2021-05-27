import { Event } from '../../pyright-internal/node_modules/vscode-languageserver/lib/common/api';
import { ConfigOptions } from 'pyright-internal/common/configOptions';
import { createFromRealFileSystem } from 'pyright-internal/common/fileSystem';
import { ImportResolver } from 'pyright-internal/analyzer/importResolver';
import { Program } from 'pyright-internal/analyzer/program';
import glob from 'glob';
import { TreeVisitor } from './parseTreeVisitor';
import { ImportResult, ImportType } from 'pyright-internal/analyzer/importResult';
import { IndexResults } from 'pyright-internal/languageService/documentSymbolProvider';

const pyFiles = glob.sync('/home/noah/Python/mypy/**/*.py');
const configOpts = new ConfigOptions('/home/noah/Python/mypy');
/* const pyFiles = glob.sync('/home/noah/Python/PEPExamples/untyped.py');
const configOpts = new ConfigOptions('/home/noah/Python/PEPExamples'); */
configOpts.typeshedPath = '/home/noah/Sourcegraph/lsif-pyright/packages/pyright-internal/typeshed-fallback';
configOpts.checkOnlyOpenFiles = false;
configOpts.indexGenerationMode = true;
configOpts.indexing = true;
const importResolver = new ImportResolver(createFromRealFileSystem(), configOpts);
const program = new Program(importResolver, configOpts);
program.setTrackedFiles(pyFiles);

Error.stackTraceLimit = Infinity;

const thirdpartyFiles = new Set<string>();

program.indexWorkspace(
    (path: string, results: IndexResults) => {
        //console.log(path + '\n' + results.symbols.map((s) => JSON.stringify(s)));
        const parseResults = program.getSourceFile(path)?.getParseResults();
        const tree = parseResults?.parseTree;
        const typeEvaluator = program.evaluator;
        new TreeVisitor(program, typeEvaluator!!, path).walk(tree!!);
    },
    {
        isCancellationRequested: false,
        onCancellationRequested: Event.None,
    }
);

/* while (program.analyze()) {}
for (const file of pyFiles) {
    const parseResults = program.getSourceFile(file)?.getParseResults();
    const execEnv = configOpts.findExecEnvironment(file);
    for (const moduleImport of parseResults!!.importedModules) {
        const importResult = importResolver.resolveImport(file, execEnv, {
            leadingDots: moduleImport.leadingDots,
            nameParts: moduleImport.nameParts,
            importedSymbols: moduleImport.importedSymbols,
        });
        if (
            importResult.importType !== ImportType.ThirdParty ||
            (importResult.importType === ImportType.ThirdParty &&
                (importResult.isTypeshedFile || importResult.isStubFile))
        ) {
            continue;
        }
        const newThirdPartyFiles = new Set<string>();
        importResult.resolvedPaths.forEach((p) => newThirdPartyFiles.add(p));
        importResult.implicitImports.map((i) => i.path).forEach((p) => newThirdPartyFiles.add(p));
        importResult.filteredImplicitImports.map((i) => i.path).forEach((p) => newThirdPartyFiles.add(p));
        const intersection = new Set([...newThirdPartyFiles].filter((x) => thirdpartyFiles.has(x)));
        program.addTrackedFiles([...intersection]);
        while (program.analyze()) {}
        intersection.forEach((p) => newThirdPartyFiles.add(p));
    }
    //console.log(parseResults?.importedModules.map((m) => m.));
    const tree = parseResults?.parseTree;
    const typeEvaluator = program.evaluator;
    new TreeVisitor(program, typeEvaluator!!, file).walk(tree!!);
} */
