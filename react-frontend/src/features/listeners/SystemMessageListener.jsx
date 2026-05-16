import React, { useCallback } from "react";
import { useSocketListener } from "../../hooks/useSocket";

const SYSTEM_MESSAGE_EVENT = "SystemMessage";

// Holds open a socket to the v1.5 /system namespace and logs every
// incoming SystemMessage. Renders nothing.
export default function SystemMessageListener() {
  const handleMessage = useCallback((message) => {
    // eslint-disable-next-line no-console
    console.log("[SystemMessage]", message);
  }, []);

  useSocketListener("/system", SYSTEM_MESSAGE_EVENT, handleMessage, {
    apiVersion: "1.5",
  });

  return null;
}
