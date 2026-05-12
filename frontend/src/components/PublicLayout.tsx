import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-brand-navy shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-accent rounded-lg flex items-center justify-center font-bold text-brand-navy text-sm">R</div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Ramirez Group</div>
              <div className="text-brand-accent-light text-[10px] tracking-wide">Ingeniería y Construcción</div>
            </div>
          </Link>
          <span className="text-xs text-gray-400">Ofertas Internas</span>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
