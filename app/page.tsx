import { appName } from '@/lib/meta';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">{appName}</h1>
    </main>
  );
}
