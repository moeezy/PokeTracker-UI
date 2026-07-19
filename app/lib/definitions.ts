export type Route = {
  routeId: string | number; 
  routeName: string;
}

export type UserPokemon = {
    pokedexNumber: string | number;
    name: string;
    caught: boolean;
    shiny: boolean;
}

export interface Encounter {
  pokedexNumber: string;
  name: string;
  caught: boolean;
  encounterMethod: string;
  timeOfDay: string;
  radio: string | null;
  swarm: string | null;
}

export interface Area {
  areaId: string;
  areaName: string;
  encounters: Encounter[];
}

export interface RouteWithArea {
  routeId: string;
  routeName: string;
  areas: Area[];
}