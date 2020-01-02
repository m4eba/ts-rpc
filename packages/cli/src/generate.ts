import { Project } from 'ts-morph';

export function loadProject(tsConfigFilePath:string): Project {
  const result = new Project({
    tsConfigFilePath
  });

  
  return result;
}

