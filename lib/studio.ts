import { b, projects } from './content';

export type Plate = { src: string; documentary: boolean };

const openingView: Record<string,string> = {
  milano: 'archive-16',
  elixir: 'archive-18',
  folding: 'folds',
  architecture: 'photo-3172',
  infrastructure: 'photo-3150',
  identity: 'archive-31',
};

export function variants(id: string): Plate[] {
  const project = projects.find(project => project.id === id)!;
  const names = project.gallery.map(src => src.split('/').pop()!.replace('.webp', ''));
  const images = new Set([openingView[id] ?? names[0], ...names.map(name => name === 'milano' ? 'archive-16' : name)]);
  return [...images].map(name => ({
    src: '/images/editions/' + name + '.webp',
    documentary: name.startsWith('photo-') || name.startsWith('archive-'),
  }));
}

export const featuredOrder = [
 'aramis-round','oscar','aramis-slider','milano','golvareh','kalleh','saffron','shirindokht','nutie','dates','papco','perfume','elixir',
 'folding','architecture','infrastructure','power','plant','furniture','transport','space','identity','advertising'
];
export const captions = {
  intro: b('I design packaging and build scale models. I studied industrial design at the University of Art Tehran.','بسته‌بندی طراحی می‌کنم و ماکت می‌سازم. طراحی صنعتی را در دانشگاه هنر تهران خواندم.'),
};
