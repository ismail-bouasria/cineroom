import { Film } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
          <Film className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-white/60 font-medium">Chargement...</p>
      </div>
    </div>
  );
}
