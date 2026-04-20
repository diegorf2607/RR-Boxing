'use client'

import { useCallback, useRef, useState } from 'react'
import type { ProductImage } from '@/shared/types/commerce'

type Props = {
  images: ProductImage[]
  onChange: (next: ProductImage[]) => void
  disabled?: boolean
  urlPasteValue: string
  onUrlPasteChange: (v: string) => void
  onAppendUrlsFromPaste: () => void
}

function normalizePrimary(list: ProductImage[]): ProductImage[] {
  if (list.length === 0) return []
  let idx = list.findIndex((i) => i.isPrimary)
  if (idx < 0) idx = 0
  return list.map((img, i) => ({
    ...img,
    sortOrder: i,
    isPrimary: i === idx,
  }))
}

export default function ProductGalleryEditor({
  images,
  onChange,
  disabled,
  urlPasteValue,
  onUrlPasteChange,
  onAppendUrlsFromPaste,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const apply = useCallback(
    (next: ProductImage[]) => {
      onChange(normalizePrimary(next))
    },
    [onChange]
  )

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return
    const next = [...images]
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const url = URL.createObjectURL(file)
      next.push({ url, sortOrder: next.length, isPrimary: next.length === 0 })
    }
    apply(next)
  }

  const removeAt = (i: number) => {
    const row = images[i]
    if (row?.url.startsWith('blob:')) URL.revokeObjectURL(row.url)
    apply(images.filter((_, j) => j !== i))
  }

  const setPrimary = (i: number) => {
    apply(images.map((img, j) => ({ ...img, isPrimary: j === i })))
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return
    const arr = [...images]
    const [it] = arr.splice(from, 1)
    arr.splice(to, 0, it)
    apply(arr)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            void onFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-50"
        >
          Subir imágenes
        </button>
        <p className="text-xs text-neutral">JPEG, PNG, WebP o GIF · máx. 5MB c/u (servidor)</p>
      </div>

      <div
        className="rounded-xl border border-dashed border-dark-300 bg-dark/40 px-3 py-4 text-sm text-neutral-light"
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={(e) => {
          e.preventDefault()
          void onFiles(e.dataTransfer.files)
        }}
      >
        <p className="mb-2 font-medium text-white">Arrastra archivos aquí</p>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              draggable={!disabled}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex == null) return
                move(dragIndex, i)
                setDragIndex(null)
              }}
              className={`relative w-24 shrink-0 rounded-lg border ${
                img.isPrimary ? 'border-accent ring-1 ring-accent/40' : 'border-dark-300'
              } bg-dark p-1`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-20 w-full rounded object-cover" />
              <div className="mt-1 flex flex-wrap gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setPrimary(i)}
                  className="rounded bg-dark-300 px-1.5 py-0.5 text-[10px] text-accent"
                >
                  Portada
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => move(i, i - 1)}
                  className="rounded bg-dark-300 px-1.5 py-0.5 text-[10px] text-white"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => move(i, i + 1)}
                  className="rounded bg-dark-300 px-1.5 py-0.5 text-[10px] text-white"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeAt(i)}
                  className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-300"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && <p className="text-xs text-neutral">Sin imágenes aún.</p>}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-neutral-light">Opcional: URLs (una por línea)</p>
        <textarea
          value={urlPasteValue}
          onChange={(e) => onUrlPasteChange(e.target.value)}
          placeholder="https://..."
          disabled={disabled}
          className="min-h-[72px] w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={onAppendUrlsFromPaste}
          className="mt-2 rounded-lg border border-dark-300 px-3 py-1.5 text-xs font-semibold text-neutral-light hover:border-accent hover:text-accent"
        >
          Añadir URLs al carrusel
        </button>
      </div>
    </div>
  )
}
