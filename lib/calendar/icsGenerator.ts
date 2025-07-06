import { NormalizedEvent } from '../../types/event';

export function generateICS(event: NormalizedEvent): string {
  if (!event.location.coordinates || !event.start) {
    throw new Error('Event missing required fields for ICS generation');
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const escapeText = (text: string): string => {
    return text.replace(/[\\;,\n]/g, (match) => `\\${match}`);
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meetup//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@meetup.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(new Date(event.start))}`,
    event.end && `DTEND:${formatDate(new Date(event.end))}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description && `DESCRIPTION:${escapeText(event.description)}`,
    event.location.address && `LOCATION:${escapeText(event.location.address)}`,
    `GEO:${event.location.coordinates.lat};${event.location.coordinates.lng}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\n');

  return icsContent;
}

export function generateICSDownload(event: NormalizedEvent): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}