import { X } from 'lucide-react'
import { C } from '../../styles/colors'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen, title, message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-sm"
        style={{ background: C.surface1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-2">
          <h3 className="text-base font-bold leading-snug pr-4" style={{ color: C.text }}>{title}</h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg transition-colors flex-shrink-0 hover:bg-opacity-10"
            style={{ color: C.label, background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = C.surface3)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>
        <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: C.textMuted }}>{message}</p>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors text-sm border"
            style={{ borderColor: C.border, color: C.textMuted, background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white transition-colors"
            style={{ background: C.red }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
