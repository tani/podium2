type Element = {
  kind: 'text';
  file: File;
  content: string;
} | {
  kind: 'head1';
  file: File;
  children: Element[];
}

interface File {
  offsetStart: number;
  offsetEnd: number;
  path: string | undefined;
  content: string
}

type State = 'sentinel' | 'head1' | 'text';

function text(file: File): Element {
  const content = file.content.substring(file.offsetStart, file.offsetEnd);
  return { kind: 'text', file, content }
}

function head1(file: File): Element {
  const offsetStart = file.offsetStart + '=head1'.length + 1;
  const children = parse({ ...file, offsetStart })
  return { kind: 'head1', file, children }
}

export function parse(file: File): Element[] {
  const result: Element[] = [];
  const stack: State[] = ['sentinel'];
  let offsetStart = 0;
  let offsetEnd = 1;
  for(const line of file.content.split('\n')) {
    offsetEnd += line.length;
    if (stack.at(-1) === 'head1') {
      if (line.startsWith('\n')) {
        stack.pop();
        result.push(head1({... file, offsetStart, offsetEnd}));
      }
    } else if (stack.at(-1) === 'text')  {
      if (line.startsWith('\n')) {
        stack.pop();
        result.push(text({... file, offsetStart, offsetEnd}));
      }
    } else if (line.startsWith('=head1')) {
      offsetStart = offsetEnd;
      stack.push('head1');
    } else {
      offsetStart = offsetEnd;
      stack.push('text');
    }
  }
  return result;
}
