/**
 * Unit tests for TextField component
 * Tests rendering, props, and user interactions
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextField from '../../components/TextField';

describe('TextField Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<TextField label="Test" value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render label when provided', () => {
      render(<TextField label="Email" value="" onChange={() => {}} />);
      const label = screen.getByLabelText('Email');
      expect(label).toBeInTheDocument();
    });

    it('should render required indicator when required prop is true', () => {
      render(
        <TextField label="Password" required value="" onChange={() => {}} />
      );
      const required = screen.getByText('*');
      expect(required).toBeInTheDocument();
    });

    it('should render placeholder text', () => {
      render(
        <TextField
          label="Search"
          placeholder="Enter search term"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByPlaceholderText('Enter search term');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should display correct input type', () => {
      render(
        <TextField label="Password" type="password" value="" onChange={() => {}} />
      );
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should handle different input types', () => {
      const { rerender } = render(
        <TextField label="Email" type="email" value="" onChange={() => {}} />
      );
      let input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('type', 'email');

      rerender(
        <TextField label="Email" type="number" value="" onChange={() => {}} />
      );
      input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should disable input when disabled prop is true', () => {
      render(
        <TextField label="Test" disabled value="" onChange={() => {}} />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should apply custom className', () => {
      render(
        <TextField
          label="Test"
          className="custom-class"
          value=""
          onChange={() => {}}
        />
      );
      const container = screen.getByText('Test').closest('.text-field');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when provided', () => {
      render(
        <TextField
          label="Email"
          value=""
          error="Invalid email"
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('should not display error when not provided', () => {
      render(<TextField label="Email" value="" onChange={() => {}} />);
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange handler when input changes', () => {
      const handleChange = jest.fn();
      render(
        <TextField label="Test" value="" onChange={handleChange} />
      );
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'hello' } });
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur handler when input loses focus', () => {
      const handleBlur = jest.fn();
      render(
        <TextField label="Test" value="" onChange={() => {}} onBlur={handleBlur} />
      );
      const input = screen.getByRole('textbox');

      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should update input value', () => {
      render(
        <TextField label="Test" value="initial" onChange={() => {}} />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');
    });
  });
});
