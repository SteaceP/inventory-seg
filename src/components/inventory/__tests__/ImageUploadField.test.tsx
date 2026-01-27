import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ImageUploadField from "../ImageUploadField";

// Mock translation
import { createMockTranslation } from "../../../test/mocks";

const { t } = createMockTranslation();
vi.mock("../../../i18n", () => ({
  useTranslation: () => ({ t }),
}));

describe("ImageUploadField", () => {
  const defaultProps = {
    isAdmin: true,
    onUpload: vi.fn(),
    onRemove: vi.fn(),
    loading: false,
  };

  it("should render upload placeholder when no image provided", () => {
    render(<ImageUploadField {...defaultProps} />);
    expect(screen.getByText("inventory.image.clickOrDrop")).toBeInTheDocument();
    // Check if hidden input exists
    const input = document.getElementById(
      "image-upload-input"
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it("should render image when imageUrl is provided", () => {
    const imageUrl = "https://example.com/image.jpg";
    render(<ImageUploadField {...defaultProps} imageUrl={imageUrl} />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", imageUrl);

    // Should show remove button for admin
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should trigger input click when container is clicked (admin)", () => {
    render(<ImageUploadField {...defaultProps} />);
    const input = document.getElementById(
      "image-upload-input"
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");

    // Find the container (first child of the render)
    // Using a more robust way to find the clickable area
    const container = screen
      .getByText("inventory.image.clickOrDrop")
      .closest("div");
    fireEvent.click(container!); // Click the box

    expect(clickSpy).toHaveBeenCalled();
  });

  it("should trigger onRemove when remove button is clicked", () => {
    render(<ImageUploadField {...defaultProps} imageUrl="test.jpg" />);
    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);
    expect(defaultProps.onRemove).toHaveBeenCalled();
  });

  it("should trigger onUpload when file is selected", () => {
    render(<ImageUploadField {...defaultProps} />);
    const input = document.getElementById(
      "image-upload-input"
    ) as HTMLInputElement;
    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });
    expect(defaultProps.onUpload).toHaveBeenCalled();
  });

  it("should show loading spinner when loading is true", () => {
    render(<ImageUploadField {...defaultProps} loading={true} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should not allow interactions when not admin", () => {
    const props = { ...defaultProps, isAdmin: false };
    render(<ImageUploadField {...props} />);

    expect(screen.getByText("inventory.image.noImage")).toBeInTheDocument();

    const input = document.getElementById(
      "image-upload-input"
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    const container = screen
      .getByText("inventory.image.noImage")
      .closest("div");

    fireEvent.click(container!);
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
