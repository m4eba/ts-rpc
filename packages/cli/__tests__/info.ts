import { Project, ScriptTarget } from 'ts-morph';
import { findServiceInterface, findEventInterface } from '../src/utils';

function createProject() {
  const project: Project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2018,
    },
  });
  return project;
}

test('find interfaces', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface Event {}
  interface Service {}
  `
  );

  const i = findEventInterface(file);
  const s = findServiceInterface(file);

  expect(i).toBe(file.getInterface('Event'));
  expect(s).toBe(file.getInterface('Service'));
});

test('missing interface', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface MisspelledEventInterface {}
  interface Service {}
  `
  );

  expect.assertions(1);
  try {
    findEventInterface(file);
  } catch (e) {
    expect(e.toString()).toBe('Error: no event interface found');
  }
});
