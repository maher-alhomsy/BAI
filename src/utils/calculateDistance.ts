interface City {
  x: number;
  y: number;
}

export const calculateDistance = (city1: City, city2: City): number => {
  return Math.sqrt((city1.x - city2.x) ** 2 + (city1.y - city2.y) ** 2);
};
