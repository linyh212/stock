import { useEffect } from "react";
import { connectWS } from "../ws";

let connected = false;

export default function WSBoot() {
  useEffect(() => {
    if (!connected) {
      connectWS();
      connected = true;
    }
  }, []);
  return null;
}