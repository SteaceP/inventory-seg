import { vi } from "vitest";

/**
 * Centralized storage and file mocking utilities
 */

export const createMockFile = (
  name = "test.jpg",
  type = "image/jpeg",
  content = "mock file content"
) => {
  return new File([content], name, { type });
};

export const createMockBlob = (
  content = "mock blob content",
  type = "text/plain"
) => {
  return new Blob([content], { type });
};

export const createMockFileReader = () => {
  const mockReader = {
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    readAsArrayBuffer: vi.fn(),
    result: null as string | ArrayBuffer | null,
    error: null,
    onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
    onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  // Simulate successful read
  mockReader.readAsDataURL.mockImplementation(() => {
    mockReader.result = "data:image/jpeg;base64,mockBase64Data";
    setTimeout(() => {
      if (mockReader.onload) {
        mockReader.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  });

  return mockReader;
};

export const setupFileReaderMock = () => {
  global.FileReader = vi
    .fn()
    .mockImplementation(() =>
      createMockFileReader()
    ) as unknown as typeof FileReader;
};

export const createMockImageUploadEvent = (
  file?: File
): React.ChangeEvent<HTMLInputElement> => {
  const mockFile = file ?? createMockFile();
  return {
    target: {
      files: [mockFile],
    },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
};
