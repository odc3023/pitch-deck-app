import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SlideSidebar = ({ slides, activeIndex, onSelectSlide, onReorderSlides }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(slides);
    const [movedSlide] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, movedSlide);

    onReorderSlides(reordered);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Slides</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="slides"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {slides.map((slide, index) => {
                // Create truly unique key by combining slide.id with index
                const uniqueKey = slide.id
                  ? `${slide.id}-${index}`
                  : `slide-${index}-${Date.now()}`;
                const draggableId = slide.id || `slide-${index}-${Date.now()}`;

                return (
                  <Draggable
                    key={uniqueKey}
                    draggableId={draggableId}
                    index={index}
                    isDragDisabled={false}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onSelectSlide(index)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          index === activeIndex
                            ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        } ${
                          snapshot.isDragging
                            ? 'shadow-lg rotate-2 scale-105'
                            : 'shadow-sm'
                        }`}
                      >
                        <div className="text-sm font-medium truncate">
                          {slide.title || `Slide ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {slide.content?.substring(0, 50)}...
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SlideSidebar;