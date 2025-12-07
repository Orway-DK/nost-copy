'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'

// Verileri Getir
export async function getLocations() {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
        .from('contact_locations')
        .select('*')
        .order('id', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

// Yeni Ekle
export async function createLocation(formData: any) {
    const supabase = await createSupabaseServerClient()

    const payload = {
        title: formData.title,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        map_url: formData.map_url // YENİ EKLENDİ
    }

    const { error } = await supabase.from('contact_locations').insert([payload])

    if (error) return { error: error.message }
    revalidatePath('/admin/locations')
    return { success: true }
}

// Güncelle
export async function updateLocation(id: number, formData: any) {
    const supabase = await createSupabaseServerClient()

    const payload = {
        title: formData.title,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        map_url: formData.map_url // YENİ EKLENDİ
    }

    const { error } = await supabase
        .from('contact_locations')
        .update(payload)
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/locations')
    return { success: true }
}

// Sil
export async function deleteLocation(id: number) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from('contact_locations').delete().eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/locations')
    return { success: true }
}