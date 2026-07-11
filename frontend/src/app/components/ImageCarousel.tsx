import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";

type ImageCarouselProps = {
  slides: string[]; // Array of image URLs
  options?: EmblaOptionsType;
  className?: string; // Additional classes for the image
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ slides, options, className }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="embla">
      {/* Carousel viewport */}
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((src, index) => (
            <div className="embla__slide flex-shrink-0 w-full" key={index}>
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                className={`w-full ${className || "h-64"} object-cover`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/30 z-20 transition-opacity duration-300 group-hover:bg-white/40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
