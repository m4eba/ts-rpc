import Path from 'path';
import { SourceFile, InterfaceDeclaration, SyntaxKind, TypeNode, ClassDeclaration, ImportDeclaration } from "ts-morph";


export interface Import {
  module: string;
  name: string;
  alias?: string;
  defaultImport?: boolean;
}

export function importFromInterface(path: string, target: InterfaceDeclaration): Import | undefined {
  if (!target.isExported()) {
    return undefined;
  }
  return {
    module: path,
    name: target.getName(),
    alias: undefined,
    defaultImport: target.isDefaultExport()
  }
}

export function importFromClass(path: string, target: ClassDeclaration): Import | undefined {
  if (!target.isExported()) {
    return undefined;
  }
  if (target.getName() === undefined) {
    console.log('cannot import anonymous class');
    process.exit(1);
  }
  return {
    module: path,
    name: target.getName()!,
    alias: undefined,
    defaultImport: target.isDefaultExport()
  }
}

function moduleFromImportDeclaration(path: string, imp: ImportDeclaration): string {
  const value = imp.getModuleSpecifierValue();
  if (value.length === 0) {
    throw new Error('module empty name!');
  }
  if (value[0] === '.') {
    return Path.relative(Path.dirname(path), value);
  } else {
    return value;
  }
}

export function searchImport(path: string, source: SourceFile, name: string): Import | undefined {
  const imports = source.getImportDeclarations();
  for (let i = 0; i < imports.length; ++i) {
    const imp = imports[i];

    // default export
    const def = imp.getDefaultImport();
    if (def !== undefined) {
      return {
        module: moduleFromImportDeclaration(path, imp),
        name,
        alias: undefined,
        defaultImport: true
      }
    }

    // named export
    const named = imp.getNamedImports();
    for (let ii = 0; ii < named.length; ++ii) {
      const nimp = named[ii];
      const alias = nimp.getAliasNode();
      if (alias != undefined) {
        if (alias.getText() === name) {
          return {
            module: moduleFromImportDeclaration(path, imp),
            name: nimp.getName(),
            alias: alias.getText(),
            defaultImport: false
          }
        }
      } else {
        if (nimp.getName() === name) {
          return {
            module: moduleFromImportDeclaration(path, imp),
            name: nimp.getName(),
            alias: undefined,
            defaultImport: false
          }
        }
      }
    } // named export

  }

  return undefined;
}

export function importsFromParams(path: string, source: SourceFile, target: InterfaceDeclaration): Import[] {
  let result: Import[] = [];
  let types: string[] = [];

  function addType(node: TypeNode) {
    if (node.getKind() === SyntaxKind.TypeReference) {
      const ident = node.getChildAtIndexIfKind(0, SyntaxKind.Identifier);
      if (ident === undefined) {
        console.log('ident undefined????');
        process.exit(1);
        return;
      }
      types.push(ident.getText());
      //console.log(node.getText());
      //console.log(ident.getText());
    }
  }
  target.getMethods().forEach(m => {
    const returnType = m.getReturnTypeNodeOrThrow();
    addType(returnType);
    m.getParameters().forEach(p => {
      const typeNode = p.getTypeNodeOrThrow();
      addType(typeNode);
    });
  });

  types.forEach(t => {

    // search for interfaces
    const intf = source.getInterface(t);
    if (intf != undefined) {
      const i = importFromInterface(path, intf);
      if (i === undefined) {
        console.log(`interface ${intf.getName()} is not exported but used in ${target.getName()} as parameter type`);
        process.exit(1);
        return;
      }
      result.push(i);
      return;
    }

    // search for class
    const classd = source.getClass(t);
    if (classd != undefined) {
      const c = importFromClass(path, classd);
      if (c === undefined) {
        console.log(`class ${classd.getName()} is not exported but used in ${target.getName()} as parameter type`);
        process.exit(1);
        return;
      }
      result.push(c);
      return;
    }

    // TODO support typedef

    // search in imports
    const i = searchImport(path, source, t);
    if (i !== undefined) {
      result.push(i);
      return;
    }

    // not found we assume it is a language type like Promise
  });
  return result;
}

export function writeImports(imports: Import[]): string {
  let result = '';
  // combine the imports by module
  let modules: Map<string, Import[]> = new Map();
  imports.forEach(i => {
    if (!modules.has(i.module)) {
      modules.set(i.module, [i]);
    } else {
      modules.get(i.module)!.push(i);
    }
  });

  function aliasName(i: Import): string {
    return i.alias !== undefined ? `${i.name} as ${i.alias}` : i.name;
  }
  modules.forEach((imports, name) => {
    const defaultImport = imports.find(i => i.defaultImport);
    const namedImportNames = imports.reduce<Set<string>>((r, i) => {
      if (!i.defaultImport)
        r.add(aliasName(i));
      return r;
    }, new Set<string>());
    let names: string[] = [];
    console.log('default import', defaultImport);
    console.log('named import', namedImportNames);
    if (defaultImport != undefined) {
      names.push(aliasName(defaultImport));
    }
    if (namedImportNames.size > 0) {
      names.push(`{${Array.from(namedImportNames).join(', ')}}`);
    }
    result += `import ${names.join(', ')} from '${name}';\n`;
  });
  return result;
}
