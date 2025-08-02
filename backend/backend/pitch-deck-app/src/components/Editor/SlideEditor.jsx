const SlideEditor = ({ slide, onUpdate }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ ...slide, [name]: value });
  };

  if (!slide) return null;

  return (
    <div className="p-6 border-b bg-white shadow-sm">
      <input
        type="text"
        name="title"
        value={slide.title}
        onChange={handleChange}
        placeholder="Slide Title"
        className="w-full text-2xl font-bold mb-4 border-b border-gray-200 focus:outline-none"
      />
      <textarea
        name="content"
        value={slide.content}
        onChange={handleChange}
        placeholder="Slide Content"
        className="w-full h-32 p-2 border rounded focus:outline-none resize-none"
      />
    </div>
  );
};

export default SlideEditor;