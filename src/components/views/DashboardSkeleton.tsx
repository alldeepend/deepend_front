export default function DashboardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white relative rounded-4xl h-[400px] border border-stone-200 overflow-hidden animate-pulse"
        >
          {/* Badge de porcentaje skeleton */}
          <div className="absolute top-5 right-5 z-10 bg-stone-200 rounded-full w-12 h-6"></div>
          
          {/* Imagen skeleton */}
          <div className="h-[50%] w-full bg-stone-200"></div>
          
          {/* Contenido skeleton */}
          <div className="flex flex-col gap-5 justify-between items-start relative z-10 p-6">
            <div className="w-full">
              {/* Título skeleton */}
              <div className="h-8 w-3/4 bg-stone-200 rounded mb-2"></div>
              {/* Subtítulo skeleton */}
              <div className="h-4 w-1/2 bg-stone-200 rounded"></div>
            </div>
            
            {/* Línea divisoria */}
            <div className="h-1 w-full bg-stone-200"></div>
            
            {/* Footer skeleton */}
            <div className="h-[40%] flex items-center justify-between w-full">
              <div className="h-4 w-20 bg-stone-200 rounded"></div>
              <div className="h-6 w-6 bg-stone-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

