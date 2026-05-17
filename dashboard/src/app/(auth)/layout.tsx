export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            supr<em className="not-italic text-amber-500">fly</em>
          </h1>
          <p className="mt-2 text-sm text-slate-500">Your AI wingman for LinkedIn & X</p>
        </div>
        {children}
      </div>
    </div>
  );
}
