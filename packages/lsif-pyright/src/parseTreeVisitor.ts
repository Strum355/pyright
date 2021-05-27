import { ParseTreeWalker } from 'pyright-internal/analyzer/parseTreeWalker';
import { ClassNode, ModuleNode, NameNode, ParseNodeType } from 'pyright-internal/parser/parseNodes';
import { createTypeEvaluator, TypeEvaluator } from 'pyright-internal/analyzer/typeEvaluator';
import { Program } from 'pyright-internal/analyzer/program';
import { convertOffsetToPosition } from 'pyright-internal/common/positionUtils';
import { getFileInfo } from 'pyright-internal/analyzer/analyzerNodeInfo';
import { AnalyzerFileInfo } from 'pyright-internal/analyzer/analyzerFileInfo';
import { DocumentRange } from 'pyright-internal/common/textRange';
import { Event } from '../../pyright-internal/node_modules/vscode-languageserver/lib/common/api';
import { DefinitionFilter } from 'pyright-internal/languageService/definitionProvider';

export class TreeVisitor extends ParseTreeWalker {
  private fileInfo: AnalyzerFileInfo | undefined
  constructor(private program: Program, private evaluator: TypeEvaluator, private file: string) {
    super();
  }

  override visitModule(node: ModuleNode): boolean {
    this.fileInfo = getFileInfo(node)
    return true
  }

  override visitClass(node: ClassNode): boolean {
    /* console.log(node.name.value)
    console.log(this.evaluator.getTypeOfClass(node)) */
    return true
  }

  override visitName(node: NameNode): boolean {
    const token = { isCancellationRequested: false, onCancellationRequested: Event.None }
    const pos = convertOffsetToPosition(node.start, this.fileInfo!!.lines)
    
    //console.log(`${node.value} ${this.file} ${JSON.stringify(pos)}`)// + ' ' + node.token)

    {
      const defs = this.program.getDefinitionsForPosition(this.file, pos, DefinitionFilter.PreferSource, token)
      // if (defs == undefined) //console.log(this.file + ' ' + JSON.stringify(pos) + ' ' + node.value)
      //console.log(defs?.map(def => JSON.stringify(def)))
    }

    {
      const ranges: DocumentRange[] = []
      this.program.reportReferencesForPosition(this.file, pos, true, (l: DocumentRange[]): void => {
        ranges.push(...l)
      }, token)
      //console.log(ranges.map(range => JSON.stringify(range)))
    }
    {
      const hover = this.program.getHoverForPosition(this.file, pos, 'markdown', token)
      //console.log('HOVER ' + hover)
    }
    //console.log(this.evaluator.getType(node))
    return true
  }
}

