
export interface SourceBuilderConfig {
  indentText: string;
  lineBreak: string;
  multilineFix: boolean;
}

export interface SourceBuilder {
  in(): void;
  out(): void;
  addText(text: string): void;
  addSourceBuilder(): SourceBuilder;
  build(): string;
  setMultilineFix(value: boolean): void;
}

interface LineBuilder {
  build(): string;
}

class Line implements LineBuilder {
  config: SourceBuilderConfig;
  indent: number;
  text: string;

  constructor(config: SourceBuilderConfig, indent: number, text: string) {
    this.config = config;
    this.indent = indent;
    this.text = this.fix(text);
  }

  // removes indentation from multiline template literals
  private fix(text: string): string {
    // remove first linebreak if any
    const firstLineBreak = /^[\n\r]+/.exec(text);
    if (firstLineBreak) {
      text = text.substr(firstLineBreak[0].length);
    }
    // get all spaces or tabs at the beginning of the first line
    const whitespaces = /^[ \t]*/.exec(text);
    if (whitespaces != null) {
      const lines = text.split('\n');
      const len = whitespaces[0].length;
      // remove the length the match from all other lines
      return lines.map(l => {
        // don't remove too much so test for whitespaces first
        const whitespace = /^[ \t]*/.exec(l);
        if (whitespace != null) {
          return l.substr(Math.min(whitespace[0].length, len));
        } else {
          return l;
        }
      }).join('\n');
    }

    return text;
  }

  public build(): string {
    let result = '';
    for (let i = 0; i < this.indent; ++i)
      result += this.config.indentText;
    result += this.text;
    return result;
  }
}


class SourceBuilderImpl implements SourceBuilder, LineBuilder {
  private config: SourceBuilderConfig;
  private indentCount = 0;
  private lines: LineBuilder[] = [];

  constructor(config: SourceBuilderConfig, indentCount: number = 0) {
    this.config = config;
    this.indentCount = indentCount;
  }

  public in() {
    ++this.indentCount;
  }

  public out() {
    --this.indentCount;
  }

  public addText(text: string) {
    this.lines.push(new Line(
      this.config,
      this.indentCount,
      text
    ));
  }

  public addSourceBuilder(): SourceBuilder {
    const builder = new SourceBuilderImpl(
      this.config,
      this.indentCount
    );
    this.lines.push(builder);
    return builder;
  }

  public build(): string {
    let source = '';
    this.lines.forEach((l, idx) => {
      if (idx > 0) source += this.config.lineBreak;
      source += l.build();
    });
    return source;
  }

  public setMultilineFix(value: boolean): void {
    this.config.multilineFix = value;
  }
}

export function createSourceBuilder(config?: SourceBuilderConfig): SourceBuilder {
  if (!config) {
    config = {
      indentText: '  ',
      lineBreak: '\n',
      multilineFix: true
    }
  }
  return new SourceBuilderImpl(config);
}


