/**
 * Unit tests for Alert component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '../../components/Alert';

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render alert with message', () => {
      render(<Alert type="info" message="Test alert" />);
      expect(screen.getByText('Test alert')).toBeInTheDocument();
    });

    it('should render alert with role attribute', () => {
      render(<Alert type="success" message="Success" />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Alert Types', () => {
    it('should apply correct class for success alert', () => {
      render(<Alert type="success" message="Success" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-success');
    });

    it('should apply correct class for error alert', () => {
      render(<Alert type="error" message="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-error');
    });

    it('should apply correct class for warning alert', () => {
      render(<Alert type="warning" message="Warning" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-warning');
    });

    it('should default to info type', () => {
      render(<Alert message="Info" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-info');
    });

    it('should handle invalid alert type gracefully', () => {
      render(<Alert type="invalid" message="Test" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-info');
    });
  });

  describe('Close Button', () => {
    it('should render close button when onClose is provided', () => {
      render(<Alert type="info" message="Test" onClose={() => {}} />);
      const closeButton = screen.getByTestId('alert-close-button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should not render close button when onClose is not provided', () => {
      render(<Alert type="info" message="Test" />);
      const closeButton = screen.queryByTestId('alert-close-button');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <Alert type="info" message="Test" onClose={handleClose} />
      );
      const closeButton = screen.getByTestId('alert-close-button');

      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(
        <Alert
          type="info"
          message="Test"
          className="custom-alert"
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('should have both default and custom classes', () => {
      render(
        <Alert
          type="success"
          message="Test"
          className="custom"
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert');
      expect(alert).toHaveClass('alert-success');
      expect(alert).toHaveClass('custom');
    });
  });
});
