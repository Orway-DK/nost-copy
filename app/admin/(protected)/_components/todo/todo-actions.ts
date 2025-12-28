'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'

const PATH = '/admin' // Dashboard path'i

// Yeni Görev Ekle
export async function addTodoAction(task: string) {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('admin_todos')
    .insert({ task, is_completed: false })
    
  if (error) return { success: false, message: error.message }
  
  revalidatePath(PATH)
  return { success: true }
}

// Durum Değiştir (Yapıldı/Yapılmadı)
export async function toggleTodoAction(id: number, currentStatus: boolean) {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('admin_todos')
    .update({ is_completed: !currentStatus })
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  
  revalidatePath(PATH)
  return { success: true }
}

// Görev Sil
export async function deleteTodoAction(id: number) {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('admin_todos')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  
  revalidatePath(PATH)
  return { success: true }
}