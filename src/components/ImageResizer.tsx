
import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Lock, Unlock, FileArchive, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Dimensions {
  width: number;
  height: number;
}

export default function ImageResizer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [compressionQuality, setCompressionQuality] = useState(80);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const calculateImageSize = (width: number, height: number): string => {
    const sizeInBytes = width * height * 4;
    const sizeInKB = sizeInBytes / 1024;
    if (sizeInKB > 1024) {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
    return `${sizeInKB.toFixed(2)} KB`;
  };

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

    const img = document.createElement('img');
    img.onload = () => {
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      const link = document.createElement('a');
      link.download = 'resized-image.png';
      link.href = canvas.toDataURL('image/jpeg', compressionQuality / 100);
      link.click();
      toast.success('Image downloaded successfully!');
    };
    img.src = selectedImage;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="p-8 bg-gradient-to-br from-white to-purple-50 shadow-xl rounded-xl border-purple-100">
        <div
          className={`min-h-[300px] border-2 border-dashed rounded-xl transition-all duration-300 ${
            selectedImage ? 'border-purple-400 bg-white/50' : 'border-purple-200 hover:border-purple-300 bg-white/30'
          } flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-[0.99]"
                onLoad={handleImageLoad}
              />
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <p className="text-white text-sm flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  {calculateImageSize(dimensions.width, dimensions.height)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-bounce" />
              <p className="text-xl text-gray-600 mb-2 font-medium">Drag and drop your image here</p>
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
          <div className="mt-8 space-y-6">
            <Separator className="bg-purple-100" />
            
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Width (px)</Label>
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                  min={1}
                  className="focus-visible:ring-purple-400"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-6 hover:bg-purple-50"
                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
              >
                {maintainAspectRatio ? (
                  <Lock className="h-4 w-4 text-purple-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-purple-400" />
                )}
              </Button>
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Height (px)</Label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                  min={1}
                  className="focus-visible:ring-purple-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileArchive className="h-4 w-4 text-purple-400" />
                <Label className="text-sm font-medium text-gray-700">Compression Quality</Label>
              </div>
              <div className="flex items-center gap-4 px-1">
                <Slider
                  value={[compressionQuality]}
                  onValueChange={(values) => setCompressionQuality(values[0])}
                  max={100}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-600 min-w-[3rem]">{compressionQuality}%</span>
              </div>
            </div>

            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-all hover:shadow-lg hover:scale-[0.99] active:scale-95"
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
