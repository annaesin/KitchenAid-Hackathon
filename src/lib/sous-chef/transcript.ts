/** Mic constraints that make speech recognition dramatically more reliable. */
export const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true, // stop the assistant's own voice re-entering the mic
  noiseSuppression: true, // kitchen/room noise
  autoGainControl: true, // even out quiet vs loud speakers
};

/**
 * Speech-to-text models hallucinate on silence or noise, emitting stock
 * artifacts ("Alpha", "Thank you.", "you", "Bye"). Those got sent to Gemini and
 * came back as bogus "ingredients". Drop them before they ever reach the brain.
 */
const NOISE_ARTIFACTS = new Set([
  "alpha",
  "you",
  "thank you",
  "thanks",
  "thanks for watching",
  "thank you for watching",
  "bye",
  "goodbye",
  "okay",
  "ok",
  "uh",
  "um",
  "hmm",
  "mm",
  "yeah",
  "so",
  "the",
  "a",
  "oh",
  "beep",
  "music",
  "silence",
  "subscribe",
]);

export function isLikelyNoise(text: string): boolean {
  const clean = text
    .toLowerCase()
    .replace(/[.,!?…]/g, "")
    .trim();

  if (clean.length < 2) return true; // "." or a stray letter
  if (!/[a-z]/.test(clean)) return true; // no actual words
  if (NOISE_ARTIFACTS.has(clean)) return true; // stock hallucination

  return false;
}
