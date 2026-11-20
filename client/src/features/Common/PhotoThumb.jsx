// Photo d'un plat, d'une recette ou d'un objet, avec l'icône de la catégorie si aucune photo n'existe.
import { useState } from 'react';
import { IconTent, IconBed, IconFlame, IconDroplet, IconShirt, IconFirstAidKit, IconMap2, IconBath, IconPackage, IconToolsKitchen2 } from '@tabler/icons-react';
import './photoThumb.css';

const CATEGORY_ICONS = {
  abri: IconTent, couchage: IconBed, cuisine: IconFlame, eau: IconDroplet, vetements: IconShirt,
  securite: IconFirstAidKit, navigation: IconMap2, hygiene: IconBath, divers: IconPackage,
};

export function PhotoThumb({ image, url, alt, category, size = 'medium', showCredit = false }) {
  const [failed, setFailed] = useState(false);
  const src = image?.url ?? url;
  const Icon = CATEGORY_ICONS[category] ?? IconToolsKitchen2;
  const credit = image ? `Photo : ${image.author} · ${image.license}` : undefined;
  return (
    <figure className={`photoThumb photoThumb_${size}`}>
      {src && !failed
        ? <img src={src} alt={alt} loading="lazy" title={credit} onError={() => setFailed(true)} />
        : <span className="photoThumbFallback" aria-hidden="true"><Icon size={size === 'small' ? 20 : 40} stroke={1.5} /></span>}
      {showCredit && image && !failed && (
        <figcaption className="photoThumbCredit">
          <a href={image.sourceUrl} target="_blank" rel="noreferrer">{image.author}</a> · {image.license}
        </figcaption>
      )}
    </figure>
  );
}
