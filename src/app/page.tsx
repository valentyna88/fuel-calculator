import FuelForm from '@/components/FuelForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[url('/images/background.jpg')] bg-cover bg-center bg-no-repeat px-4 py-8">
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800 sm:text-3xl">
          Estimate Your Trip Cost
        </h1>
        <FuelForm />
      </div>
      <footer className="mt-auto pb-4 text-center">
        <p className="text-xs text-slate-300">
          © {new Date().getFullYear()} Fuel Calculator by Valentyna Taranchuk
        </p>
      </footer>
    </main>
  );
}
