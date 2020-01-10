import { SourceFile, ClassDeclaration, SyntaxKind, MethodDeclaration, PropertyDeclaration, InterfaceDeclaration } from "ts-morph";

export function upperName(name: string): string {
  if (name.length === 0) return name;
  return name[0].toUpperCase() + name.substr(1);
}

export function findServiceInterface(file:SourceFile):InterfaceDeclaration {
  const result = findInterface(file,'Service');

  if ( result === undefined )
    throw new Error('no service interface found');
  return result;
}

export function findEventInterface(file:SourceFile):InterfaceDeclaration {
  const result = findInterface(file,'Event');

  if ( result === undefined )
    throw new Error('no event interface found');
  return result;
}

export function findInterface(file:SourceFile,pattern:string):InterfaceDeclaration|undefined {
  return file.forEachChild( node=>{
    if (node.getKind() === SyntaxKind.InterfaceDeclaration) {
      const i = node as InterfaceDeclaration;
      if ( i.getName().endsWith(pattern) ) {
        return i;
      }
    }
    return undefined;
  });
}

