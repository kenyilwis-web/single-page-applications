import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import arrowDown from '@/assets/arrow-down.png';
import { SEOHead } from '@/components/SEOHead';
import { EventsCarousel } from '@/components/EventsCarousel';
import { RotatingBadge } from '@/components/RotatingBadge';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
}

const EventCard = ({
  event
}: {
  event: Event;
}) => {
  const navigate = useNavigate();
  
  const isEventLive = () => {
    const now = new Date().getTime();
    const target = new Date(event.target_date).getTime();
    const oneHour = 1000 * 60 * 60;
    return now >= target && now <= target + oneHour;
  };
  
  const eventLive = isEventLive();
  
  return (
    <div 
      className="relative cursor-pointer group hover-lift"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="overflow-hidden rounded-2xl mb-4 shadow-soft group-hover:shadow-medium transition-shadow duration-300">
        <div 
          className="aspect-square bg-secondary bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${event.background_image_url})` }}
        ></div>
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-soft">
          <div className="text-xs font-medium text-foreground">{event.date}</div>
        </div>
        <div className="bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-soft">
          <div className="text-xs font-medium text-muted-foreground">{event.time}</div>
        </div>
        {eventLive && (
          <div className="gradient-coral px-3 py-1.5 rounded-lg shadow-coral">
            <div className="text-xs font-semibold text-accent-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent-foreground rounded-full animate-pulse-soft"></span>
              LIVE NOW
            </div>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">{event.title}</h3>
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5" />
        {event.address}
      </p>
    </div>
  );
};

const Discover = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState<string>('the world');
  const [initialDateSet, setInitialDateSet] = useState(false);

  useEffect(() => {
    fetchEvents();
    detectUserCountry();
  }, []);

  // Set initial date only if there are events today
  useEffect(() => {
    if (!initialDateSet && events.length > 0) {
      const today = new Date();
      const now = today.getTime();
      const oneHour = 1000 * 60 * 60;
      
      const hasEventsToday = events.some((event) => {
        const eventDate = new Date(event.target_date);
        const target = eventDate.getTime();
        const hasEnded = target < now - oneHour;
        
        if (hasEnded) return false;
        
        return (
          eventDate.getFullYear() === today.getFullYear() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getDate() === today.getDate()
        );
      });
      
      if (hasEventsToday) {
        setDate(today);
      }
      setInitialDateSet(true);
    }
  }, [events, initialDateSet]);

  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const data = await response.text();
      const locMatch = data.match(/loc=([A-Z]{2})/);
      
      if (locMatch && locMatch[1]) {
        const countryCode = locMatch[1];
        const countryNames: { [key: string]: string } = {
          'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
          'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
          'BE': 'Belgium', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
          'PL': 'Poland', 'CH': 'Switzerland', 'AT': 'Austria', 'IE': 'Ireland', 'PT': 'Portugal',
          'IN': 'India', 'JP': 'Japan', 'CN': 'China', 'KR': 'South Korea', 'BR': 'Brazil',
          'MX': 'Mexico', 'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'SG': 'Singapore',
          'NZ': 'New Zealand', 'ZA': 'South Africa', 'RU': 'Russia', 'TR': 'Turkey', 'GR': 'Greece',
          'KE': 'Kenya'
        };
        setUserCountry(countryNames[countryCode] || countryCode);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error detecting country:', error);
      setUserCountry('the world');
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, background_image_url, target_date, address')
        .order('target_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on selected date and hide ended events
  const filteredEvents = events.filter((event) => {
    const now = new Date().getTime();
    const target = new Date(event.target_date).getTime();
    const oneHour = 1000 * 60 * 60;
    const hasEnded = target < now - oneHour;
    
    if (hasEnded) return false;
    
    if (!date) return true;
    
    const eventDate = new Date(event.target_date);
    const selectedDate = new Date(date);
    
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    eventsSection?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Discover Events"
        description="Explore popular events near you, browse by category, or check out some of the great community calendars."
        keywords="events, discover events, community events, local events, event calendar"
      />
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <Navbar />
      </div>
      
      {/* Decorative rotating badge - fixed to viewport */}
      <RotatingBadge 
        text="BROWSE" 
        onClick={scrollToEvents}
        showIcon={true}
        icon={<img src={arrowDown} alt="Arrow down" className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12" />}
      />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-36 lg:pt-44 pb-8 md:pb-16 lg:pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 md:mb-10 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <span className="text-foreground">Discover </span>
            <span className="text-gradient-coral">events</span>
            <br />
            <span className="text-foreground">near you</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            Explore popular events near you, browse by category, or check out some of the great community calendars.
          </p>
          
          {/* CTA Button */}
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
            <button 
              onClick={scrollToEvents}
              className="inline-flex items-center gap-2 gradient-coral text-accent-foreground px-8 py-4 rounded-xl font-semibold shadow-coral hover:shadow-lift transition-all duration-300"
            >
              Browse Events
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Auto-scrolling Events Carousel */}
      <EventsCarousel />

      {/* Events Section */}
      <section id="events-section" className="px-4 md:px-8 pb-20 pt-8 md:pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-8 md:mb-12 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">Browsing events in</h2>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold gradient-coral text-accent-foreground px-4 py-1.5 rounded-lg">
              {userCountry}
            </span>
            
            {/* Calendar button for mobile/tablet */}
            <div className="lg:hidden ml-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium shadow-soft hover:border-accent transition-all",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {date ? format(date, "MMM do") : "Pick date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border rounded-xl shadow-medium" align="end">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
            {/* Calendar - Desktop only */}
            <div className="hidden lg:block animate-fade-in lg:sticky lg:top-24 self-start" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
              <div className="bg-card rounded-2xl border border-border p-4 shadow-soft">
                <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
                {date && (
                  <button
                    onClick={() => setDate(undefined)}
                    className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {/* Event Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-20">
                  <div className="text-muted-foreground">Loading events...</div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {date ? 'No events on this date' : 'No upcoming events'}
                  </h3>
                  <p className="text-muted-foreground">
                    {date 
                      ? `Try selecting a different date or clear the filter` 
                      : 'Check back soon for new events!'
                    }
                  </p>
                  {date && (
                    <button
                      onClick={() => setDate(undefined)}
                      className="mt-4 text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                      Clear date filter
                    </button>
                  )}
                </div>
              ) : (
                filteredEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="animate-fade-in" 
                    style={{ animationDelay: `${0.1 + (index * 0.05)}s`, animationFillMode: 'both' }}
                  >
                    <EventCard event={event} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by Kenyi from Kenya
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Discover;
