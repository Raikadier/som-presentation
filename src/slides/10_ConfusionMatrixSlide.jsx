import React from 'react'
import { motion } from 'framer-motion'
import { BlockMath } from 'react-katex'

/* ─── Matrix cells (abstract labels) ─── */
const CELLS = [
  { r:1,c:1, label:'VP', eng:'True Pos.',  note:'✓',  bg:'rgba(16,185,129,0.18)', border:'#10b981', text:'#10b981' },
  { r:1,c:2, label:'FN', eng:'False Neg.', note:'✗',  bg:'rgba(244,63,94,0.15)',  border:'#f43f5e', text:'#f43f5e' },
  { r:2,c:1, label:'FP', eng:'False Pos.', note:'✗',  bg:'rgba(244,63,94,0.15)',  border:'#f43f5e', text:'#f43f5e' },
  { r:2,c:2, label:'VN', eng:'True Neg.',  note:'✓',  bg:'rgba(16,185,129,0.18)', border:'#10b981', text:'#10b981' },
]

/* ─── Formula steps ─── */
const FORMULAS = [
  { label:'Accuracy',         color:'#10b981', latex:'Accuracy = \\dfrac{VP+VN}{VP+VN+FP+FN}',      delay:0.3 },
  { label:'Precisión & Recall',color:'#6366f1',latex:'P=\\dfrac{VP}{VP+FP}\\quad R=\\dfrac{VP}{VP+FN}', delay:0.5 },
  { label:'F1-Score',          color:'#8b5cf6', latex:'F_1=\\dfrac{2PR}{P+R}',                        delay:0.7,
    note:'Media armónica de P y R — equilibra ambas métricas.' },
]

/* ─── Abbreviation table ─── */
const ABBREVS = [
  { sym:'VP', desc:'Real A → Pred A', color:'#10b981' },
  { sym:'VN', desc:'Real B → Pred B', color:'#10b981' },
  { sym:'FP', desc:'Real B → Pred A', color:'#f43f5e' },
  { sym:'FN', desc:'Real A → Pred B', color:'#f43f5e' },
]

export default function ConfusionMatrixSlide() {
  return (
    <div className="w-full h-full flex flex-col px-14 pt-14 pb-4 gap-5">

      {/* Title */}
      <motion.h2 initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }}
        className="text-4xl font-black gradient-text shrink-0">
        Matriz de Confusión y Métricas
      </motion.h2>

      {/* Two-column body — equal halves, vertically centered */}
      <div className="grid grid-cols-2 gap-10 flex-1 items-center min-h-0">

        {/* ── LEFT: abstract confusion matrix ─── */}
        <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }}
          transition={{ delay:0.1 }}
          className="flex flex-col items-center gap-4">

          <p className="text-xs text-slate-500 uppercase tracking-widest">← Predicción →</p>

          {/* Matrix grid — fixed pixel sizes so it never overflows */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'72px 118px 118px',
            gridTemplateRows:'38px 112px 112px',
            gap:'5px',
          }}>
            {/* corner */}
            <div className="flex items-end justify-end pr-1.5 pb-0.5">
              <span className="text-xs text-slate-600">Real ↓</span>
            </div>

            {/* col headers */}
            {['Pred A','Pred B'].map((lbl,i) => (
              <motion.div key={lbl}
                initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.2+i*0.08 }}
                className="flex items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  background: i===0?'rgba(16,185,129,0.14)':'rgba(244,63,94,0.12)',
                  color:      i===0?'#10b981':'#f43f5e',
                  border:`1px solid ${i===0?'rgba(16,185,129,0.35)':'rgba(244,63,94,0.3)'}`,
                }}>
                {lbl}
              </motion.div>
            ))}

            {/* row 1 header */}
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.32 }}
              className="flex items-center justify-center rounded-lg text-sm font-bold"
              style={{ background:'rgba(16,185,129,0.14)', color:'#10b981', border:'1px solid rgba(16,185,129,0.35)' }}>
              Real A
            </motion.div>

            {/* VP */}
            <motion.div initial={{ opacity:0, scale:0.78 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.42, type:'spring', stiffness:210, damping:16 }}
              className="flex flex-col items-center justify-center rounded-xl gap-0.5"
              style={{ background:CELLS[0].bg, border:`2px solid ${CELLS[0].border}` }}>
              <span className="text-4xl font-black" style={{ color:CELLS[0].text }}>{CELLS[0].label}</span>
              <span className="text-xs text-slate-400">{CELLS[0].eng}</span>
              <span className="text-xs font-semibold" style={{ color:CELLS[0].text }}>{CELLS[0].note} Correcto</span>
            </motion.div>

            {/* FN */}
            <motion.div initial={{ opacity:0, scale:0.78 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.52, type:'spring', stiffness:210, damping:16 }}
              className="flex flex-col items-center justify-center rounded-xl gap-0.5"
              style={{ background:CELLS[1].bg, border:`2px solid ${CELLS[1].border}` }}>
              <span className="text-4xl font-black" style={{ color:CELLS[1].text }}>{CELLS[1].label}</span>
              <span className="text-xs text-slate-400">{CELLS[1].eng}</span>
              <span className="text-xs font-semibold" style={{ color:CELLS[1].text }}>{CELLS[1].note} Error II</span>
            </motion.div>

            {/* row 2 header */}
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.58 }}
              className="flex items-center justify-center rounded-lg text-sm font-bold"
              style={{ background:'rgba(244,63,94,0.12)', color:'#f43f5e', border:'1px solid rgba(244,63,94,0.3)' }}>
              Real B
            </motion.div>

            {/* FP */}
            <motion.div initial={{ opacity:0, scale:0.78 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.63, type:'spring', stiffness:210, damping:16 }}
              className="flex flex-col items-center justify-center rounded-xl gap-0.5"
              style={{ background:CELLS[2].bg, border:`2px solid ${CELLS[2].border}` }}>
              <span className="text-4xl font-black" style={{ color:CELLS[2].text }}>{CELLS[2].label}</span>
              <span className="text-xs text-slate-400">{CELLS[2].eng}</span>
              <span className="text-xs font-semibold" style={{ color:CELLS[2].text }}>{CELLS[2].note} Error I</span>
            </motion.div>

            {/* VN */}
            <motion.div initial={{ opacity:0, scale:0.78 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.72, type:'spring', stiffness:210, damping:16 }}
              className="flex flex-col items-center justify-center rounded-xl gap-0.5"
              style={{ background:CELLS[3].bg, border:`2px solid ${CELLS[3].border}` }}>
              <span className="text-4xl font-black" style={{ color:CELLS[3].text }}>{CELLS[3].label}</span>
              <span className="text-xs text-slate-400">{CELLS[3].eng}</span>
              <span className="text-xs font-semibold" style={{ color:CELLS[3].text }}>{CELLS[3].note} Correcto</span>
            </motion.div>
          </div>

          {/* Abbreviation 2×2 grid */}
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.88 }}
            className="grid grid-cols-2 gap-2 w-full max-w-[316px]">
            {ABBREVS.map(a => (
              <div key={a.sym}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ background:`${a.color}12`, border:`1px solid ${a.color}38`, color:a.color }}>
                <span className="font-black text-sm">{a.sym}</span>
                <span className="text-slate-400 truncate">{a.desc}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT: formulas ─── */}
        <div className="flex flex-col gap-3 justify-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Métricas derivadas</p>

          {FORMULAS.map(f => (
            <motion.div key={f.label}
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:f.delay, duration:0.4 }}
              className="glass-card px-4 py-3"
              style={{ borderLeft:`4px solid ${f.color}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color:f.color }}>
                {f.label}
              </p>
              <div className="overflow-x-auto">
                <BlockMath math={f.latex} />
              </div>
              {f.note && <p className="text-xs text-slate-500 mt-1">{f.note}</p>}
            </motion.div>
          ))}

          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.9 }}
            className="rounded-xl px-4 py-3 text-xs text-slate-400 leading-relaxed"
            style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
            <span className="text-amber-400 font-bold">💡</span>{' '}
            En SOM, la clase predicha de <em>xᵢ</em> es la etiqueta de su neurona BMU.
            Un <span className="text-rose-400 font-semibold">FN/FP</span> ocurre
            cuando la BMU tiene etiqueta incorrecta o ambigua (empate).
          </motion.div>
        </div>

      </div>
    </div>
  )
}
