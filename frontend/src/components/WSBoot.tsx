import { useEffect } from "react";
import { connectWS } from "../ws";

export default function WSBoot() {
  useEffect(() => {
    connectWS();
  }, []);
  return null;
}
