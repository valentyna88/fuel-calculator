import FuelForm from '@/components/FuelForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-800">
        Estimate Your Trip Cost
      </h1>

      <FuelForm />
    </main>
  );
}
