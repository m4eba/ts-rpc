import {
  MethodSignature,
  InterfaceDeclaration,
  SyntaxKind,
  ParameterDeclaration
} from "ts-morph";
import { upperName } from "./utils";




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
  // TODO remove annotations/comments and use .print()
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
    // TODO remove annotations/comments and use .print()
    const params = m.getParameters().map(p => p.getFullText());
    const name = upperName(m.getName());
    methods.push(`
      public ${m.getName()}(${params.join(', ')}): ${m.getReturnType().getText()} {
        const data:${name}Message = {
          ${m.getParameters().map(p=>p.getName()).join(',\n')}
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



