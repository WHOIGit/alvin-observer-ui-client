// TEMPORARY review scaffolding for the crosspoint matrix.
//
// The backend does not yet expose the router's port labels together with the
// current routing, so this module provides representative static data so the
// matrix can be reviewed in `npm run dev` without a live backend. It is used
// only as a fallback when the store has no router ports (i.e. nothing is
// connected). Once suboptica emits the routing state this file can be removed
// and the fallback in RouterControls deleted.

// Values match the backend port ids (input1..input16 / output1..output16);
// labels mirror the deployment shown in the pilot UI.
export const MOCK_ROUTER_INPUTS = [
  { label: "BZBGEAR", value: "input1" },
  ...Array.from({ length: 15 }, (_, i) => ({
    label: `INPUT${i + 2}`,
    value: `input${i + 2}`,
  })),
];

export const MOCK_ROUTER_OUTPUTS = [
  { label: "PROXY_REC", value: "output1" },
  { label: "PORT_OBS_MON", value: "output2" },
  { label: "PRORES_REC", value: "output3" },
  ...Array.from({ length: 13 }, (_, i) => ({
    label: `OUTPUT${i + 4}`,
    value: `output${i + 4}`,
  })),
];

// A few active crosspoints, including one input feeding two outputs, to show
// the matrix handles fan-out cleanly.
export const MOCK_ROUTER_ROUTING = {
  output1: "input1",
  output2: "input1",
  output3: "input5",
  output6: "input2",
  output9: "input12",
};
