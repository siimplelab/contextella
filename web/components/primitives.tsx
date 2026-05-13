'use client';
import React, { useMemo } from 'react';
import { ELEMENTS } from '@/lib/tokens';
import type { ElementKey, Person, Lang } from '@/lib/types';

export function ElementOrb({ element = 'water', size = 120, animated = true }: { element?: ElementKey; size?: number; animated?: boolean }) {
  const e = ELEMENTS[element];
  const id = `orb-${element}-${size}`;
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      filter: 'drop-shadow(0 8px 32px rgba(180,140,240,0.25))',
    }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-core`} cx="38%" cy="34%" r="72%">
            <stop offset="0%" stopColor={e.c1} stopOpacity="1" />
            <stop offset="55%" stopColor={e.c2} stopOpacity="1" />
            <stop offset="100%" stopColor={e.c3} stopOpacity="1" />
          </radialGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor={e.c2} stopOpacity="0.35" />
            <stop offset="100%" stopColor={e.c2} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-spec`} cx="32%" cy="28%" r="22%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <circle cx="60" cy="60" r="58" fill={`url(#${id}-glow)`}>
          {animated && <animate attributeName="r" values="56;60;56" dur="6s" repeatCount="indefinite" />}
        </circle>
        <circle cx="60" cy="60" r="44" fill={`url(#${id}-core)`} />
        <ellipse cx="60" cy="62" rx="42" ry="14" fill={e.c1} opacity="0.18" filter={`url(#${id}-blur)`}>
          {animated && (
            <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="22s" repeatCount="indefinite" />
          )}
        </ellipse>
        <ellipse cx="60" cy="58" rx="40" ry="12" fill={e.c3} opacity="0.22" filter={`url(#${id}-blur)`}>
          {animated && (
            <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="30s" repeatCount="indefinite" />
          )}
        </ellipse>
        <circle cx="48" cy="44" r="14" fill={`url(#${id}-spec)`} />
      </svg>
    </div>
  );
}

export function StarField({ count = 60, seed = 1, opacity = 0.85 }: { count?: number; seed?: number; opacity?: number }) {
  const stars = useMemo(() => {
    const rand = (() => {
      let s = seed;
      return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    })();
    return Array.from({ length: count }, () => ({
      x: rand() * 100, y: rand() * 100,
      r: 0.4 + rand() * 1.4,
      o: 0.3 + rand() * 0.7,
      twinkle: 2 + rand() * 4,
      delay: rand() * 4,
    }));
  }, [count, seed]);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
         style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }}>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.3} fill="#fff" opacity={s.o}>
          <animate attributeName="opacity" values={`${s.o};${s.o * 0.2};${s.o}`}
                   dur={`${s.twinkle}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

interface VizProps {
  network: Person[];
  width?: number;
  height?: number;
  accent?: string;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  lang?: Lang;
}

export function PersonNode({ person, x, y, size, isMe, selected, onClick, lang = 'ko' }:
  { person: Person | undefined; x: number; y: number; size: number; isMe?: boolean; selected?: boolean; onClick?: () => void; lang?: Lang }) {
  if (!person) return null;
  const e = ELEMENTS[person.element];
  return (
    <button onClick={onClick}
            style={{
              position: 'absolute',
              left: x - size / 2, top: y - size / 2,
              width: size, height: size,
              borderRadius: '50%', border: 'none',
              padding: 0, cursor: 'pointer', background: 'transparent',
              transition: 'transform 0.2s',
              transform: selected ? 'scale(1.08)' : 'scale(1)',
            }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${e.c1}, ${e.c2} 65%, ${e.c3})`,
        boxShadow: selected
          ? `0 0 0 2px rgba(255,255,255,0.85), 0 0 24px ${e.c2}aa`
          : `0 4px 16px ${e.c3}66, inset 0 0 16px rgba(255,255,255,0.15)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: size * 0.32, fontWeight: 600,
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        <span style={{ fontSize: person.emoji ? size * 0.46 : size * 0.32 }}>
          {person.emoji || person.initials}
        </span>
        {isMe && (
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#E8D4A2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#1A1538', fontWeight: 700,
            border: '1.5px solid #1A1538',
          }}>★</div>
        )}
      </div>
      {!isMe && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%',
          transform: 'translateX(-50%)', marginTop: 6,
          fontSize: 11, color: 'rgba(255,255,255,0.85)',
          fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: -0.2,
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}>{lang === 'ko' ? person.name_ko : person.name_en}</div>
      )}
    </button>
  );
}

export function ConstellationViz({ network, width = 360, height = 320, accent = '#E8D4A2', onSelect, selectedId, lang }: VizProps) {
  const cx = width / 2, cy = height / 2;
  const me = network.find(p => p.id === 'me');
  const others = network.filter(p => p.id !== 'me');
  const maxR = Math.min(width, height) * 0.42;

  const positions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = { me: { x: cx, y: cy } };
    others.forEach((p) => {
      const angle = ((p.angle ?? 0) * Math.PI) / 180;
      const r = maxR * (p.distance ?? 0.6);
      map[p.id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });
    return map;
  }, [network, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <StarField count={50} seed={3} opacity={0.5} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="aura-me" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {[0.45, 0.75, 1].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={maxR * f}
                  fill="none" stroke={accent} strokeOpacity={0.1} strokeDasharray="2 4" />
        ))}
        <circle cx={cx} cy={cy} r={62} fill="url(#aura-me)" />
        {others.map((p) => {
          const pos = positions[p.id];
          const opacity = 0.25 + ((p.score ?? 70) / 100) * 0.55;
          return (
            <line key={`l-${p.id}`} x1={cx} y1={cy} x2={pos.x} y2={pos.y}
                  stroke={accent} strokeWidth={0.8 + ((p.score ?? 70) / 100) * 1.2}
                  strokeOpacity={opacity} />
          );
        })}
        {others.map((p) => {
          const pos = positions[p.id];
          const t = 0.42;
          return (
            <circle key={`s-${p.id}`} cx={cx + (pos.x - cx) * t} cy={cy + (pos.y - cy) * t}
                    r={1.4} fill={accent} opacity={0.9}>
              <animate attributeName="opacity" values="0.9;0.3;0.9" dur="3s" repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>
      <PersonNode person={me} x={positions.me.x} y={positions.me.y} size={64}
                  isMe selected={selectedId === 'me'} onClick={() => onSelect?.('me')} lang={lang} />
      {others.map((p) => (
        <PersonNode key={p.id} person={p} x={positions[p.id].x} y={positions[p.id].y}
                    size={52} selected={selectedId === p.id}
                    onClick={() => onSelect?.(p.id)} lang={lang} />
      ))}
    </div>
  );
}

export function OrbitalViz({ network, width = 360, height = 320, accent = '#E8D4A2', onSelect, selectedId, lang }: VizProps) {
  const cx = width / 2, cy = height / 2;
  const me = network.find(p => p.id === 'me');
  const others = network.filter(p => p.id !== 'me');
  const maxR = Math.min(width, height) * 0.42;
  const ring = (score: number) => score >= 80 ? 0 : score >= 65 ? 1 : 2;
  const ringR = [maxR * 0.42, maxR * 0.72, maxR * 1.0];

  const positions = useMemo(() => {
    const buckets: Person[][] = [[], [], []];
    others.forEach(p => buckets[ring(p.score ?? 70)].push(p));
    const map: Record<string, { x: number; y: number }> = { me: { x: cx, y: cy } };
    buckets.forEach((arr, ri) => {
      const n = arr.length || 1;
      arr.forEach((p, i) => {
        const a = (i / n) * Math.PI * 2 + ri * 0.7;
        map[p.id] = { x: cx + Math.cos(a) * ringR[ri], y: cy + Math.sin(a) * ringR[ri] };
      });
    });
    return map;
  }, [network, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <StarField count={40} seed={7} opacity={0.4} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="orb-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        {ringR.map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r}
                  fill="none" stroke={accent} strokeOpacity={0.18 - i * 0.04} strokeWidth={1} />
        ))}
        <circle cx={cx} cy={cy} r={62} fill="url(#orb-aura)" />
      </svg>
      <PersonNode person={me} x={cx} y={cy} size={64} isMe
                  selected={selectedId === 'me'} onClick={() => onSelect?.('me')} lang={lang} />
      {others.map(p => (
        <PersonNode key={p.id} person={p} x={positions[p.id].x} y={positions[p.id].y}
                    size={50} selected={selectedId === p.id}
                    onClick={() => onSelect?.(p.id)} lang={lang} />
      ))}
    </div>
  );
}

export function GridViz({ network, accent = '#E8D4A2', onSelect, selectedId, lang = 'ko' }: VizProps) {
  const others = network.filter(p => p.id !== 'me');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 4px' }}>
      {others.map(p => {
        const e = ELEMENTS[p.element];
        const isSel = selectedId === p.id;
        return (
          <button key={p.id} onClick={() => onSelect?.(p.id)}
                  style={{
                    appearance: 'none', textAlign: 'left',
                    background: isSel ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                    border: `0.5px solid ${isSel ? accent : 'rgba(255,255,255,0.10)'}`,
                    borderRadius: 18, padding: '14px 14px 16px',
                    color: '#fff', cursor: 'pointer', minHeight: 110,
                    display: 'flex', flexDirection: 'column', gap: 8,
                    transition: 'background 0.2s, border-color 0.2s',
                  }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {p.emoji ? (
                <div style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: `radial-gradient(circle at 35% 30%, ${e.c1}, ${e.c2} 65%, ${e.c3})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{p.emoji}</div>
              ) : (
                <ElementOrb element={p.element} size={32} animated={false} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}>
                  {lang === 'ko' ? p.name_ko : p.name_en}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                  {lang === 'ko' ? p.relation_ko : p.relation_en}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 'auto' }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: accent,
                             fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>
                {p.score}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>/ 100</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CompatGauge({ score = 75, size = 200, accent = '#E8D4A2', label = '' }: { score?: number; size?: number; accent?: string; label?: string }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const arc = 270;
  const start = 135;
  const circ = 2 * Math.PI * r;
  const arcLen = (arc / 360) * circ;
  const filled = (score / 100) * arcLen;
  const id = `gauge-${size}`;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: `rotate(${start}deg)` }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C9A8E8" />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r}
                fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}
                strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r}
                fill="none" stroke={`url(#${id})`} strokeWidth={stroke}
                strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.3, 0.7, 0.4, 1)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        <div style={{
          fontSize: size * 0.32, fontWeight: 300, color: '#fff',
          letterSpacing: -2, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{score}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5, textTransform: 'uppercase' }}>/ 100</div>
        {label && <div style={{ fontSize: 13, color: accent, marginTop: 6, letterSpacing: -0.2, fontWeight: 500 }}>{label}</div>}
      </div>
    </div>
  );
}

export function CompatStars({ score = 75, accent = '#E8D4A2', label = '', size = 200 }: { score?: number; accent?: string; label?: string; size?: number }) {
  const filled = score / 20;
  return (
    <div style={{
      width: size, height: size, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <div style={{
        fontSize: size * 0.28, fontWeight: 300, color: '#fff',
        letterSpacing: -2, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>{score}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2,3,4].map(i => {
          const f = Math.max(0, Math.min(1, filled - i));
          return (
            <svg key={i} width={22} height={22} viewBox="0 0 22 22">
              <defs>
                <linearGradient id={`star-${i}-${size}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset={`${f * 100}%`} stopColor={accent} />
                  <stop offset={`${f * 100}%`} stopColor="rgba(255,255,255,0.12)" />
                </linearGradient>
              </defs>
              <path d="M11 1.5l2.7 5.8 6.3.8-4.7 4.4 1.2 6.3L11 15.7l-5.5 3.1 1.2-6.3-4.7-4.4 6.3-.8z"
                    fill={`url(#star-${i}-${size})`} stroke={accent} strokeOpacity="0.6" strokeWidth="0.5" />
            </svg>
          );
        })}
      </div>
      {label && <div style={{ fontSize: 13, color: accent, letterSpacing: -0.2, fontWeight: 500 }}>{label}</div>}
    </div>
  );
}

export function CompatMerge({ score = 75, accent = '#E8D4A2', label = '', size = 200, elementA = 'water', elementB = 'fire' }:
  { score?: number; accent?: string; label?: string; size?: number; elementA?: ElementKey; elementB?: ElementKey }) {
  const eA = ELEMENTS[elementA], eB = ELEMENTS[elementB];
  const overlap = (score / 100) * 32;
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
    }}>
      <div style={{ position: 'relative', width: 130, height: 80 }}>
        <div style={{
          position: 'absolute', left: 0, top: 8, width: 64, height: 64, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${eA.c1}, ${eA.c2} 60%, ${eA.c3})`,
          mixBlendMode: 'screen',
          transform: `translateX(${overlap / 2}px)`,
          transition: 'transform 0.6s cubic-bezier(0.3, 0.7, 0.4, 1)',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 8, width: 64, height: 64, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${eB.c1}, ${eB.c2} 60%, ${eB.c3})`,
          mixBlendMode: 'screen',
          transform: `translateX(-${overlap / 2}px)`,
          transition: 'transform 0.6s cubic-bezier(0.3, 0.7, 0.4, 1)',
        }} />
      </div>
      <div style={{
        fontSize: 36, fontWeight: 300, color: '#fff',
        letterSpacing: -1.5, fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginTop: 4,
      }}>{score}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginLeft: 2 }}>/100</span></div>
      {label && <div style={{ fontSize: 13, color: accent, letterSpacing: -0.2, fontWeight: 500 }}>{label}</div>}
    </div>
  );
}
