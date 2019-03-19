export const getRandomInt = (min: number = 1, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};
