import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Construction size={64} className="text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-500 max-w-md">{description}</p>
        <p className="mt-4 text-sm text-slate-400">
          Design this page in Figma, then use Claude to build it!
        </p>
      </div>
    </div>
  );
}
