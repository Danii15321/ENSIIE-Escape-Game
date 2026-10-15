import cnam1890 from './cnam-1890.jpg';
import isu2011 from './isu-illkirch-2011.jpg';

export type Media = { url: string; alt: string; caption: string; credit: string };

export const media: Record<string, Media> = {
  'cnam-1890': {
    url: cnam1890,
    alt: 'Épreuve d’archive vers 1890 : la rue Saint-Martin et la façade du Conservatoire des Arts-et-Métiers, avec quelques passants et des fiacres.',
    caption:
      'Rue Saint-Martin, vers 1890 : le Conservatoire des Arts-et-Métiers. L’IIE y naît en 1968.',
    credit: 'Hippolyte Blancard, vers 1890, musée Carnavalet, Paris Musées, CC0.',
  },
  'isu-illkirch-2011': {
    url: isu2011,
    alt: 'Le bâtiment de l’ISU à Illkirch en 2011, avec le panneau de l’ENSIIE devant sa façade vitrée.',
    caption: 'Illkirch, 2011 : le panneau de l’ENSIIE devant le bâtiment de l’ISU.',
    credit: 'Wawalan, 2011, CC BY-SA 3.0, via Wikimedia Commons.',
  },
};
