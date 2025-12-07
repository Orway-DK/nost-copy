'use server'

// Senin oluşturduğun server-client dosyasını import ediyoruz
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'

export async function getLocations() {
    try {
        const supabase = await createSupabaseServerClient()

        const { data, error } = await supabase
            .from('contact_locations')
            .select('*')
            .order('id', { ascending: true })

        // HATA VARSA TERMİNALE YAZDIR
        if (error) {
            console.error("SUPABASE HATASI:", error)
            throw new Error(error.message)
        }

        // VERİ BOŞ MU KONTROL ET
        console.log("ÇEKİLEN VERİ SAYISI:", data ? data.length : 0)

        return data
    } catch (err) {
        console.error("GENEL HATA:", err)
        return []
    }
}

// Yeni Ekle
export async function createLocation(formData: any) {
    const supabase = await createSupabaseServerClient()

    const payload = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
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
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
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