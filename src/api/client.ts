import axios from "axios";
import { Api } from "./generated/Api";

export const orbitApi = new Api({ baseURL: "/", withCredentials: true });

export const authHttp = axios.create({
  baseURL: "/",
  withCredentials: true,
});

export function mediaUrl(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.port === "9000" || parsed.hostname === "minio") {
      return `/minio${parsed.pathname}${parsed.search}`;
    }
    return value;
  } catch {
    return fallback;
  }
}
