'use client'

import { useState, useRef } from 'react'
import { 
  IoAdd, 
  IoTrash, 
  IoCheckmarkCircle, 
  IoEllipseOutline, 
  IoList,
  IoChevronDown,
  IoChevronForward 
} from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { addTodoAction, toggleTodoAction, deleteTodoAction } from './todo-actions'

interface TodoItem {
  id: number
  task: string
  is_completed: boolean
}

export default function DashboardTodoList({ initialTodos }: { initialTodos: TodoItem[] }) {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos)
  const [showCompleted, setShowCompleted] = useState(false) // Tamamlananları göster/gizle state'i
  const formRef = useRef<HTMLFormElement>(null)

  // Listeyi ikiye ayırıyoruz
  const activeTodos = todos.filter(t => !t.is_completed)
  const completedTodos = todos.filter(t => t.is_completed)

  // --- ACTIONS ---
  const handleAdd = async (formData: FormData) => {
    const task = formData.get('task') as string
    if (!task?.trim()) return

    const tempId = Date.now()
    const newTodo = { id: tempId, task, is_completed: false }
    
    // Yeni eklenen her zaman aktiftir, en üste gelir
    setTodos([newTodo, ...todos])
    formRef.current?.reset()

    const res = await addTodoAction(task)
    if (!res.success) {
      toast.error('Hata oluştu')
      setTodos(prev => prev.filter(t => t.id !== tempId))
    }
  }

  const handleToggle = async (id: number, status: boolean) => {
    // UI Update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !status } : t))
    await toggleTodoAction(id, status)
  }

  const handleDelete = async (id: number) => {
    if(!confirm("Bu görevi silmek istiyor musunuz?")) return

    setTodos(prev => prev.filter(t => t.id !== id))
    await deleteTodoAction(id)
    toast.success("Görev silindi")
  }

  // --- REUSABLE ROW ITEM ---
  const TodoItemRow = ({ item }: { item: TodoItem }) => (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg border transition-all group mb-2
        ${item.is_completed 
          ? 'bg-admin-input-bg border-transparent opacity-60' 
          : 'bg-admin-card border-admin-card-border hover:border-admin-accent'}
      `}
    >
      <div 
          className='flex items-center gap-3 cursor-pointer flex-1 select-none'
          onClick={() => handleToggle(item.id, item.is_completed)}
      >
        {item.is_completed ? (
          <IoCheckmarkCircle className='text-admin-success text-xl shrink-0' />
        ) : (
          <IoEllipseOutline className='text-admin-muted text-xl shrink-0 group-hover:text-admin-accent' />
        )}
        <span className={`text-sm ${item.is_completed ? 'line-through text-admin-muted' : 'text-admin-fg font-medium'}`}>
          {item.task}
        </span>
      </div>
      
      <button
        onClick={() => handleDelete(item.id)}
        className='text-admin-muted hover:text-admin-danger p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100'
        title="Sil"
      >
        <IoTrash />
      </button>
    </div>
  )

  return (
    <div className='card-admin h-full flex flex-col min-h-[400px]'>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 border-b border-admin-card-border pb-2">
        <h3 className='text-lg font-bold text-admin-fg flex items-center gap-2'>
            <IoList className="text-admin-accent" />
            Notlarım
        </h3>
        <span className="text-xs font-bold text-admin-muted bg-admin-input-bg px-2 py-1 rounded">
            {activeTodos.length} Bekleyen
        </span>
      </div>

      {/* EKLEME FORMU */}
      <form ref={formRef} action={handleAdd} className='flex gap-2 mb-4'>
        <input
          name="task"
          className='admin-input flex-1'
          placeholder='Yeni görev ekle...'
          autoComplete="off"
        />
        <button type='submit' className='btn-admin btn-admin-primary px-3'>
          <IoAdd size={20} />
        </button>
      </form>

      {/* LİSTE ALANI */}
      <div className='flex-1 overflow-y-auto pr-1 custom-scrollbar'>
        
        {/* --- 1. TAMAMLANANLAR DROPDOWN (EN ÜSTTE) --- */}
        {completedTodos.length > 0 && (
          <div className="mb-4">
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-xs font-bold text-admin-muted hover:text-admin-fg transition-colors w-full p-2 rounded hover:bg-admin-input-bg select-none"
            >
              {showCompleted ? <IoChevronDown /> : <IoChevronForward />}
              <span>Tamamlananlar ({completedTodos.length})</span>
            </button>

            {showCompleted && (
              <div className="mt-2 pl-2 border-l-2 border-admin-input-border animate-in slide-in-from-top-2 fade-in duration-200">
                {completedTodos.map(todo => (
                  <TodoItemRow key={todo.id} item={todo} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- 2. AKTİF GÖREVLER --- */}
        <div className="space-y-2">
           {activeTodos.length === 0 && completedTodos.length === 0 && (
              <div className='flex flex-col items-center justify-center h-40 text-admin-muted opacity-50 text-sm'>
                <p>Listeniz boş.</p>
                <p>Harika gidiyorsun! 🎉</p>
              </div>
           )}

           {activeTodos.length === 0 && completedTodos.length > 0 && (
              <p className="text-center text-xs text-admin-muted py-4">
                 Tüm işler tamamlandı! ☕
              </p>
           )}

           {activeTodos.map(todo => (
             <TodoItemRow key={todo.id} item={todo} />
           ))}
        </div>

      </div>
    </div>
  )
}