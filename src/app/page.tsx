import FuelForm from '@/components/FuelForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-900">Fuel Calculator</h1>
      <FuelForm />
    </main>
  );
}
