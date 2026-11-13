import FuelForm from '@/components/FuelForm';

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center px-4 py-8 sm:pt-12 lg:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 -z-10 w-screen bg-[url('/images/background.jpg')] bg-cover bg-center bg-no-repeat"
      />
      <div className="flex w-full max-w-[23rem] flex-1 flex-col items-center">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800 sm:text-3xl">
          Estimate Your Trip Cost
        </h1>
        <FuelForm />
      </div>
      <footer className="mt-auto pt-10 pb-4 text-center">
        <p className="text-xs text-slate-300">
          © {new Date().getFullYear()} Fuel Calculator by Valentyna Taranchuk
        </p>
      </footer>
    </main>
  );
}
