export default `import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

interface TemplateNameContextValue {
  value: unknown;
  setValue: (value: unknown) => void;
}

const TemplateNameContext = createContext<TemplateNameContextValue | undefined>(undefined);

export function TemplateNameProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<unknown>(null);

  const contextValue = useMemo(() => ({ value, setValue }), [value]);

  return <TemplateNameContext.Provider value={contextValue}>{children}</TemplateNameContext.Provider>;
}

export function useTemplateName() {
  const context = useContext(TemplateNameContext);

  if (context === undefined) {
    throw new Error('useTemplateName must be used within a TemplateNameProvider');
  }

  return context;
}
`;
