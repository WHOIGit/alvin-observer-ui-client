import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { addSystemMessage } from "../system-messages/systemMessagesSlice";

const SYSTEM_MESSAGE_EVENT = "SystemMessage";

// Holds open a socket to the v1.5 /system namespace and stores every
// incoming SystemMessage for the global notification bar. Renders nothing.
export default function SystemMessageListener() {
  const dispatch = useDispatch();

  const handleMessage = useCallback((message) => {
    dispatch(addSystemMessage(message));
  }, [dispatch]);

  useSocketListener("/system", SYSTEM_MESSAGE_EVENT, handleMessage, {
    apiVersion: "1.5",
  });

  return null;
}
