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
export function generateEventMessageInterface(target: InterfaceDeclaration, method: string): string {
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
  const params = m.getParameters().map(p => p.getFullText());
  return `
    export interface ${name}Message {
      ${params.join(';\n')}
    }
  `
}



export function generateEventEmitter(target: InterfaceDeclaration):string {

  const methods:string[] = [];
  target.getMethods().forEach(m=>{
    const params = m.getParameters().map(p => p.getFullText());
    const name = upperName(m.getName());
    methods.push(`
      public ${name}(${params.join(', ')}): ${m.getReturnType().getText()} {
        const data:${m.getName()}Message = {
          ${params.join(',\n')}
        }
      }
    `);
  });
  return `
    export class ${target.getName()}Emitter implements ${target.getName()} {
      ${methods.join('\n')}
    }
  `;
}



