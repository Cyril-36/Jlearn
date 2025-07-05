import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // 👈 required for toBeInTheDocument()
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/CodeArena/i)).toBeInTheDocument();
  });
});
