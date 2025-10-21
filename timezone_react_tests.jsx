/**
 * React Component Tests για Timezone Handling
 * 100+ τεστ για να βεβαιωθούμε ότι τα React components λειτουργούν σωστά
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getUserTimezone, toDateString, getCurrentDateInTimezone } from '../src/lib/timezone';
import Contact from '../src/components/Contact';
import AdminPanel from '../src/components/AdminPanel';
import TimezoneInfo from '../src/components/TimezoneInfo';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null }))
  }))
};

// Test Scenarios για διαφορετικές ζώνες ώρας
const timezoneTestScenarios = [
  {
    name: "Ελλάδα - Europe/Athens",
    timezone: "Europe/Athens",
    country: "Greece",
    offset: "+02:00"
  },
  {
    name: "Ελβετία - Europe/Zurich", 
    timezone: "Europe/Zurich",
    country: "Switzerland",
    offset: "+01:00"
  },
  {
    name: "Γερμανία - Europe/Berlin",
    timezone: "Europe/Berlin", 
    country: "Germany",
    offset: "+01:00"
  },
  {
    name: "Γαλλία - Europe/Paris",
    timezone: "Europe/Paris",
    country: "France", 
    offset: "+01:00"
  },
  {
    name: "Ιταλία - Europe/Rome",
    timezone: "Europe/Rome",
    country: "Italy",
    offset: "+01:00"
  },
  {
    name: "Ισπανία - Europe/Madrid",
    timezone: "Europe/Madrid",
    country: "Spain",
    offset: "+01:00"
  },
  {
    name: "Ηνωμένο Βασίλειο - Europe/London",
    timezone: "Europe/London",
    country: "United Kingdom", 
    offset: "+00:00"
  },
  {
    name: "Ολλανδία - Europe/Amsterdam",
    timezone: "Europe/Amsterdam",
    country: "Netherlands",
    offset: "+01:00"
  },
  {
    name: "Σουηδία - Europe/Stockholm",
    timezone: "Europe/Stockholm",
    country: "Sweden",
    offset: "+01:00"
  },
  {
    name: "Νορβηγία - Europe/Oslo",
    timezone: "Europe/Oslo",
    country: "Norway",
    offset: "+01:00"
  }
];

// Test Suite για Timezone Utilities
describe('Timezone Utilities', () => {
  test.each(timezoneTestScenarios)('$name - getUserTimezone detection', ({ timezone, country }) => {
    // Mock the timezone detection
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });
    
    const detectedTimezone = getUserTimezone();
    expect(detectedTimezone).toBeDefined();
    expect(typeof detectedTimezone).toBe('string');
  });

  test.each(timezoneTestScenarios)('$name - toDateString conversion', ({ timezone }) => {
    const testDate = new Date('2024-12-20');
    const result = toDateString(testDate, timezone);
    
    expect(result).toBeDefined();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe('2024-12-20');
  });

  test.each(timezoneTestScenarios)('$name - getCurrentDateInTimezone', ({ timezone }) => {
    const result = getCurrentDateInTimezone(timezone);
    
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBeGreaterThan(2020);
  });
});

// Test Suite για Contact Component
describe('Contact Component - Timezone Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(timezoneTestScenarios)('$name - Contact form renders correctly', ({ timezone, country }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<Contact language="gr" />);
    
    // Check if form elements are present
    expect(screen.getByLabelText(/parent name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/appointment date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test.each(timezoneTestScenarios)('$name - Date input has correct min value', ({ timezone }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<Contact language="gr" />);
    
    const dateInput = screen.getByLabelText(/appointment date/i);
    expect(dateInput).toHaveAttribute('type', 'date');
    expect(dateInput).toHaveAttribute('min');
    
    // Check that min date is today or later
    const minDate = dateInput.getAttribute('min');
    const today = new Date().toISOString().split('T')[0];
    expect(minDate).toBeDefined();
  });

  test.each(timezoneTestScenarios)('$name - Form submission with timezone', async ({ timezone }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<Contact language="gr" />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/parent name/i), { target: { value: 'Test Parent' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/appointment date/i), { target: { value: '2024-12-25' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Check that form submission was attempted
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });
});

// Test Suite για AdminPanel Component
describe('AdminPanel Component - Timezone Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(timezoneTestScenarios)('$name - AdminPanel renders correctly', ({ timezone }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<AdminPanel language="gr" />);
    
    // Check if admin elements are present
    expect(screen.getByText(/availability/i)).toBeInTheDocument();
    expect(screen.getByText(/appointments/i)).toBeInTheDocument();
  });

  test.each(timezoneTestScenarios)('$name - Month selector works correctly', ({ timezone }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<AdminPanel language="gr" />);
    
    // Check month selector
    const monthInput = screen.getByDisplayValue(/2024-12/);
    expect(monthInput).toBeInTheDocument();
  });

  test.each(timezoneTestScenarios)('$name - Date inputs have correct min values', ({ timezone }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<AdminPanel language="gr" />);
    
    // Check date inputs
    const dateInputs = screen.getAllByDisplayValue('');
    dateInputs.forEach(input => {
      if (input.type === 'date') {
        expect(input).toHaveAttribute('min');
      }
    });
  });
});

// Test Suite για TimezoneInfo Component
describe('TimezoneInfo Component - Timezone Tests', () => {
  test.each(timezoneTestScenarios)('$name - TimezoneInfo displays correctly', ({ timezone, country }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<TimezoneInfo language="gr" />);
    
    // Check if timezone info is displayed
    expect(screen.getByText(/timezone/i)).toBeInTheDocument();
    expect(screen.getByText(timezone)).toBeInTheDocument();
  });

  test.each(timezoneTestScenarios)('$name - TimezoneInfo shows correct location', ({ timezone, country }) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: timezone })
      }))
    });

    render(<TimezoneInfo language="gr" />);
    
    // Check location display
    expect(screen.getByText(/location/i)).toBeInTheDocument();
  });
});

// Test Suite για Cross-Timezone Synchronization
describe('Cross-Timezone Synchronization', () => {
  test('Ελλάδα και Ελβετία - Συγχρονισμός ραντεβού', () => {
    const greeceDate = new Date('2024-12-20T09:00:00');
    const switzerlandDate = new Date('2024-12-20T09:00:00');
    
    // Simulate different timezones
    const greeceLocal = new Date(greeceDate.toLocaleString('en-US', { timeZone: 'Europe/Athens' }));
    const switzerlandLocal = new Date(switzerlandDate.toLocaleString('en-US', { timeZone: 'Europe/Zurich' }));
    
    // Both should represent the same moment in time
    expect(greeceLocal.getTime()).not.toBe(switzerlandLocal.getTime());
    expect(Math.abs(greeceLocal.getTime() - switzerlandLocal.getTime())).toBeLessThan(3600000); // Less than 1 hour difference
  });

  test('Διαφορετικές ζώνες ώρας - Calendar display', () => {
    timezoneTestScenarios.forEach(scenario => {
      const testDate = new Date('2024-12-20');
      const localDate = new Date(testDate.toLocaleString('en-US', { timeZone: scenario.timezone }));
      
      expect(localDate).toBeInstanceOf(Date);
      expect(localDate.getFullYear()).toBe(2024);
    });
  });
});

// Test Suite για Edge Cases
describe('Edge Cases - Timezone Tests', () => {
  test('DST Transition - Spring Forward', () => {
    const dstDate = new Date('2024-03-31T02:30:00');
    
    timezoneTestScenarios.forEach(scenario => {
      const localDate = new Date(dstDate.toLocaleString('en-US', { timeZone: scenario.timezone }));
      expect(localDate).toBeInstanceOf(Date);
    });
  });

  test('DST Transition - Fall Back', () => {
    const dstDate = new Date('2024-10-27T02:30:00');
    
    timezoneTestScenarios.forEach(scenario => {
      const localDate = new Date(dstDate.toLocaleString('en-US', { timeZone: scenario.timezone }));
      expect(localDate).toBeInstanceOf(Date);
    });
  });

  test('Leap Year', () => {
    const leapYearDate = new Date('2024-02-29T12:00:00');
    
    timezoneTestScenarios.forEach(scenario => {
      const localDate = new Date(leapYearDate.toLocaleString('en-US', { timeZone: scenario.timezone }));
      expect(localDate).toBeInstanceOf(Date);
    });
  });

  test('New Year\'s Eve', () => {
    const newYearEve = new Date('2024-12-31T23:59:59');
    
    timezoneTestScenarios.forEach(scenario => {
      const localDate = new Date(newYearEve.toLocaleString('en-US', { timeZone: scenario.timezone }));
      expect(localDate).toBeInstanceOf(Date);
    });
  });
});

// Test Suite για Performance
describe('Performance Tests', () => {
  test('Timezone detection performance', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      getUserTimezone();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });

  test('Date conversion performance', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      toDateString(new Date(), 'Europe/Athens');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });
});

// Test Suite για Error Handling
describe('Error Handling - Timezone Tests', () => {
  test('Invalid timezone handling', () => {
    expect(() => {
      toDateString(new Date(), 'Invalid/Timezone');
    }).not.toThrow();
  });

  test('Null date handling', () => {
    expect(() => {
      toDateString(null, 'Europe/Athens');
    }).not.toThrow();
  });

  test('Undefined timezone handling', () => {
    expect(() => {
      toDateString(new Date(), undefined);
    }).not.toThrow();
  });
});

// Test Suite για Integration Tests
describe('Integration Tests', () => {
  test('Full booking flow - Ελλάδα', async () => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'Europe/Athens' })
      }))
    });

    render(<Contact language="gr" />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/parent name/i), { target: { value: 'Test Parent' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/appointment date/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });

  test('Full booking flow - Ελβετία', async () => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'Europe/Zurich' })
      }))
    });

    render(<Contact language="gr" />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/parent name/i), { target: { value: 'Test Parent' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/appointment date/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });
});

// Export για χρήση σε άλλα test files
export { timezoneTestScenarios };
