import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HotspotMarker from './HotspotMarker';

const InteractiveMap = ({ hotspots }) => {
  const { t } = useTranslation();
  const [activeHotspot, setActiveHotspot] = useState(null);

  return (
    <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-border bg-muted">
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        title={t('sections.hotspotsMap')}
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=26.9124,75.7873&z=8&output=embed"
        className="w-full h-full"
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full">
          {hotspots?.map((hotspot, index) => (
            <div
              key={hotspot?.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index * 10)}%`
              }}
            >
              <HotspotMarker
                location={hotspot?.location}
                severity={hotspot?.severity}
                type={hotspot?.type}
                value={hotspot?.value}
                isActive={activeHotspot === hotspot?.id}
                onClick={() => setActiveHotspot(activeHotspot === hotspot?.id ? null : hotspot?.id)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 flex flex-wrap gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border">
          <div className="w-3 h-3 rounded-full bg-error" />
          <span className="text-xs md:text-sm font-caption text-foreground">{t('hotspot.severity.high')}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs md:text-sm font-caption text-foreground">{t('hotspot.severity.medium')}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs md:text-sm font-caption text-foreground">{t('hotspot.severity.low')}</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;