import React, { act } from "react";
import { create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { ViewCubeOverlay } from "../src/lib/ViewCubeOverlay";

vi.mock("@react-three/fiber", () => ({
  useThree: () => ({ gl: { domElement: null } }),
}));

vi.mock("@react-three/drei", () => ({
  Html: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ViewCubeOverlay portal guard", () => {
  it("warns when portal parent is missing", async () => {
    const onWarn = vi.fn();
    await act(async () => {
      create(<ViewCubeOverlay onWarn={onWarn} />);
    });
    expect(onWarn).toHaveBeenCalledTimes(1);
    expect(String(onWarn.mock.calls[0][0])).toContain("portal parent");
  });
});
