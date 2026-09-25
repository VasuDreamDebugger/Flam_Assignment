import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PromptInput from "../../src/components/PromptInput";

describe("PromptInput Component", () => {
  const onChange = vi.fn();
  const onSubmit = vi.fn();

  it("renders controlled input with placeholder and label", () => {
    render(
      <PromptInput
        value="Plan a 3-day trip"
        onChange={onChange}
        onSubmit={onSubmit}
        loading={false}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: /Trip request/i });
    expect(textarea).toHaveValue("Plan a 3-day trip");
    expect(screen.getByLabelText(/Describe your trip/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate Itinerary/i }),
    ).toBeEnabled();
  });

  it("calls onChange when user types, including special characters and emoji", async () => {
    const user = userEvent.setup();

    render(
      <PromptInput
        value=""
        onChange={onChange}
        onSubmit={onSubmit}
        loading={false}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: /Trip request/i });
    await user.type(textarea, "Paris & Tokyo! ✈️ 🗼");

    expect(onChange).toHaveBeenCalled();
  });

  it("disables submit button when input is empty or whitespace-only", () => {
    const { rerender } = render(
      <PromptInput
        value=""
        onChange={onChange}
        onSubmit={onSubmit}
        loading={false}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Generate Itinerary/i }),
    ).toBeDisabled();

    rerender(
      <PromptInput
        value={"     \t    \n   "}
        onChange={onChange}
        onSubmit={onSubmit}
        loading={false}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Generate Itinerary/i }),
    ).toBeDisabled();
  });

  it("submits on form submit button click", async () => {
    const user = userEvent.setup();

    render(
      <PromptInput
        value="Goa vacation"
        onChange={onChange}
        onSubmit={onSubmit}
        loading={false}
      />,
    );

    const btn = screen.getByRole("button", { name: /Generate Itinerary/i });
    await user.click(btn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("submits on keyboard shortcut Ctrl+Enter and Cmd+Enter", async () => {
    const user = userEvent.setup();

    render(
      <PromptInput
        value="Kyoto temples"
        onChange={onChange}
        onSubmit={onSubmit}
        loading={false}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: /Trip request/i });
    await user.type(textarea, "{Control>}{Enter}{/Control}");
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.type(textarea, "{Meta>}{Enter}{/Meta}");
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("disables textarea and button and shows Generating… when loading is true", () => {
    render(
      <PromptInput
        value="Kyoto temples"
        onChange={onChange}
        onSubmit={onSubmit}
        loading={true}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: /Trip request/i });
    const btn = screen.getByRole("button", { name: /Generating…/i });

    expect(textarea).toBeDisabled();
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });
});
