import { useRef, useState } from "react";
import jsQR from "jsqr";
import { Upload, Clipboard, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  onScan: (url: string) => void;
  disabled?: boolean;
}

export const QRScanTab = ({ onScan, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const decodeImage = (file: File) => {
    setError(null);
    setDecoded(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP, GIF).");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Could not read image.");
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        setDecoded(code.data);
      } else {
        setError("Could not decode a URL from this image. Please ensure the QR code is clear and fully visible.");
      }
    };
    img.onerror = () => setError("Could not load the image.");
    img.src = url;
  };

  const onFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    decodeImage(files[0]);
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard?.read) {
        toast({ title: "Clipboard unavailable", description: "Your browser doesn't support clipboard images.", variant: "destructive" });
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          const file = new File([blob], "pasted.png", { type });
          decodeImage(file);
          return;
        }
      }
      toast({ title: "No image found", description: "Copy a QR code image first.", variant: "destructive" });
    } catch {
      toast({ title: "Clipboard blocked", description: "Allow clipboard access and try again.", variant: "destructive" });
    }
  };

  const reset = () => {
    setPreview(null);
    setDecoded(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver ? "border-primary bg-primary/10" : "border-primary/30 hover:border-primary/60 hover:bg-primary/5"
        }`}
        role="button"
        aria-label="Upload QR code image"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
          disabled={disabled}
        />
        <QrCode className="w-10 h-10 mx-auto mb-3 text-primary" />
        <p className="font-medium">Drop a QR code image here, or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, GIF</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled} className="gap-2">
          <Upload className="w-4 h-4" /> Choose file
        </Button>
        <Button variant="outline" onClick={handlePaste} disabled={disabled} className="gap-2">
          <Clipboard className="w-4 h-4" /> Paste QR code image
        </Button>
      </div>

      {preview && (
        <div className="glass rounded-lg p-4 flex items-start gap-4">
          <img src={preview} alt="QR preview" className="w-24 h-24 object-contain rounded border border-primary/30" />
          <div className="flex-1 min-w-0 space-y-2">
            {decoded && (
              <>
                <p className="text-xs text-muted-foreground">Decoded URL</p>
                <p className="font-mono text-sm break-all">{decoded}</p>
                <Button size="sm" onClick={() => onScan(decoded)} disabled={disabled}>
                  Scan this URL
                </Button>
              </>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <button onClick={reset} className="text-muted-foreground hover:text-foreground" aria-label="Clear">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};