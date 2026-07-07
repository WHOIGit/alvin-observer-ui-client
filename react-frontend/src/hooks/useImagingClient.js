// React bindings for the imaging-client library. These hooks are the only
// bridge between the UI and the network layer: components get a station and
// issue semantic commands on it, and listeners subscribe to typed channels
// with plain callbacks. Nothing at this level knows the wire protocol.

import { useEffect, useMemo, useRef } from "react";
import { getSharedImagingClient } from "../lib/imaging-client";

export function useImagingClient() {
  return getSharedImagingClient();
}

// Keeps the latest callback in a ref so subscriptions survive re-renders
// without re-subscribing.
function useStableHandler(callback) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  return useMemo(
    () => (message) => {
      if (callbackRef.current) {
        callbackRef.current(message);
      }
    },
    []
  );
}

function makeStationChannelHook(channelName) {
  return function useStationChannel(observerSide, callback) {
    const client = useImagingClient();
    const handler = useStableHandler(callback);
    useEffect(
      () => client.station(observerSide)[channelName](handler),
      [client, observerSide, handler]
    );
  };
}

function makeClientChannelHook(channelName) {
  return function useClientChannel(callback) {
    const client = useImagingClient();
    const handler = useStableHandler(callback);
    useEffect(() => client[channelName](handler), [client, handler]);
  };
}

// Station-scoped channels
export const useCamHeartbeat = makeStationChannelHook("onCamHeartbeat");
export const useRecorderHeartbeat = makeStationChannelHook("onRecorderHeartbeat");
export const useConnectionStatus = makeStationChannelHook("onConnectionStatus");
export const useCameraList = makeStationChannelHook("onCameraList");
export const useRouterInputs = makeStationChannelHook("onRouterInputs");
export const useRouterOutputs = makeStationChannelHook("onRouterOutputs");
export const useCameraSettings = makeStationChannelHook("onCameraSettings");

// Like the other station-channel hooks, but with an optional stable predicate
// that filters results at the source (see Station.onCommandResult). Pass a
// module-level predicate so the subscription identity stays stable.
export function useCommandResult(observerSide, callback, shouldDeliver) {
  const client = useImagingClient();
  const handler = useStableHandler(callback);
  useEffect(
    () => client.station(observerSide).onCommandResult(handler, shouldDeliver),
    [client, observerSide, handler, shouldDeliver]
  );
}

// Vehicle-wide channels
export const useNavHeartbeat = makeClientChannelHook("onNavHeartbeat");
export const useSensorHeartbeat = makeClientChannelHook("onSensorHeartbeat");
export const useSystemMessage = makeClientChannelHook("onSystemMessage");
