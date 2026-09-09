import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrashIcon } from '@heroicons/react/24/outline'
import { deleteEntry } from './storage.js'
import ConfirmDialog from './ConfirmDialog.jsx'

function snippetFor(text) {
  const firstLine = text.split('\n')[0]
  if (firstLine.length <= 80) {
    return firstLine
  }
  return firstLine.slice(0, 80) + '…'
}

function EntryCard({ entry, onDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleDeleteClick(e) {
    e.preventDefault()
    e.stopPropagation()
    setConfirmOpen(true)
  }

  async function handleConfirm() {
    await deleteEntry(entry.id)
    setConfirmOpen(false)
    onDeleted(entry.id)
  }

  return (
    <>
      <Link to={`/entry/${entry.id}`} className="entry-card">
        <div className="entry-card-text">
          <p className="entry-card-ts">{entry.ts.replace('T', ' ')}</p>
          <p className="entry-card-snippet">{snippetFor(entry.text)}</p>
        </div>

        <button type="button" className="entry-card-delete" onClick={handleDeleteClick} aria-label="Delete entry">
          <TrashIcon className="entry-card-delete-icon" />
        </button>
      </Link>

      <ConfirmDialog
        open={confirmOpen}
        message="Really want to delete this entry?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

export default EntryCard
