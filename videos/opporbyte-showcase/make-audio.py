"""Original music/SFX plus the authorized narration, mixed locally."""
import json
import math
import os
import pathlib
import subprocess
import wave
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
FFMPEG = os.environ.get("OPPORBYTE_FFMPEG", "ffmpeg")
RATE, DURATION = 48000, 35
N = RATE * DURATION
music = np.zeros((N, 2), dtype=np.float64)
voice = np.zeros((N, 2), dtype=np.float64)
effects = np.zeros((N, 2), dtype=np.float64)
rng = np.random.default_rng(1042)

def add(target, start, signal, gain=1.0, pan=0.0):
    offset = round(start * RATE)
    count = min(len(signal), len(target) - offset)
    if count <= 0:
        return
    mono = signal[:count] * gain
    target[offset:offset+count, 0] += mono * math.sqrt((1-pan)/2)
    target[offset:offset+count, 1] += mono * math.sqrt((1+pan)/2)

def piano(note, seconds=2.7):
    t = np.arange(round(seconds*RATE))/RATE
    f = 440 * 2**((note-69)/12)
    envelope = np.minimum(t/0.008, 1) * np.exp(-t*1.9) * np.minimum((seconds-t)/0.3, 1)
    wave = sum((1/h**1.8)*np.sin(2*np.pi*f*h*t + 0.06*h) * np.exp(-t*0.12*h) for h in range(1, 6))
    return wave * envelope

# A restrained original Cmaj7 / Am9 / Fmaj7 / G6 progression.
chords = [[48, 60, 64, 67, 71], [45, 57, 60, 64, 71], [41, 53, 57, 60, 64], [43, 55, 59, 62, 64]]
beat = 60 / 104
for step in range(60):
    start = step * beat
    chord = chords[(step // 8) % len(chords)]
    note = chord[1 + (step % 4)]
    add(music, start, piano(note), 0.052, -0.25 if step%2 else 0.25)
    if step % 4 == 0:
        add(music, start, piano(chord[0], 3.8), 0.075)
    if step % 8 == 0:
        for note in chord[1:]:
            add(music, start + 0.03, piano(note+12, 4.0), 0.01)

for start in [5.7, 10.7, 15.7, 20.7, 25.7, 30.7]:
    seconds = 0.55
    t = np.arange(round(seconds*RATE))/RATE
    envelope = np.sin(np.pi*t/seconds)**2
    noise = rng.normal(0, 1, len(t))
    softened = np.convolve(noise, np.ones(18)/18, mode="same")
    add(effects, start, softened*envelope, 0.018)
    add(effects, start+0.3, piano(84, 0.6), 0.025, 0.1)

starts = [0.12, 6.08, 11.08, 16.08, 21.08, 26.08, 31.08]
ends = [5.86, 10.86, 15.86, 20.86, 25.86, 30.86, 34.85]
report = []
for i, (start, end) in enumerate(zip(starts, ends), 1):
    raw = ASSETS / f"voice-{i}.wav"
    subprocess.run([str(FFMPEG), "-y", "-v", "error", "-i", str(ASSETS/f"voice-{i}.mp3"), "-ar", str(RATE), "-ac", "1", str(raw)], check=True)
    with wave.open(str(raw)) as f:
        samples = np.frombuffer(f.readframes(f.getnframes()), dtype="<i2").astype(float)/32768
    # Keep the whole speech; remove only leading/trailing recording silence.
    audible = np.where(np.abs(samples) > 0.006)[0]
    if len(audible):
        samples = samples[max(0, audible[0]-round(.045*RATE)):min(len(samples), audible[-1]+round(.1*RATE))]
    trimmed = ASSETS / f"voice-{i}-trimmed.wav"
    def write(path, data):
        with wave.open(str(path), "wb") as f:
            f.setnchannels(1 if data.ndim == 1 else 2); f.setsampwidth(2); f.setframerate(RATE)
            f.writeframes((np.clip(data, -1, 1)*32767).astype("<i2").tobytes())
    write(trimmed, samples)
    original = len(samples)/RATE
    tempo = max(1.0, original/(end-start))
    fitted = ASSETS / f"voice-{i}-fitted.wav"
    subprocess.run([str(FFMPEG), "-y", "-v", "error", "-i", str(trimmed), "-af", f"atempo={tempo:.6f}", str(fitted)], check=True)
    with wave.open(str(fitted)) as f:
        samples = np.frombuffer(f.readframes(f.getnframes()), dtype="<i2").astype(float)/32768
    # Normalize each voice clip to an even conversational level.
    rms = np.sqrt(np.mean(samples**2))
    gain = min(2.5, 0.12/max(rms, 1e-7))
    gain = min(gain, 0.8/max(np.max(np.abs(samples)), 1e-7))
    add(voice, start, samples, gain)
    report.append({"clip": i, "original_seconds": original, "tempo": tempo, "placed_start": start, "placed_end": start+len(samples)/RATE})

# Carve music where speech is present, including short attack/release ramps.
duck = np.ones(N)
for item in report:
    a = max(0, round((item["placed_start"]-.12)*RATE))
    b = min(N, round((item["placed_end"]+.2)*RATE))
    duck[a:b] = .38
smooth = np.convolve(duck, np.ones(4800)/4800, mode="same")
music *= smooth[:, None]
fade = np.minimum(np.arange(N)/RATE/1.0, 1)*np.minimum((DURATION-np.arange(N)/RATE)/1.2, 1)
music *= fade[:, None]
for name, data in [("score.wav", music), ("voice.wav", voice), ("effects.wav", effects)]:
    write(ASSETS/name, data)
combined = music+voice+effects
peak = np.max(np.abs(combined))
combined *= min(1, 0.86/max(peak, 1e-8))
write(ASSETS/"mix.wav", combined)
with open(ASSETS/"audio-report.json", "w") as f:
    json.dump({"duration":DURATION, "rate":RATE, "peak_dbfs":20*math.log10(max(np.max(np.abs(combined)),1e-9)), "clips":report, "original_music":True}, f, indent=2)
subprocess.run([str(FFMPEG), "-y", "-v", "error", "-i", str(ASSETS/"mix.wav"), "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", str(RATE), str(ASSETS/"mix-normalized.wav")], check=True)
print(json.dumps({"mix":"assets/mix.wav", "peak_dbfs":20*math.log10(np.max(np.abs(combined))), "clips":report}))
