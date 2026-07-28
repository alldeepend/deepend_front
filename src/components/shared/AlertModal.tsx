import { X } from 'lucide-react'
import { C } from '../../styles/colors'

interface AlertModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
}

export default function AlertModal({
  isOpen, title, message,
  confirmLabel = 'Aceptar',
  onConfirm,
}: AlertModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onConfirm}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-sm"
        style={{ background: C.surface1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-2">
          <h3 className="text-base font-bold leading-snug pr-4" style={{ color: C.text }}>{title}</h3>
          <button
            onClick={onConfirm}
            className="p-1 rounded-lg transition-colors flex-shrink-0 hover:bg-opacity-10"
            style={{ color: C.label, background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = C.surface3)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>
        <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: C.textMuted }}>{message}</p>
        <div className="px-6 pb-6">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 rounded-xl font-bold text-sm text-white transition-colors"
            style={{ background: C.red }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
