import {
  SourceFile,
  SyntaxKind,
  InterfaceDeclaration,
  MethodSignature,
} from 'ts-morph';

export function upperName(name: string): string {
  if (name.length === 0) return name;
  return name[0].toUpperCase() + name.substr(1);
}

export function packagedMethodName(
  target: InterfaceDeclaration,
  method: MethodSignature
): string {
  let name = target.getName();
  ['Event', 'Service'].forEach(e => {
    if (name.endsWith(e)) {
      name = name.substr(0, name.length - e.length);
    }
  });
  return `${name}.${method.getName()}`;
}

export function findInterface(
  file: SourceFile,
  pattern: string
): InterfaceDeclaration | undefined {
  return file.forEachChild(node => {
    if (node.getKind() === SyntaxKind.InterfaceDeclaration) {
      const i = node as InterfaceDeclaration;
      if (i.getName().endsWith(pattern)) {
        return i;
      }
    }
    return undefined;
  });
}

export function findServiceInterface(file: SourceFile): InterfaceDeclaration {
  const result = findInterface(file, 'Service');

  if (result === undefined) throw new Error('no service interface found');
  return result;
}

export function findEventInterface(file: SourceFile): InterfaceDeclaration {
  const result = findInterface(file, 'Event');

  if (result === undefined) throw new Error('no event interface found');
  return result;
}
