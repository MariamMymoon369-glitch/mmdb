import 'dotenv/config';
import dataSource from '../data-source';
import { importActorMovies } from './import-actor-movies';

function parseOptions(args: string[]): {
  target?: number;
  total?: number;
  concurrency: number;
  buffer: number;
} {
  const parsed = {
    target: undefined as number | undefined,
    total: undefined as number | undefined,
    concurrency: 5,
    buffer: 25,
  };

  for (const arg of args) {
    if (arg.startsWith('--target=')) {
      parsed.target = Number.parseInt(arg.slice('--target='.length), 10);
    } else if (arg.startsWith('--total=')) {
      parsed.total = Number.parseInt(arg.slice('--total='.length), 10);
    } else if (arg.startsWith('--concurrency=')) {
      parsed.concurrency = Number.parseInt(
        arg.slice('--concurrency='.length),
        10,
      );
    } else if (arg.startsWith('--buffer=')) {
      parsed.buffer = Number.parseInt(arg.slice('--buffer='.length), 10);
    }
  }

  return parsed;
}

async function main() {
  await dataSource.initialize();

  const options = parseOptions(process.argv.slice(2));
  const summary = await importActorMovies(dataSource, {
    target: options.target,
    total: options.total,
    concurrency: options.concurrency,
    buffer: options.buffer,
    onProgress: (message) => console.log(message),
  });

  console.log('Summary:', JSON.stringify(summary));
}

main()
  .catch((err: unknown) => {
    console.error('Actor movie import failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    if (dataSource.isInitialized) return dataSource.destroy();
  });
