export const RAJASTHAN_CITIES = [
  { id: 'jaipur', label: 'Jaipur' },
  { id: 'udaipur', label: 'Udaipur' },
  { id: 'jodhpur', label: 'Jodhpur' },
  { id: 'ajmer', label: 'Ajmer' },
  { id: 'tonk', label: 'Tonk' },
  { id: 'bikaner', label: 'Bikaner' },
];

// Exact place labels used in the unsigned dashboard hotspots/alerts.
export const RAJASTHAN_PLACES = [
  { id: 'mi-road-jaipur', label: 'MI Road, Jaipur' },
  { id: 'clock-tower-jodhpur', label: 'Clock Tower, Jodhpur' },
  { id: 'lake-pichola-udaipur', label: 'Lake Pichola, Udaipur' },
  { id: 'pushkar-road-ajmer', label: 'Pushkar Road, Ajmer' },
  { id: 'industrial-area-tonk', label: 'Industrial Area, Tonk' },
  { id: 'industrial-area-bikaner', label: 'Industrial Area, Bikaner' },
];

// Helpful lookups when existing code expects a few fixed buckets.
export const DEFAULT_PLACE_LABELS = {
  downtown: 'MI Road, Jaipur',
  industrial: 'Industrial Area, Tonk',
  residential: 'Lake Pichola, Udaipur',
  commercial: 'Pushkar Road, Ajmer',
  airport: 'Industrial Area, Bikaner',
  university: 'Clock Tower, Jodhpur',
  riverside: 'Lake Pichola, Udaipur',
  highway: 'MI Road, Jaipur',
};
