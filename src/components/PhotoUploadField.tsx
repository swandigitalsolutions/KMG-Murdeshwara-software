"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

export default function PhotoUploadField({
  name = "photo",
  existingUrl,
}: {
  name?: string;
  existingUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
        ) : (
          <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
            <Camera size={20} />
          </div>
        )}
        <input
          type="file"
          name={name}
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm hover:file:bg-slate-200"
        />
      </div>
    </div>
  );
}
