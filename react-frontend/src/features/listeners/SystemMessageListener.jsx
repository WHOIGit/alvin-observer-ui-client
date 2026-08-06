import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSystemMessage } from "../../hooks/useImagingClient";
import {
  addSystemMessage,
  removeExpiredSystemMessages,
} from "../system-messages/systemMessagesSlice";

// Holds open the v1.5 system channel and stores every incoming SystemMessage
// for the global notification bar. Renders nothing.
export default function SystemMessageListener() {
  const dispatch = useDispatch();

  const handleMessage = useCallback((message) => {
    dispatch(removeExpiredSystemMessages());
    dispatch(addSystemMessage(message));
  }, [dispatch]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      dispatch(removeExpiredSystemMessages());
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [dispatch]);

  useSystemMessage(handleMessage);

  return null;
}
