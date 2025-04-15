
import ImageResizer from "@/components/ImageResizer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Photo Resizer</h1>
        <p className="text-gray-600">Easily resize your images online</p>
      </header>
      <main>
        <ImageResizer />
      </main>
    </div>
  );
};

export default Index;
