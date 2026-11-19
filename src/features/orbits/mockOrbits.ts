import { DEFAULT_IMAGE, DEFAULT_VIDEO, type Orbit } from "./types";

export const mockOrbits: Orbit[] = [
  {
    id: 1,
    name: "МКС",
    description:
      "Орбита на высоте 400 км используется для исследований и наблюдения Земли.",
    height: 400,
    inclination: 51.6,
    likeCount: 3,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
    status: "Опубликован",
    isCreator: false,
    isLiked: false,
  },
  {
    id: 2,
    name: "Геостационарный спутник",
    description:
      "Геостационарная орбита позволяет спутнику оставаться над одной областью Земли.",
    height: 35786,
    inclination: 0,
    likeCount: 1,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
    status: "Опубликован",
    isCreator: false,
    isLiked: false,
  },
  {
    id: 3,
    name: "Солнечно-синхронная орбита",
    description:
      "Солнечно-синхронная орбита позволяет спутнику проходить над заданными участками Земли примерно в одно и то же местное солнечное время.",
    height: 650,
    inclination: 99.2,
    likeCount: 2,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
    status: "Опубликован",
    isCreator: false,
    isLiked: false,
  },
  {
    id: 13,
    name: "Средняя околоземная орбита",
    description:
      "Средняя околоземная орбита используется для навигационных и телекоммуникационных спутников.",
    height: 20000,
    inclination: 55,
    likeCount: 0,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
    status: "Опубликован",
    isCreator: false,
    isLiked: false,
  },
];
