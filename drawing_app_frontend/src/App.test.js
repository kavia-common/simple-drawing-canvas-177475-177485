import { render, screen } from '@testing-library/react';
import App from './App';

test('renders drawing app title', () => {
  render(<App />);
  const title = screen.getByText(/Simple Drawing Canvas/i);
  expect(title).toBeInTheDocument();
});

test('renders a canvas element', () => {
  render(<App />);
  const canvas = screen.getByRole('img', { name: /drawing canvas/i });
  expect(canvas).toBeInTheDocument();
});
