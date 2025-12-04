import { BibleReader } from '../components/BibleReader';
import { BibleProvider } from '../lib/context/BibleContext';

export default function Home() {
  return (
    <BibleProvider>
      <BibleReader />
    </BibleProvider>
  );
}
