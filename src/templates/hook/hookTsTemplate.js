export default `import { useCallback, useState } from 'react';

export function templatename() {
  const [value, setValue] = useState<unknown>(null);

  const reset = useCallback(() => setValue(null), []);

  return { value, setValue, reset } as const;
}
`;
