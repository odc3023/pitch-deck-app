const SlidePreview = ({ slide }) => {
  if (!slide) return null;

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
        <p className="text-gray-700">{slide.content}</p>
      </div>
    </div>
  );
};

export default SlidePreview;