import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '../../components/Sidebar';

describe('Sidebar', () => {
  test('메뉴 항목이 보여야 한다', () => {
    const mockPages = ['/staff', '/members'];
    render(
      <Sidebar
        currentPage="/staff"
        onPageChange={() => {}}
        pages={mockPages}
      />,
    );
    expect(screen.getByText('/staff')).toBeInTheDocument();
    expect(screen.getByText('/members')).toBeInTheDocument();
  });
});
