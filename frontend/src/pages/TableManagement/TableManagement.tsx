import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { apiService } from '../../services/api'
import type { TableResponse, CreateTableRequest, UpdateTableRequest } from '../../services/api'
import './TableManagement.css'

const TableManagement = () => {
  const [tables, setTables] = useState<TableResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [draggedTable, setDraggedTable] = useState<TableResponse | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    xPosition: 100,
    yPosition: 100,
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setLoading(true)
    try {
      const data = await apiService.getTables()
      setTables(data)
    } catch (error) {
      toast.error('Failed to fetch tables')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (table: TableResponse) => {
    setDraggedTable(table)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    
    if (!draggedTable) return

    const floorPlan = e.currentTarget as HTMLElement
    const rect = floorPlan.getBoundingClientRect()
    
    const tableWidth = draggedTable.width ?? 100
    const tableHeight = draggedTable.height ?? 100
    
    const newX = Math.max(0, Math.min(e.clientX - rect.left - tableWidth / 2, rect.width - tableWidth))
    const newY = Math.max(0, Math.min(e.clientY - rect.top - tableHeight / 2, rect.height - tableHeight))

    // Update local state immediately for instant feedback
    setTables(prevTables => 
      prevTables.map(t => 
        t.id === draggedTable.id 
          ? { ...t, xPosition: newX, yPosition: newY }
          : t
      )
    )

    const updateData: UpdateTableRequest = {
      xPosition: newX,
      yPosition: newY,
    }

    try {
      await apiService.updateTable(draggedTable.id, updateData)
      toast.success('Table position updated')
      // Refresh from server to ensure consistency
      await fetchTables()
    } catch (error) {
      toast.error('Failed to update table position')
      console.error(error)
      // Revert local change on error
      await fetchTables()
    }

    setDraggedTable(null)
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tableNumber || !formData.capacity) {
      toast.error('Please fill in all required fields')
      return
    }

    const newTable: CreateTableRequest = {
      tableNumber: parseInt(formData.tableNumber),
      capacity: parseInt(formData.capacity),
      xPosition: formData.xPosition,
      yPosition: formData.yPosition,
      width: 100,
      height: 100,
    }

    setLoading(true)
    try {
      await apiService.createTable(newTable)
      toast.success('Table created successfully')
      setShowAddModal(false)
      setFormData({ tableNumber: '', capacity: '', xPosition: 100, yPosition: 100 })
      fetchTables()
    } catch (error) {
      toast.error('Failed to create table')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTable = async (id: number) => {
    if (!confirm('Are you sure you want to delete this table?')) {
      return
    }

    setLoading(true)
    try {
      await apiService.deleteTable(id)
      toast.success('Table deleted successfully')
      fetchTables()
    } catch (error) {
      toast.error('Failed to delete table')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  console.log("Table uri sunt : ", tables);
  return (
    <div className="table-management-page">
      <div className="container">
        <div className="header">
          <h1>Table Management</h1>
          <button onClick={() => setShowAddModal(true)} className="add-table-btn">
            + Add Table
          </button>
        </div>

        {loading && <p>Loading...</p>}

        <div className="management-content">
          <div
            className="floor-plan-editor"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="floor-plan-instructions">
              Drag tables to reposition them
            </div>
            {tables.map((table) => (
              <div
                key={table.id}
                draggable
                onDragStart={() => handleDragStart(table)}
                className="draggable-table"
                style={{
                  left: `${table.xposition ?? 100}px`,
                  top: `${table.yposition ?? 100}px`,
                  width: `${table.width ?? 100}px`,
                  height: `${table.height ?? 100}px`,
                }}
              >
                <div className="table-info">
                  <span className="table-number">#{table.tableNumber}</span>
                  <span className="table-capacity">{table.capacity} seats</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTable(table.id)
                  }}
                  className="delete-table-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="tables-list">
            <h2>All Tables</h2>
            <div className="tables-grid">
              {tables.map((table) => (
                <div key={table.id} className="table-card">
                  <h3>Table #{table.tableNumber}</h3>
                  <p>Capacity: {table.capacity} people</p>
                  <p>Position: ({Math.round(table.xposition ?? 0)}, {Math.round(table.yposition ?? 0)})</p>
                  <p>Status: {table.active ? '✅ Active' : '❌ Inactive'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Table</h2>
            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label>Table Number *</label>
                <input
                  type="number"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Adding...' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableManagement
