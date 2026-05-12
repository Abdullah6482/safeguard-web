export function calculatePillarMetrics(scores = {}) {
  const { people = 0, asset = 0, environment = 0, reputation = 0 } = scores;
  const max = Math.max(people, asset, environment, reputation);
  const avg = ((people + asset + environment + reputation) / 4).toFixed(1);

  let dominantPillar = 'None';
  if (max > 0) {
    if (people === max) dominantPillar = 'People';
    else if (asset === max) dominantPillar = 'Assets';
    else if (environment === max) dominantPillar = 'Environment';
    else dominantPillar = 'Reputation';
  }

  return { max, avg: Number(avg), dominantPillar };
}
