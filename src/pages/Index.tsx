
import ImageResizer from "@/components/ImageResizer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Photo Resizer</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Easily resize and compress your images while maintaining quality
        </p>
      </header>
      <main>
        <ImageResizer />
      </main>
    </div>
  );
};

export default Index;
