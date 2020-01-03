import { TSESTree, AST_NODE_TYPES, simpleTraverse } from '@typescript-eslint/typescript-estree';
import { findMethod } from './utils';

export class SourceBuilder {
  private _indent = '  ';
  private _indentCount = 0;
  private _lineBreak = '\n';
  private _source = '';

  public in() {
    ++this._indentCount;
  }

  public out() {
    --this._indentCount;
  }

  public addLine(line:string) {
    for(let i=0;i<this._indentCount;++i) {
      this._source += this._indent;
    }
    this._source += line;
    this._source += this._lineBreak;
  }

  public getSource() {
    return this._source;
  }
}

export function generateEventMessageInterface(builder:SourceBuilder,target:TSESTree.TSInterfaceDeclaration,method:string):void {  
  const name = method[0].toUpperCase()+method.substr(1);  
  const m = findMethod(target.body.body,name);
  if ( m === undefined ) {
    throw new Error('method not found');
  }
  /* TODO
  const returnT = m.getReturnTypeNode();
  if ( returnT === undefined ) {
    throw new Error('returnType node undefined');
  }
  if ( returnT.getKind() !== SyntaxKind.VoidKeyword ) {
    throw new Error('event interface does not allow non void return types');
  }
  builder.addLine(`interface ${name}Message {`);
  builder.in();
  parameterToInterface(builder,m.getParameters());
  builder.out();
  builder.addLine('}');
  */
}

/*
export function parameterToInterface(builder:SourceBuilder,param:ParameterDeclaration[]):void {
  param.forEach(p=>{
    builder.addLine(`${p.getFullText()};`);
  });
}
*/



