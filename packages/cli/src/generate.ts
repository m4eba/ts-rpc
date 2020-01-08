import {
  MethodSignature,
  InterfaceDeclaration,
  SyntaxKind,
  ParameterDeclaration
} from "ts-morph";

import { SourceBuilder } from './builder';



function upperName(name: string): string {
  if (name.length === 0) return name;
  return name[0].toUpperCase() + name.substr(1);
}
export function generateEventMessageInterface(builder: SourceBuilder, target: InterfaceDeclaration, method: string): void {
  const name = upperName(method);
  const m = target.getMethod(method);
  if (m === undefined) {
    throw new Error('method not found');
  }
  const returnT = m.getReturnTypeNode();
  if (returnT === undefined) {
    throw new Error('returnType node undefined');
  }
  if (returnT.getKind() !== SyntaxKind.VoidKeyword) {
    throw new Error('event interface does not allow non void return types');
  }
  builder.addText(`export interface ${name}Message {`);
  builder.in();
  parameterToInterface(builder, m.getParameters());
  builder.out();
  builder.addText('}');
}

export function parameterToInterface(builder: SourceBuilder, param: ParameterDeclaration[]): void {
  param.forEach(p => {
    builder.addText(`${p.getFullText()};`);
  });
}

export function generateEventEmitter(builder: SourceBuilder, target: InterfaceDeclaration) {
  //builder.addText('import WebSocket from \'ws\';');
  builder.addText('');
  builder.addText(`export class ${target.getName()}Emitter implements ${target.getName()} {`);
  builder.in();
  //builder.addText('private _ws');

  target.getMethods().forEach(m => {
    const paramLine = m.getParameters().map(p => p.getFullText()).join(', ');
    const name = upperName(m.getName());
    builder.addText(`public ${name}(${paramLine}): ${m.getReturnType().getText()} {`);
    builder.in();
    builder.addText(`const data:${m.getName()}Message = {`);
    builder.in();
    const l = m.getParameters().length;
    m.getParameters().forEach((p, idx) => builder.addText(p.getName() + ((idx == l - 1) ? '' : ',')));
    builder.out();
    builder.addText('};');
    builder.out();
    builder.addText('}');
    builder.addText('');
  });

  builder.out();
  builder.addText('}');
}



