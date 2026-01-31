/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-redundant-type-constituents */
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

    // Cache to store mock components and prevent remounting
    const componentCache = new Map<string, React.ComponentType<any>>();

    // Helper to create a specific mock component for a tag
    const createMockComponent = (tag: string) => {
      if (componentCache.has(tag)) {
        return componentCache.get(tag)!;
      }

      const MockComponent = (
        {
          children,
          // Extract framer-motion specific props
          drag,
          dragConstraints: _dragConstraints,
          dragMomentum: _dragMomentum,
          whileHover: _whileHover,
          whileTap: _whileTap,
          initial: _initial,
          animate: _animate,
          exit: _exit,
          transition: _transition,
          variants: _variants,
          layout: _layout,
          ...props
        }: any & { ref?: React.Ref<any> }
        // We use props based ref for React 19 compatibility
      ) => {
        // We render a div or the specific tag?
        // Rendering the specific tag is better for semantics (button vs div)
        // Check if tag is a standard HTML tag
        const Component =
          tag === "create" || !tag.match(/^[a-z0-9]+$/) ? "div" : tag;

        return (
          <Component
            data-testid={`motion-mock-${tag}`}
            data-drag={drag ? "true" : undefined}
            data-drag-constraints={
              _dragConstraints ? JSON.stringify(_dragConstraints) : undefined
            }
            {...props}
          >
            {children}
          </Component>
        );
      };

      MockComponent.displayName = `MotionMock(${tag})`;
      componentCache.set(tag, MockComponent);
      return MockComponent;
    };

    // Create a proxy to handle motion.div, motion.span, etc.
    const motionProxy = new Proxy(
      (Component: any) => {
        return Component; // Handle motion(Component)
      },
      {
        get: (_target, prop: string) => {
          if (prop === "create") {
            return (Component: any) => Component;
          }
          return createMockComponent(prop);
        },
      }
    );

    return {
      ...actual,
      AnimatePresence: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
      motion: motionProxy,
    };
  });
};
