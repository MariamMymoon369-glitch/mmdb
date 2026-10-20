import 'dotenv/config';
import dataSource from '../data-source';
import { hydratePeople } from './hydrate-people';

function parseOptions(args: string[]): {
  limit: number | null;
  concurrency: number;
  castOnly: boolean;
  skipAwards: boolean;
} {
  const parsed = {
    limit: null as number | null,
    concurrency: 4,
    castOnly: false,
    skipAwards: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      parsed.limit = Number.parseInt(arg.slice('--limit='.length), 10);
    } else if (arg.startsWith('--concurrency=')) {
      parsed.concurrency = Number.parseInt(
        arg.slice('--concurrency='.length),
        10,
      );
    } else if (arg === '--cast-only') {
      parsed.castOnly = true;
    } else if (arg === '--skip-awards') {
      parsed.skipAwards = true;
    }
  }

  return parsed;
}

async function main() {
  await dataSource.initialize();

  const options = parseOptions(process.argv.slice(2));
  const summary = await hydratePeople(dataSource, {
    limit: options.limit,
    concurrency: options.concurrency,
    castOnly: options.castOnly,
    skipAwards: options.skipAwards,
    onProgress: (message) => console.log(message),
  });

  console.log('Summary:', JSON.stringify(summary));
}

main()
  .catch((err: unknown) => {
    console.error('Hydration seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    if (dataSource.isInitialized) return dataSource.destroy();
  });
