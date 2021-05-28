import { Event } from '../../pyright-internal/node_modules/vscode-languageserver/lib/common/api';
import { ConfigOptions } from 'pyright-internal/common/configOptions';
import { createFromRealFileSystem } from 'pyright-internal/common/fileSystem';
import { ImportResolver } from 'pyright-internal/analyzer/importResolver';
import { Program } from 'pyright-internal/analyzer/program';
import glob from 'glob';
import { TreeVisitor } from './parseTreeVisitor';
import { ImportResult, ImportType } from 'pyright-internal/analyzer/importResult';
import { IndexResults } from 'pyright-internal/languageService/documentSymbolProvider';

import 'source-map-support/register';
import { ParseResults } from 'pyright-internal/parser/parser';

// const pyFiles = glob.sync('/home/noah/Netsoc/cloud/api/**/*.py');
// const configOpts = new ConfigOptions('/home/noah/Netsoc/cloud/api');
// const pyFiles = glob.sync('/home/noah/Python/transformers/**/*.py');
// const configOpts = new ConfigOptions('/home/noah/Python/transformers');
// const pyFiles = glob.sync('/home/noah/Python/mypy/**/*.py');
// const configOpts = new ConfigOptions('/home/noah/Python/mypy');
const pyFiles = glob.sync('/home/noah/Python/PEPexamples/asdf/*.py');
const configOpts = new ConfigOptions('/home/noah/Python/PEPexamples/');
configOpts.typeshedPath = '/home/noah/Sourcegraph/lsif-pyright/packages/pyright-internal/typeshed-fallback';
configOpts.checkOnlyOpenFiles = false;
configOpts.indexGenerationMode = true;
configOpts.indexing = true;
//configOpts.useLibraryCodeForTypes = true;
const importResolver = new ImportResolver(createFromRealFileSystem(), configOpts);
const program = new Program(importResolver, configOpts);
program.setTrackedFiles(pyFiles);

Error.stackTraceLimit = Infinity;

/* const indexResults: Array<{ path: string; results: ParseResults | undefined }> = [];

program.indexWorkspace(
    (path: string, results: IndexResults) => {
        const parseResults = program.getSourceFile(path)?.getParseResults();
        indexResults.push({ path: path, results: parseResults });
    },
    {
        isCancellationRequested: false,
        onCancellationRequested: Event.None,
    }
);

indexResults.forEach((o) => {
    const { path, results } = o;
    //console.log(path + '\n' + results.symbols.map((s) => JSON.stringify(s)));
    try {
        const tree = results?.parseTree;
        const typeEvaluator = program.evaluator;
        if (!tree) {
            console.log(`undefined module node for path ${path} ${tree} ${results}`);
            return;
        }
        new TreeVisitor(program, typeEvaluator!!, path).walk(tree!!);
    } catch (e) {
        console.error(e);
    }
}); */

program.analyze();
for (const file of pyFiles) {
    const parseResults = program.getSourceFile(file)?.getParseResults();
    const tree = parseResults?.parseTree;
    const typeEvaluator = program.evaluator;
    // new TreeVisitor(program, typeEvaluator!!, file).walk(tree!!);
}
