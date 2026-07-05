export default `import { render, screen } from '@testing-library/react';
import { TemplateNameProvider, useTemplateName } from './TemplateNameContext';

function Consumer() {
  const { value } = useTemplateName();

  return <span data-testid="value">{String(value)}</span>;
}

describe('TemplateNameContext', () => {
  test('provides context to consumers', () => {
    render(
      <TemplateNameProvider>
        <Consumer />
      </TemplateNameProvider>,
    );

    expect(screen.getByTestId('value')).toBeInTheDocument();
  });
});
`;
