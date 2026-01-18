import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  background_image_url: string;
  address: string;
  date: string;
  time: string;
}

export const EventsCarousel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, background_image_url, address, date, time')
        .order('target_date', { ascending: false })
        .limit(10);

      if (data && !error) {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  const multipliedEvents = [...events, ...events];

  return (
    <div className="w-full overflow-hidden py-12 pb-20 md:pb-24 bg-background">
      <div className="relative overflow-hidden">
        <div className="flex gap-4 w-max animate-scroll-left-fast will-change-[transform]">
          {multipliedEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/event/${event.id}`);
              }}
              className="relative flex-shrink-0 w-[70vw] md:w-[40vw] aspect-[4/5] max-h-[700px] cursor-pointer overflow-hidden rounded-2xl shadow-medium hover:shadow-lift transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <img
                src={event.background_image_url}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-soft">
                  <div className="text-xs font-medium text-foreground">{event.date}</div>
                </div>
                <div className="bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-soft">
                  <div className="text-xs font-medium text-muted-foreground">{event.time}</div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-semibold text-primary-foreground mb-1 tracking-tight">{event.title}</h3>
                <p className="text-sm md:text-base text-primary-foreground/80">{event.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
