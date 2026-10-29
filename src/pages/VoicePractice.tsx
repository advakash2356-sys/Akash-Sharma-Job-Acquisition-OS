import { PageHeader } from '../components/ui';
import { LocalNote } from '../components/LocalNote';
import { VoiceInterview } from '../components/VoiceInterview';
import { clearPersisted } from '../lib/persist';

export default function VoicePractice() {
  return (<>
    <PageHeader eyebrow="Free · beta · runs in your browser" title="Voice interview practice" subtitle="Interviews often happen on a call. Hear each question, answer out loud, and get scores for what you said and how you said it." />
    <LocalNote onClear={() => { clearPersisted('jaos_voice_cfg', 'jaos_voice_turns', 'jaos_steps_voice'); location.reload(); }} />
    <VoiceInterview />
  </>);
}
