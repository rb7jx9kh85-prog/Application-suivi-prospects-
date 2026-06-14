import React, { useState, useEffect } from 'react'

let _add = null
export function toast(msg, type = 'ok') {
  _add?.({ id: Date.now(), msg, type })
}

export default function Toast() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    _add = (t) => {
      setToasts(p => [...p, t])
      setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3200)
    }
    return () => { _add = null }
  }, [])

  return (
    <div id="toasts">
      {toasts.map(t => (
        <div key={t.id} className={`toast t-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  )
}
