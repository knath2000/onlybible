import { SpanishBibleReader } from '../components/SpanishBibleReader';
import { BibleProvider } from '../lib/context/BibleContext';

export default function Home() {
  return (
    <BibleProvider>
      <SpanishBibleReader />
    </BibleProvider>
  );
}
