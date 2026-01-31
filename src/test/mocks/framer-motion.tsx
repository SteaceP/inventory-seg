/* eslint-disable @typescript-eslint/no-unused-vars */
import { vi } from "vitest";
import React from "react";

/**
 * Pre-configured vi.mock for framer-motion
 * Use this in test files that need framer-motion mocking to avoid
 * animation issues or generic component rendering problems.
 */
export const setupFramerMotionMock = (): void => {
  vi.mock("framer-motion", async (importOriginal) => {
    const actual = await importOriginal<typeof import("framer-motion")>();
    return {
      ...actual,
      AnimatePresence: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
      motion: {
        div: ({
          children,
          drag,
          dragConstraints: _dragConstraints,
          dragMomentum: _dragMomentum,
          whileHover: _whileHover,
          whileTap: _whileTap,
          initial: _initial,
          animate: _animate,
          exit: _exit,
          ...props
        }: {
          children?: React.ReactNode;
          drag?: boolean | string;
          dragConstraints?: unknown;
          dragMomentum?: unknown;
          whileHover?: unknown;
          whileTap?: unknown;
          initial?: unknown;
          animate?: unknown;
          exit?: unknown;
        } & React.HTMLAttributes<HTMLDivElement>) => (
          <div
            data-testid="motion-fab-wrapper"
            data-drag={drag ? "true" : "false"}
            {...props}
          >
            {children}
          </div>
        ),
        button: ({
          children,
          whileHover: _whileHover,
          whileTap: _whileTap,
          initial: _initial,
          animate: _animate,
          exit: _exit,
          ...props
        }: {
          children?: React.ReactNode;
          whileHover?: unknown;
          whileTap?: unknown;
          initial?: unknown;
          animate?: unknown;
          exit?: unknown;
        } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
          <button data-testid="motion-fab-button" {...props}>
            {children}
          </button>
        ),
      },
    };
  });
};
