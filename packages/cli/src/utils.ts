import { TSESTree, AST_NODE_TYPES, simpleTraverse, TSNode } from '@typescript-eslint/typescript-estree';


export function findServiceInterface(ast:TSESTree.Program):TSESTree.TSInterfaceDeclaration {
  const result = findInterface(ast,'Service');

  if ( result === undefined )
    throw new Error('no service interface found');
  return result;
}

export function findEventInterface(ast:TSESTree.Program):TSESTree.TSInterfaceDeclaration {
  const result = findInterface(ast,'Event');

  if ( result === undefined )
    throw new Error('no event interface found');
  return result;
}

function findInterface(ast:TSESTree.Program,pattern:string):TSESTree.TSInterfaceDeclaration|undefined {
  let result: TSESTree.TSInterfaceDeclaration|undefined = undefined;
  simpleTraverse(ast,{
    enter:(node: TSESTree.Node, parent: TSESTree.Node | undefined):void => {
      if ( node.type === AST_NODE_TYPES.TSInterfaceDeclaration ) {
        const decl = node as TSESTree.TSInterfaceDeclaration;
        if ( decl.id.name === pattern ) {
          result = decl;
        }
      }
    }
  });
  return result;
}

export function findMethod(ast:TSESTree.Node[],name:string):TSESTree.TSMethodSignature|undefined {
  for(let i=0;i<ast.length;++i) {
    if ( ast[i].type === AST_NODE_TYPES.TSMethodSignature ) {
      const method = ast[i] as TSESTree.TSMethodSignature;
      if (method.key.type === AST_NODE_TYPES.Identifier ) {
        const key = method.key as TSESTree.Identifier;
        if ( key.name === name ) {
          return method;
        }
      }
    }
  }
  return undefined;
}