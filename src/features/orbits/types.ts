import type { OrbitType } from "../../api/generated/Api";
import { mediaUrl } from "../../api/client";

export const DEFAULT_IMAGE = "/media/default-orbit.svg";
export const DEFAULT_VIDEO = "/media/default-orbit.webm";

export type Orbit = {
  id: number;
  name: string;
  description: string | null;
  height: number | null;
  inclination: number | null;
  likeCount: number;
  image: string;
  video: string;
  status: string;
  isCreator: boolean;
  isLiked: boolean;
};

export function fromApiOrbit(orbit: OrbitType): Orbit {
  return {
    id: orbit.id,
    name: orbit.name,
    description: orbit.description,
    height: orbit.height,
    inclination: orbit.inclination,
    likeCount: orbit.likeCount,
    image: mediaUrl(orbit.image, DEFAULT_IMAGE),
    video: mediaUrl(orbit.video, DEFAULT_VIDEO),
    status: orbit.status,
    isCreator: orbit.isCreator === 1,
    isLiked: orbit.isLiked === 1,
  };
}
