import { C } from '../../styles/colors';

export default function DashboardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="relative rounded-4xl h-[400px] border overflow-hidden animate-pulse"
          style={{ background: C.surface1, borderColor: C.border }}
        >
          {/* Badge de porcentaje skeleton */}
          <div className="absolute top-5 right-5 z-10 rounded-full w-12 h-6" style={{ background: C.surface3 }}></div>

          {/* Imagen skeleton */}
          <div className="h-[50%] w-full" style={{ background: C.surface3 }}></div>

          {/* Contenido skeleton */}
          <div className="flex flex-col gap-5 justify-between items-start relative z-10 p-6">
            <div className="w-full">
              {/* Título skeleton */}
              <div className="h-8 w-3/4 rounded mb-2" style={{ background: C.surface3 }}></div>
              {/* Subtítulo skeleton */}
              <div className="h-4 w-1/2 rounded" style={{ background: C.surface3 }}></div>
            </div>

            {/* Línea divisoria */}
            <div className="h-1 w-full" style={{ background: C.surface3 }}></div>

            {/* Footer skeleton */}
            <div className="h-[40%] flex items-center justify-between w-full">
              <div className="h-4 w-20 rounded" style={{ background: C.surface3 }}></div>
              <div className="h-6 w-6 rounded" style={{ background: C.surface3 }}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
