export default `import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import templatename from './templatename';

describe('<templatename />', () => {
  test('should mount', () => {
    render(<templatename />);

    const templateName = screen.getByTestId('templatename');

    expect(templateName).toBeInTheDocument();
  });
});`;
