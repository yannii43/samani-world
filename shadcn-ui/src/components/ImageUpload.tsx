// src/components/ImageUpload.tsx
import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
}

export default function ImageUpload({ value, onChange, label, hint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptées (JPG, PNG, WebP…)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop lourd (max 5 Mo)');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (data.ok && data.url) {
        onChange(data.url);
        toast.success('Image uploadée');
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload');
      }
    } catch {
      toast.error('Erreur réseau lors de l\'upload');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-sm font-medium leading-none">{label}</p>}

      {value ? (
        /* Aperçu de l'image */
        <div className="relative inline-block">
          <img
            src={value.startsWith('/uploads') ? `${value}` : value}
            alt="aperçu"
            className="h-32 w-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Zone de drop / bouton upload */
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-black transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Upload en cours…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImagePlus className="h-8 w-8" />
              <p className="text-sm font-medium text-gray-600">Cliquer ou glisser-déposer</p>
              <p className="text-xs">JPG, PNG, WebP — max 5 Mo</p>
            </div>
          )}
        </div>
      )}

      {hint && !value && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
