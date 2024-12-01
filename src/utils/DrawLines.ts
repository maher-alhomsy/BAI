type City = {
  x: number;
  y: number;
};

type Ant = {
  tour: number[];
  distance: number;
};

type Props = {
  canvas: HTMLCanvasElement;
  cities: City[];
  ants: Ant[];

  bestPath: { tour: number[]; distance: number } | null;
};

export const drawLines = ({ ants, canvas, cities, bestPath }: Props) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cities.forEach((city, index) => {
    ctx.beginPath();
    ctx.arc(city.x, city.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.fillText(`${index + 1}`, city.x + 8, city.y - 8);
  });

  ants.forEach((ant) => {
    if (ant.tour.length > 0) {
      ctx.beginPath();

      ctx.moveTo(cities[ant.tour[0]].x, cities[ant.tour[0]].y);

      ant.tour.forEach((cityIndex) => {
        ctx.lineTo(cities[cityIndex].x, cities[cityIndex].y);
      });

      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
      ctx.stroke();
    }
  });

  if (bestPath && bestPath.tour.length > 0) {
    ctx.beginPath();
    ctx.moveTo(cities[bestPath.tour[0]].x, cities[bestPath.tour[0]].y);
    bestPath.tour.forEach((cityIndex) => {
      ctx.lineTo(cities[cityIndex].x, cities[cityIndex].y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};
