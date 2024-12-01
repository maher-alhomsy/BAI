import { useEffect, useRef, useState } from 'react';

import './App.css';
import { drawLines } from './utils/DrawLines';
import { calculateDistance } from './utils/calculateDistance';

type City = {
  x: number;
  y: number;
}

type Ant = {
  tour: number[];
  distance: number;
}


const evaporationRate = 0.5;

function App() {
  const [ants, setAnts] = useState<Ant[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [bestPath, setBestPath] = useState<Ant | null>(null);
  const [pheromones, setPheromones] = useState<number[][]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const addCityHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCities([...cities, { x, y }]);
  };

  const simulationHandler = () => {
    if (cities.length < 2) {
      alert('Please add at least 2 cities before starting the simulation');
      return;
    }

    const antsArray: Ant[] = Array.from({ length: 10 }, () => ({
      tour: [],
      distance: 0,
    }));

    setAnts(antsArray);

    const initialPheromones: number[][] = Array(cities.length)
      .fill(null)
      .map(() => Array(cities.length).fill(1));

    setPheromones(initialPheromones);
  };

  const updatePheromones = () => {
    const newPheromones = pheromones.map((row) =>
      row.map((value) => value * (1 - evaporationRate))
    );

    ants.forEach((ant) => {
      ant.tour.forEach((cityIndex, i) => {
        const nextCityIndex = ant.tour[(i + 1) % ant.tour.length];
        newPheromones[cityIndex][nextCityIndex] += 1 / ant.distance;
      });
    });

    setPheromones(newPheromones);
  };

  const moveAnts = () => {
    const newAnts = ants.map(() => {
      const tour: number[] = [];

      const remainingCities = [...Array(cities.length).keys()];
      let currentCity = remainingCities.splice(
        Math.floor(Math.random() * remainingCities.length),
        1
      )[0];

      tour.push(currentCity);

      while (remainingCities.length) {
        const probabilities = remainingCities.map((nextCity) => {
          return (
            pheromones[currentCity][nextCity] /
            calculateDistance(cities[currentCity], cities[nextCity])
          );
        });

        const total = probabilities.reduce((a, b) => a + b, 0);
        const normalized = probabilities.map((p) => p / total);

        const nextCity =
          remainingCities[
          normalized.findIndex(
            (_, i) =>
              Math.random() <=
              normalized.slice(0, i + 1).reduce((a, b) => a + b, 0)
          )
          ];

        tour.push(nextCity);
        remainingCities.splice(remainingCities.indexOf(nextCity), 1);
        currentCity = nextCity;
      }

      const distance = tour.reduce(
        (sum, cityIndex, i) =>
          sum +
          calculateDistance(
            cities[cityIndex],
            cities[tour[(i + 1) % tour.length]]
          ),
        0
      );

      return { tour, distance };
    });

    const bestAnt = newAnts.reduce((best, current) =>
      current.distance < (best?.distance ?? Infinity) ? current : best
    );

    if (!bestPath || bestAnt.distance < bestPath.distance) {
      setBestPath(bestAnt);
    }

    setAnts(newAnts);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawLines({ ants, canvas, cities, bestPath });
  };

  const clear = () => {
    if (cities.length < 0) return;

    setAnts([]);
    setCities([]);
    setPheromones([]);
    setBestPath(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  useEffect(() => {
    if (ants.length === 0 || pheromones.length === 0) return;

    const interval = setInterval(() => {
      moveAnts();

      updatePheromones();
      draw();
    }, 1000);

    return () => clearInterval(interval);
  }, [ants, pheromones]);

  return (
    <div>
      <h1>Ant Colony Optimization</h1>
      <h3>Please click on the canvas to add cities</h3>

      <canvas
        width={600}
        height={400}
        ref={canvasRef}
        onClick={addCityHandler}
      />

      <p id='note'>Note: The cities will not be visible until click on "Start Simulation"</p>

      <p>
        <button onClick={simulationHandler} >Start Simulation</button>
        <button id='clear' onClick={clear}>Clear</button>
      </p>
    </div>

  );
}

export default App;
