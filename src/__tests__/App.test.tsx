import * as preact from 'preact';
const { h } = preact;

import { render, screen } from '@testing-library/preact';


// Моки
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key })
}));

jest.mock('@create-figma-plugin/ui', () => ({
  render: jest.fn(),
}));


// Импорт тестируемого компонента
import App from '../ui/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    const element = screen.getByText(/Tabs.list/i);
    expect(element).toBeInTheDocument();
  });
});
