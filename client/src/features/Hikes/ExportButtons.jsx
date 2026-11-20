import { IconBrandGoogleMaps, IconBrandApple, IconDownload } from '@tabler/icons-react';

export function ExportButtons({ links }) {
  if (!links) return null;
  return (
    <div className="exportButtons">
      <a className="buttonSecondary" href={links.googleMaps} target="_blank" rel="noreferrer"><IconBrandGoogleMaps size={18} /> Ouvrir dans Google Maps</a>
      <a className="buttonSecondary" href={links.appleMaps} target="_blank" rel="noreferrer"><IconBrandApple size={18} /> Ouvrir dans Apple Plans</a>
      <a className="buttonSecondary" href={links.gpx} download><IconDownload size={18} /> Télécharger le GPX</a>
    </div>
  );
}
