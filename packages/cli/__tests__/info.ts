import { Project, SyntaxKind, ClassDeclaration } from 'ts-morph';
import { loadProject } from '../src/generate';
import { findServiceInterface, findEventInterface } from '../src/utils';

const project:Project = loadProject(__dirname+'/tsconfig.json');
const dd = project.getPreEmitDiagnostics();
if ( dd.length>0) {
  console.log(project.formatDiagnosticsWithColorAndContext(dd));
  throw new Error('unable to initialize project');
}

test('find interfaces', async() => {
  const name = 'packages/cli/__tests__/common/plugin1.ts';
  const entryFile = project.getSourceFile(name);
  if ( !entryFile ) {
    throw new Error(`unable to getSourceFile: ${name}`);
  }
  
  const i = findEventInterface(entryFile);
  const s = findServiceInterface(entryFile);
  

  expect(i).toBe(entryFile.getInterface('Event'));
  expect(s).toBe(entryFile.getInterface('Service'));  
});


test('missing interface', async() => {
  const name = 'packages/cli/__tests__/common/missingEventInterface.ts';
  const entryFile = project.getSourceFile(name);
  if ( !entryFile ) {
    throw new Error(`unable to getSourceFile: ${name}`);
  }
 
  expect.assertions(1);
  try {
    const i = findEventInterface(entryFile);
  } catch(e){
    expect(e.toString()).toBe('Error: no event interface found');
    
  }
});

