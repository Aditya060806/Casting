export default `import { createContext, useContext, useMemo, useState } from 'react';

const TemplateNameContext = createContext(undefined);

export function TemplateNameProvider({ children }) {
  const [value, setValue] = useState(null);

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
