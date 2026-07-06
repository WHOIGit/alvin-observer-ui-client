// React bindings for the imaging-client library. These hooks are the only
// bridge between the UI and the network layer: components get a station and
// issue semantic commands on it, and listeners subscribe to typed channels
// with plain callbacks. Nothing at this level knows the wire protocol.

import { useEffect, useMemo, useRef } from "react";
import { getSharedImagingClient } from "../lib/imaging-client";

export function useImagingClient() {
  return getSharedImagingClient();
}

/**
 * The station for an observer side ("P", "S", "PL", or a namespace-ish alias
 * like "port"). The station's connection is held open for the lifetime of
 * the calling component, so commands issued from event handlers reuse it.
 */
export function useImagingStation(observerSide) {
  const client = useImagingClient();
  const station = useMemo(
    () => client.station(observerSide),
    [client, observerSide]
  );

  useEffect(() => station.acquire(), [station]);

  return station;
}

// Keeps the latest callback in a ref so subscriptions survive re-renders
// without re-subscribing (mirrors the old useSocketListener behavior).
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
export const useCommandResult = makeStationChannelHook("onCommandResult");

// Vehicle-wide channels
export const useNavHeartbeat = makeClientChannelHook("onNavHeartbeat");
export const useSensorHeartbeat = makeClientChannelHook("onSensorHeartbeat");
export const useSystemMessage = makeClientChannelHook("onSystemMessage");
