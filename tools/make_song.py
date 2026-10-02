"""Synthesize 'our-song.mp3' — a soft ambient piano loop for the birthday experience.

Warm C-major ballad, 66 BPM:
  bass + broken-chord arpeggios, a sparse singable melody,
  Schroeder reverb, gentle lowpass, very subtle vinyl crackle.
Renders WAV -> MP3 (lameenc). Pure numpy, deterministic seed.
"""
import numpy as np
import lameenc

SR = 44100
BPM = 66.0
BEAT = 60.0 / BPM          # 0.909s
BAR = 4 * BEAT             # 3.636s

rng = np.random.default_rng(7)

def note_freq(name):
    names = {"C":0,"C#":1,"Db":1,"D":2,"D#":3,"Eb":3,"E":4,"F":5,"F#":6,"Gb":6,"G":7,"G#":8,"Ab":8,"A":9,"A#":10,"Bb":10,"B":11}
    if name == "rest": return 0.0
    pitch, octave = name[:-1], int(name[-1])
    semis = names[pitch] + (octave - 4) * 12 - 9   # A4 = 0
    return 440.0 * 2 ** (semis / 12)

def piano(f0, dur, vel=0.8):
    """Soft felt-piano-ish tone via additive synthesis with fast-ish decay."""
    n = int(SR * min(dur + 2.5, 6.0))
    t = np.arange(n) / SR
    out = np.zeros(n)
    if f0 <= 0: return out, n
    # partial amplitudes decay with velocity brightness
    partials = [1.0, 0.34, 0.16, 0.085, 0.045, 0.028, 0.016]
    tau_base = 2.2 * (f0 / 261.6) ** -0.55          # high notes die faster
    for k, amp in enumerate(partials, start=1):
        fk = f0 * k * (1 + 0.00035 * k * k)         # slight inharmonicity
        if fk > 9000: break
        tau = tau_base / (0.85 + 0.22 * k)
        env = np.exp(-t / tau)
        # soften attack
        atk = int(SR * 0.006)
        if atk > 0: env[:atk] *= np.linspace(0, 1, atk) ** 1.5
        bright = amp * (0.55 + 0.45 * vel)
        out += bright * env * np.sin(2 * np.pi * fk * t + rng.uniform(0, 2 * np.pi))
    # sub weight for low notes
    if f0 < 130:
        out += 0.22 * np.exp(-t / 2.8) * np.sin(2 * np.pi * f0 * 0.5 * t)
    out *= vel
    return out, n

def bass(f0, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    env = np.minimum(t / 0.15, 1.0) * np.exp(-t / (dur * 0.9))
    tone = np.sin(2 * np.pi * f0 * t) + 0.18 * np.sin(2 * np.pi * f0 * 2 * t)
    sw = 0.85 + 0.15 * np.sin(2 * np.pi * t / dur)  # gentle swell
    return 0.30 * env * sw * tone

class Mix:
    def __init__(self, total):
        self.buf = np.zeros((total, 2))
        self.n = total
    def add(self, sig, t0, pan=0.0, gain=1.0):
        i0 = int(t0 * SR)
        if i0 >= self.n: return
        seg = sig[: self.n - i0]
        l = gain * np.sqrt((1 - pan) / 2 + 0.5 * (1 - abs(pan)) * 0)  # simple pan
        gl = gain * np.cos((pan + 1) * np.pi / 4)
        gr = gain * np.sin((pan + 1) * np.pi / 4)
        self.buf[i0:i0 + len(seg), 0] += seg * gl
        self.buf[i0:i0 + len(seg), 1] += seg * gr

def reverb(x, wet=0.30):
    """Schroeder reverb: 4 parallel combs + 2 series allpasses."""
    def comb(x, delay, fb):
        d = int(SR * delay)
        y = np.zeros_like(x)
        for ch in range(x.shape[1]):
            buf = np.zeros(d)
            for i in range(len(x)):
                v = x[i, ch] + fb * buf[i % d]
                y[i, ch] = buf[i % d]
                buf[i % d] = v
        return y
    def allpass(x, delay, fb=0.7):
        d = int(SR * delay)
        y = np.zeros_like(x)
        for ch in range(x.shape[1]):
            buf = np.zeros(d)
            for i in range(len(x)):
                vin = x[i, ch]
                v = buf[i % d]
                y[i, ch] = -vin + v
                buf[i % d] = vin + fb * v
        return y
    # parallel combs (decorrelated per channel via slight delay offsets)
    delays = [(0.0297, 0.0311), (0.0371, 0.0383), (0.0411, 0.0427), (0.0437, 0.0451)]
    out = np.zeros_like(x)
    for d in delays:
        out += 0.25 * comb(x, np.mean(d), 0.77)
    out = allpass(out, 0.005, 0.7)
    out = allpass(out, 0.0017, 0.7)
    # pre-delay on dry
    pre = int(0.020 * SR)
    y = np.zeros_like(x)
    y[pre:] = x[:-pre] if pre else x
    return y + wet * out

# ---------------------------------------------------------------- composition
# 20 bars: intro 2 | A 4 | A'+melody 4 | B+melody 4 | A''+melody 4 | outro 2
CH = {
    "C":   ["C3", "G3", "E4", "G4", "C5", "G4", "E4", "G3"],
    "G/B": ["B2", "G3", "D4", "G4", "B4", "G4", "D4", "G3"],
    "Am7": ["A2", "E3", "C4", "E4", "A4", "E4", "C4", "E3"],
    "F":   ["F2", "C3", "A3", "C4", "F4", "C4", "A3", "C3"],
    "Fmaj7":["F2", "C3", "A3", "E4", "F4", "C4", "A3", "C3"],
    "Dm7": ["D3", "A3", "F4", "A4", "D5", "A4", "F4", "A3"],
    "G":   ["G2", "D3", "B3", "D4", "G4", "D4", "B3", "D3"],
    "Em7": ["E3", "B3", "G4", "B4", "E5", "B4", "G4", "B3"],
}
PROG = (
    ["C", "G/B"] +                                  # intro
    ["C", "G/B", "Am7", "Fmaj7"] +                  # A
    ["C", "G/B", "Am7", "Fmaj7"] +                  # A'
    ["Dm7", "G", "Em7", "Am7"] +                    # B
    ["Dm7", "G", "C", "C"] +                        # B resolve
    ["C", "G/B", "Am7", "Fmaj7"] +                  # A''
    ["C", "C"]                                      # outro
)
NBARS = len(PROG)
TOTAL = NBARS * BAR + 6.0                            # + reverb tail
mix = Mix(int(TOTAL * SR))

# arpeggios (8th notes), with humanization
for bar_i, ch in enumerate(PROG):
    t_bar = bar_i * BAR
    pattern = CH[ch]
    intensity = 0.55
    if bar_i < 2: intensity = 0.0                    # intro: no arps yet
    elif bar_i >= NBARS - 2: intensity = 0.34        # outro softer
    for step, nname in enumerate(pattern):
        if intensity == 0.0 and step > 3: break
        t0 = t_bar + step * BEAT / 2 + rng.uniform(-0.006, 0.006)
        vel = intensity * rng.uniform(0.85, 1.05) * (1.0 if step % 2 == 0 else 0.82)
        sig, _ = piano(note_freq(nname), BEAT * 1.1, min(vel, 1.0))
        pan = -0.18 + 0.36 * (step / 7) + rng.uniform(-0.04, 0.04)
        mix.add(sig, t0, pan=pan, gain=0.16)

# bass (whole notes)
BASS_ROOT = {"C":"C2","G/B":"B1","Am7":"A1","F":"F1","Fmaj7":"F1","Dm7":"D2","G":"G1","Em7":"E2"}
for bar_i, ch in enumerate(PROG):
    if bar_i < 1: continue
    t0 = bar_i * BAR + 0.02
    mix.add(bass(note_freq(BASS_ROOT[ch]), BAR), t0, pan=0.0, gain=0.5)

# melody — sparse, singable (bars 6..9 = A', 10..17 = B, 14..17 = A'')
MEL = {
    6:  [("E5", 0, 2), ("G5", 2, 2)],
    7:  [("D5", 0, 2), ("B4", 2, 1), ("D5", 3, 1)],
    8:  [("C5", 0, 2), ("A4", 2, 1), ("B4", 3, 1)],
    9:  [("A4", 0, 2), ("G4", 2, 2)],
    10: [("F5", 0, 2), ("E5", 2, 1), ("D5", 3, 1)],
    11: [("B4", 0, 2), ("D5", 2, 2)],
    12: [("G5", 0, 2), ("E5", 2, 1), ("F5", 3, 1)],
    13: [("A4", 0, 3), ("B4", 3, 1)],
    14: [("F5", 0, 2), ("A5", 2, 2)],
    15: [("G5", 0, 2), ("F5", 2, 1), ("E5", 3, 1)],
    16: [("E5", 0, 4)],
    17: [],
    18: [("E5", 0, 2), ("G5", 2, 2)],
    19: [("D5", 0, 2), ("C5", 2, 2)],
    20: [("C5", 0, 4)],
    21: [],
}
for bar_i, notes in MEL.items():
    if bar_i >= NBARS: continue
    t_bar = bar_i * BAR
    for nname, beat, beats in notes:
        t0 = t_bar + beat * BEAT + rng.uniform(-0.008, 0.008)
        sig, _ = piano(note_freq(nname), beats * BEAT, 0.62)
        mix.add(sig, t0, pan=rng.uniform(-0.05, 0.05), gain=0.16)

# tiny high "music-box" sparkle in the A'' section (bars 18-20)
for bar_i, (nname, beat) in {18: ("E6", 1.5), 19: ("D6", 2.5), 20: ("C6", 0.5)}.items():
    t0 = bar_i * BAR + beat * BEAT
    sig, _ = piano(note_freq(nname), 2 * BEAT, 0.30)
    mix.add(sig, t0, pan=0.22, gain=0.10)

x = mix.buf

# very subtle vinyl crackle + hiss (felt, not heard)
n_samples = len(x)
crackle = np.zeros(n_samples)
n_pops = int(n_samples / SR * 9)                    # ~9 tiny pops/sec
for _ in range(n_pops):
    i = rng.integers(0, n_samples - 400)
    amp = rng.uniform(0.004, 0.012)
    ln = int(rng.uniform(30, 200))
    crackle[i:i+ln] += amp * np.exp(-np.arange(ln) / (ln / 3)) * rng.uniform(-1, 1)
hiss = 0.0012 * rng.standard_normal((n_samples, 2))
x += (crackle[:, None] + hiss) * 0.9

# reverb + warm lowpass + gentle master compression-ish soft clip
x = reverb(x, wet=0.30)
from numpy.fft import rfft, irfft
def lowpass(sig, fc=6800.0):
    out = np.zeros_like(sig)
    for ch in range(sig.shape[1]):
        X = rfft(sig[:, ch])
        freqs = np.fft.rfftfreq(len(sig), 1 / SR)
        X *= 1 / (1 + (freqs / fc) ** 4)
        out[:, ch] = irfft(X, len(sig))
    return out
x = lowpass(x)
x = np.tanh(x * 1.1) * 0.92

# master fades: gentle 1.2s fade-in, 3s fade-out
fade_in = int(1.2 * SR); fade_out = int(3.0 * SR)
x[:fade_in] *= np.linspace(0, 1, fade_in)[:, None] ** 1.5
x[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None] ** 1.3

# normalize to -1.5 dBFS
peak = np.max(np.abs(x))
x = x / peak * 0.84

# ---------------------------------------------------------------- encode
pcm = (x * 32767).astype(np.int16)
enc = lameenc.Encoder()
enc.set_bit_rate(128)
enc.set_in_sample_rate(SR)
enc.set_channels(2)
enc.set_quality(2)
data = enc.encode(pcm.tobytes()) + enc.flush()
out = "/home/user/public/music/our-song.mp3"
import os
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "wb") as f:
    f.write(data)
print(f"written {out}  {len(data)/1024:.0f} KB  duration={len(x)/SR:.1f}s  bars={NBARS}")
