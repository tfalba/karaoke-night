import alexPhoto from "../assets/alex.png";
import nicolePhoto from "../assets/nicole.png";
import ginaPhoto from "../assets/gina.png";
import karaPhoto from "../assets/kara.png";
import tracyPhoto from "../assets/tracy.png";

export type Player = {
  id: string;
  name: string;
  nickname: string;
  photoUrl: string;
};

export const PLAYERS: Player[] = [
  {
    id: "tracy",
    name: "Tracy",
    nickname: "Midnight Siren",
    photoUrl: tracyPhoto,
  },
  {
    id: "gina",
    name: "Gina",
    nickname: "Neon Muse",
    photoUrl: ginaPhoto,
  },
  {
    id: "kara",
    name: "Kara",
    nickname: "Velvet Vibe",
    photoUrl: karaPhoto,
  },
  {
    id: "alex",
    name: "Alex",
    nickname: "Starlight Riot",
    photoUrl: alexPhoto,
  },
  {
    id: "nicole",
    name: "Nicole",
    nickname: "Crystal Howl",
    photoUrl: nicolePhoto,
  },
];
