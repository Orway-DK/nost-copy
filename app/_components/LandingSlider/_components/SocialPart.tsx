'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAppLoading } from '@/components/AppLoadingProvider'

import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa'
import { RiInstagramFill } from 'react-icons/ri'
import { BsYoutube } from 'react-icons/bs'
import { IconType } from 'react-icons'

const ICON_MAP: Record<string, IconType> = {
  facebook: FaFacebookF,
  instagram: RiInstagramFill,
  youtube: BsYoutube,
  linkedin: FaLinkedinIn
}

type SocialRow = {
  code: string
  url: string | null
}

const fetchSocialLinks = async (): Promise<SocialRow[]> => {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('site_social_links')
    .select('code,url,active')
    .eq('active', true)
    .order('sort', { ascending: true })

  if (error) throw error
  return (data ?? [])
    .filter(r => !!r.url)
    .map(r => ({ code: r.code.toLowerCase(), url: r.url as string }))
}

export default function SocialPart () {
  const { start, stop } = useAppLoading()

  const { data, isLoading, error } = useSWR<SocialRow[]>(
    'social-links',
    fetchSocialLinks,
    { revalidateOnFocus: false }
  )

  // --- LOADING INTEGRATION ---
  useEffect(() => {
    if (isLoading) start()
    else stop()
  }, [isLoading, start, stop])

  if (isLoading || error) return null

  const links = (data ?? []).filter(l => ICON_MAP[l.code])
  if (!links.length) return null

  return (
    <ul className='absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40'>
      {links.map(({ code, url }) => {
        const Icon = ICON_MAP[code]
        return (
          <li key={code} className='group'>
            <Link
              href={url || ''}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={code}
              className='w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center 
                border-2 border-blue-400 text-blue-500
                hover:text-white hover:bg-blue-400
                transition-all duration-300 shadow-sm bg-white/80 backdrop-blur-sm'
            >
              <Icon size={20} />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
