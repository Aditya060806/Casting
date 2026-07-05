export default `import { act, renderHook } from '@testing-library/react';
import { templatename } from './templatename';

describe('templatename', () => {
  test('should return the initial value', () => {
    const { result } = renderHook(() => templatename());

    expect(result.current.value).toBeNull();
  });

  test('should reset the value', () => {
    const { result } = renderHook(() => templatename());

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBeNull();
  });
});
`;
