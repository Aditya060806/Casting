export default `import { useCallback, useState } from 'react';

export function templatename() {
  const [value, setValue] = useState(null);

  const reset = useCallback(() => setValue(null), []);

  return { value, setValue, reset };
}
`;
