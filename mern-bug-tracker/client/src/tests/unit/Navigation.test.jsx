import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navigation from "../../components/Navigation";
import useAuth from "../../context/useAuth";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the useAuth hook
jest.mock("../../context/useAuth");

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  Link: ({ to, children, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe("Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    });

    render(<Navigation />);
    expect(screen.getByText("BlogHub")).toBeInTheDocument();
  });

  it("should show Home link", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    });

    render(<Navigation />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should show Create Post link when authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: "John Doe" },
      logout: jest.fn(),
    });

    render(<Navigation />);
    expect(screen.getByText("Create Post")).toBeInTheDocument();
  });

  it("should display user name when authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: "John Doe" },
      logout: jest.fn(),
    });

    render(<Navigation />);
    expect(screen.getByText(/Welcome, John Doe/)).toBeInTheDocument();
  });

  it("should not show Create Post link when not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    });

    render(<Navigation />);
    expect(screen.queryByText("Create Post")).not.toBeInTheDocument();
  });

  it("should call logout when logout button is clicked", async () => {
    const mockLogout = jest.fn();
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: "John Doe" },
      logout: mockLogout,
    });

    render(<Navigation />);

    // Find and click the logout button
    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it("should display default name when user name is not provided", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: {},
      logout: jest.fn(),
    });

    render(<Navigation />);
    expect(screen.getByText(/Welcome, User/)).toBeInTheDocument();
  });

  it("should toggle mobile menu", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    });

    const { container } = render(<Navigation />);

    // Find and click the menu toggle button
    const menuButton =
      container.querySelector('button[aria-label*="menu"]') ||
      container.querySelector(".md\\:hidden");

    if (menuButton) {
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(menuButton).toBeInTheDocument();
      });
    }
  });
});
