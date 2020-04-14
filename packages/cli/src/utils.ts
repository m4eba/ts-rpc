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
  // TODO don't need this anymore?
  ['Event', 'Service'].forEach(e => {
    if (name.endsWith(e)) {
      name = name.substr(0, name.length - e.length);
    }
  });
  return `${name}.${method.getName()}`;
}

export function findInterfaces(
  file: SourceFile,
  pattern: Array<string>
): InterfaceDeclaration[] {
  const result: Array<InterfaceDeclaration> = [];

  const reg = pattern.map(p => RegExp(p));
  file.forEachDescendant((node, traversal) => {
    if (node.getKind() === SyntaxKind.InterfaceDeclaration) {
      const intf = node as InterfaceDeclaration;
      traversal.skip();
      for (let i = 0; i < reg.length; ++i) {
        if (reg[i].test(intf.getName())) {
          result.push(intf);
        }
      }
    }
    return undefined;
  });

  return result;
}

export function allInterfacesExcept(
  file: SourceFile,
  expect: InterfaceDeclaration[]
): InterfaceDeclaration[] {
  const result: Array<InterfaceDeclaration> = [];

  file.forEachDescendant((node, traversal) => {
    if (node.getKind() === SyntaxKind.InterfaceDeclaration) {
      const ni = node as InterfaceDeclaration;
      if (expect.indexOf(ni) < 0) {
        result.push(ni);
      }
      traversal.skip();
    }
  });
  return result;
}
