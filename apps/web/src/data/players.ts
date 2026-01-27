import alexPhoto from "../assets/friends/alex.png";
import nicolePhoto from "../assets/friends/nicole.png";
import ginaPhoto from "../assets/friends/gina.png";
import karaPhoto from "../assets/friends/kara.png";
import tracyPhoto from "../assets/friends/tracy.png";

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
