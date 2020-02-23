import Util from 'util';
import fs from 'fs';

import { createDefaultFormatCodeSettings } from 'typescript-formatter/lib/utils';
import { format } from 'typescript-formatter/lib/formatter';

const writeFile = Util.promisify(fs.writeFile);

export async function write(fileName: string, text: string) {
  let settings = createDefaultFormatCodeSettings();
  settings.indentSize = 2;
  settings.newLineCharacter = '\n';
  let result = format(fileName, text, settings);
  await writeFile(fileName, result, { encoding: 'utf8' });
}
