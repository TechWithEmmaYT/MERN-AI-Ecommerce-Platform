import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, ImageIcon, Upload, Loader2 } from "lucide-react";
import { uploadProductImagesMutationFn } from "@/lib/api";

interface ProductImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  error?: string | null;
}

export default function ProductImageUploader({ images, onImagesChange, error }: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([]);

  const uploadMutation = useMutation({
    mutationFn: uploadProductImagesMutationFn,
    onSuccess: (data) => {
      onImagesChange([...images, ...data.images]);
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setPendingFiles([]);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPending = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = (index: number) => {
    URL.revokeObjectURL(pendingFiles[index].preview);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      if (!images.includes(trimmed)) {
        onImagesChange([...images, trimmed]);
        setUrlInput("");
      }
    } catch {
      return;
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Product Images
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {images.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 h-9"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or paste URL</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
            className="h-9 text-sm"
          />
          <Button type="button" size="sm" variant="outline" onClick={addImageUrl}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {pendingFiles.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Pending upload ({pendingFiles.length})</p>
            <div className="grid grid-cols-2 gap-3">
              {pendingFiles.map((item, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border">
                  <img src={item.preview} alt="Pending" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() => uploadMutation.mutate(pendingFiles.map((f) => f.file))}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        )}

        {images.length === 0 && pendingFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-40" />
            <p className="text-sm">Add product images</p>
          </div>
        )}

        {images.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-3">Uploaded ({images.length})</p>
            <div className="grid grid-cols-2 gap-3">
              {images.map((url, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border">
                  <img src={url} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
