import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SlideSidebar = ({ slides, activeIndex, onSelectSlide, onReorderSlides }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(slides);
    const [movedSlide] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedSlide);

    onReorderSlides(reordered);
  };

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Slides</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {slides.map((slide, index) => (
                <Draggable key={slide.id} draggableId={slide.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onSelectSlide(index)}
                      className={`p-3 mb-2 rounded cursor-pointer select-none transition-all min-h-[48px] bg-white ${
                        index === activeIndex
                          ? 'bg-blue-100 text-blue-800 font-semibold'
                          : 'bg-white text-gray-800'
                      } ${snapshot.isDragging ? 'shadow-lg scale-105 ring-2 ring-blue-400' : ''}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onSelectSlide(index);
                      }}
                      aria-pressed={index === activeIndex}
                      aria-label={slide.title || `Slide ${index + 1}`}
                    >
                      {slide.title || `Slide ${index + 1}`}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SlideSidebar;