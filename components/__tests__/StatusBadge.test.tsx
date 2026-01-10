import React from 'react';
import { render } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';
import { describe, it, expect } from 'vitest';

describe('StatusBadge', () => {
  it('renders correctly with confirmed status', () => {
    const { getByText } = render(<StatusBadge status="confirmed" />);
    expect(getByText('confirmed')).toBeTruthy();
  });

  it('renders correctly with pending status', () => {
    const { getByText } = render(<StatusBadge status="pending" />);
    expect(getByText('pending')).toBeTruthy();
  });

  it('renders with custom label', () => {
    const { getByText } = render(<StatusBadge status="active" label="En curso" />);
    expect(getByText('En curso')).toBeTruthy();
  });
});
