import { afterEach, describe, expect, test } from "vitest";
import React from "react";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";

import cameraControlsReducer, {
  selectObserverSide,
  setObserverSide,
} from "../camera-controls/cameraControlsSlice";
import systemMessagesReducer from "../system-messages/systemMessagesSlice";
import ObserverDisplayChip from "./ObserverDisplayChip";
import { renderWithProviders } from "../../../tests/renderWithProviders";

afterEach(() => cleanup());

function makeStore(observerSide: string) {
  const store = configureStore({
    reducer: {
      cameraControls: cameraControlsReducer,
      systemMessages: systemMessagesReducer,
    },
  });
  store.dispatch(setObserverSide(observerSide));
  return store;
}

describe("ObserverDisplayChip", () => {
  test("renders the active side label", () => {
    const store = makeStore("P");
    renderWithProviders(<ObserverDisplayChip />, { store });
    expect(screen.getByText("PORT OBSERVER")).toBeTruthy();
  });

  test("opens a menu and switches the observer side", async () => {
    const user = userEvent.setup();
    const store = makeStore("P");
    renderWithProviders(<ObserverDisplayChip />, { store });

    await user.click(screen.getByText("PORT OBSERVER"));
    // Menu options appear; pick Starboard.
    const stbdOption = await screen.findByRole("menuitem", {
      name: /STBD OBSERVER/i,
    });
    await user.click(stbdOption);

    expect(selectObserverSide(store.getState())).toBe("S");
  });

  test("renders nothing for the pilot side", () => {
    const store = makeStore("PL");
    const { container } = renderWithProviders(<ObserverDisplayChip />, {
      store,
    });
    expect(container.firstChild).toBeNull();
  });
});
