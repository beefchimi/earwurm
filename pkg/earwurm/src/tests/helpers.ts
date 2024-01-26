import {mockData} from '@earwurm/mocks';

import type {Earwurm} from '../Earwurm';
import type {LibraryEntry, StackId} from '../types';

export const mockEntries: LibraryEntry[] = [
  {id: 'Zero', path: mockData.audio},
  {id: 'One', path: 'to/no/file.mp3'},
  {id: 'Two', path: ''},
];

export const mockInitialKeys: StackId[] = mockEntries.map(({id}) => id);

export function managerSetup(
  earwurmInstance: Earwurm,
  library: LibraryEntry[],
) {
  earwurmInstance.add(...library);
  earwurmInstance.unlock();

  const clickEvent = new Event('click');
  document.dispatchEvent(clickEvent);
}
