
import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Dimensions {
  width: number;
  height: number;
}

export default function ImageResizer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const width = imageRef.current.naturalWidth;
      const height = imageRef.current.naturalHeight;
      setOriginalDimensions({ width, height });
      setDimensions({ width, height });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (maintainAspectRatio && originalDimensions.width && originalDimensions.height) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      if (dimension === 'width') {
        setDimensions({
          width: value,
          height: Math.round(value / aspectRatio),
        });
      } else {
        setDimensions({
          width: Math.round(value * aspectRatio),
          height: value,
        });
      }
    } else {
      setDimensions(prev => ({
        ...prev,
        [dimension]: value,
      }));
    }
  };

  const handleDownload = async () => {
    if (!selectedImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      const link = document.createElement('a');
      link.download = 'resized-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="p-8 bg-white shadow-lg rounded-xl">
        <div
          className={`min-h-[300px] border-2 border-dashed rounded-lg transition-colors duration-300 ${
            selectedImage ? 'border-purple-300' : 'border-purple-200 hover:border-purple-300'
          } flex flex-col items-center justify-center cursor-pointer`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <img
              ref={imageRef}
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[400px] object-contain"
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="text-center p-6">
              <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <p className="text-lg text-gray-600 mb-2">Drag and drop your image here</p>
              <p className="text-sm text-gray-400">or click to browse</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {selectedImage && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm text-gray-600">Width (px)</label>
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-6"
                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
              >
                {maintainAspectRatio ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1 space-y-2">
                <label className="text-sm text-gray-600">Height (px)</label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
            </div>
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
              onClick={handleDownload}
            >
              Download Resized Image
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
