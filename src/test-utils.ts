import { render as preactRender, RenderOptions } from '@testing-library/preact'
import { h, JSX } from 'preact'

const customRender = (
  ui: JSX.Element,
  options: RenderOptions = {}
): ReturnType<typeof preactRender> => {
  return preactRender(ui, {
    wrapper: ({ children }: { children: JSX.Element }) => children,
    ...options,
  });
};

export * from '@testing-library/preact';
export { customRender as render };