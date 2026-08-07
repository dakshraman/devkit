"use client";

export interface LoadedImage {
  name: string;
  size: number;
  width: number;
  height: number;
  dataUrl: string;
  img: HTMLImageElement;
}

export function loadImageFromFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const dataUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        name: file.name,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        dataUrl,
        img,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(dataUrl);
      reject(new Error("Could not read that file. Use a PNG, JPEG, GIF, WebP or BMP image."));
    };
    img.src = dataUrl;
  });
}

export function renderToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  background?: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Encoding to ${mime} failed in this browser.`))),
      mime,
      quality
    );
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read the output image."));
    reader.readAsDataURL(blob);
  });
}

export function downloadImageBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function fitDimensions(width: number, height: number, maxDim = 1600) {
  const largest = Math.max(width, height);
  if (largest <= maxDim) return { width, height };
  const scale = maxDim / largest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function rgbDistance(a: [number, number, number], b: [number, number, number], tolerance: number) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance
  );
}