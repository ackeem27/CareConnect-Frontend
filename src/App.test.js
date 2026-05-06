import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom');

test('renders App component without crashing', () => {
  render(<App />);
  const linkElements = screen.getAllByText(/CareConnect/i);
  expect(linkElements.length).toBeGreaterThan(0);
});
