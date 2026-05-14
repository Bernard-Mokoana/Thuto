export default async () => {
  await global.__MONGOOSE__.disconnect();
  await global.__MONGOD__.stop();
};
