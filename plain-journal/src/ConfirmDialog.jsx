import BottomSheet from './BottomSheet.jsx'

function ConfirmDialog({ open, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <BottomSheet open={open} onClose={onCancel}>
      <p className="confirm-message">{message}</p>

      <button type="button" className="confirm-button confirm-destructive" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="confirm-button confirm-cancel" onClick={onCancel}>
        Cancel
      </button>
    </BottomSheet>
  )
}

export default ConfirmDialog
