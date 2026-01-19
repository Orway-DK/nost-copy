'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import { FiSave, FiUpload, FiTrash2, FiPlus } from 'react-icons/fi'

const languages = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' }
]

export default function FooterAdminPage () {
  const { lang, setLang } = useLanguage()
  const [activeLang, setActiveLang] = useState(lang)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // UI text translations
  const uiText = {
    footerManagement: activeLang === 'tr' ? 'Footer Yönetimi' : activeLang === 'en' ? 'Footer Management' : 'Footer-Verwaltung',
    footerDescription: activeLang === 'tr' ? 'Footer içeriğini düzenleyin ve dil bazlı ayarlayın.' : activeLang === 'en' ? 'Manage footer content and configure language-based settings.' : 'Footer-Inhalt verwalten und sprachbasierte Einstellungen konfigurieren.',
    save: activeLang === 'tr' ? 'Kaydet' : activeLang === 'en' ? 'Save' : 'Speichern',
    saving: activeLang === 'tr' ? 'Kaydediliyor...' : activeLang === 'en' ? 'Saving...' : 'Speichern...',
    firstColumn: activeLang === 'tr' ? 'Birinci Kolon (Logo & Sosyal Medya)' : activeLang === 'en' ? 'First Column (Logo & Social Media)' : 'Erste Spalte (Logo & Soziale Medien)',
    logo: activeLang === 'tr' ? 'Logo' : activeLang === 'en' ? 'Logo' : 'Logo',
    logoUploadDesc: activeLang === 'tr' ? 'PNG, JPG, SVG (max 2MB)' : activeLang === 'en' ? 'PNG, JPG, SVG (max 2MB)' : 'PNG, JPG, SVG (max 2MB)',
    uploadLogo: activeLang === 'tr' ? 'Logo Yükle' : activeLang === 'en' ? 'Upload Logo' : 'Logo hochladen',
    companyDescription: activeLang === 'tr' ? 'Firma Açıklaması' : activeLang === 'en' ? 'Company Description' : 'Firmenbeschreibung',
    descriptionPlaceholder: activeLang === 'tr' ? 'Firmanız hakkında kısa bir açıklama...' : activeLang === 'en' ? 'A brief description about your company...' : 'Eine kurze Beschreibung Ihres Unternehmens...',
    descriptionHint: activeLang === 'tr' ? 'Bu metin footer\'da logo altında görünecektir.' : activeLang === 'en' ? 'This text will appear below the logo in the footer.' : 'Dieser Text erscheint unter dem Logo im Footer.',
    socialLinks: activeLang === 'tr' ? 'Sosyal Medya Linkleri' : activeLang === 'en' ? 'Social Media Links' : 'Social-Media-Links',
    columnsAndLinks: activeLang === 'tr' ? 'Kolonlar ve Linkler' : activeLang === 'en' ? 'Columns and Links' : 'Spalten und Links',
    addNewColumn: activeLang === 'tr' ? 'Yeni Kolon Ekle' : activeLang === 'en' ? 'Add New Column' : 'Neue Spalte hinzufügen',
    newColumn: activeLang === 'tr' ? 'Yeni Kolon' : activeLang === 'en' ? 'New Column' : 'Neue Spalte',
    addNewLink: activeLang === 'tr' ? 'Yeni Link Ekle' : activeLang === 'en' ? 'Add New Link' : 'Neuen Link hinzufügen',
    linkText: activeLang === 'tr' ? 'Link metni' : activeLang === 'en' ? 'Link text' : 'Link-Text',
    linkUrl: activeLang === 'tr' ? 'Link URL' : activeLang === 'en' ? 'Link URL' : 'Link-URL',
    delete: activeLang === 'tr' ? 'Sil' : activeLang === 'en' ? 'Delete' : 'Löschen',
    saveHint: activeLang === 'tr' ? 'Değişiklikleri kaydetmek için yukarıdaki "Kaydet" butonuna tıklayın.' : activeLang === 'en' ? 'Click the "Save" button above to save changes.' : 'Klicken Sie oben auf die Schaltfläche "Speichern", um Änderungen zu speichern.',
    languageHint: activeLang === 'tr' ? 'Her dil için ayrı ayrı ayar yapabilirsiniz.' : activeLang === 'en' ? 'You can configure settings separately for each language.' : 'Sie können Einstellungen für jede Sprache separat konfigurieren.',
    sortOrder: activeLang === 'tr' ? 'Sıra' : activeLang === 'en' ? 'Order' : 'Reihenfolge',
    urlPlaceholder: activeLang === 'tr' ? '/ornek-url' : activeLang === 'en' ? '/example-url' : '/beispiel-url'
  }

  // State for first column
  const [logo, setLogo] = useState('')
  const [description, setDescription] = useState('')
  const [socialLinks, setSocialLinks] = useState([
    { platform: 'facebook', url: '' },
    { platform: 'instagram', url: '' },
    { platform: 'twitter', url: '' },
    { platform: 'linkedin', url: '' }
  ])

  // State for columns
  const [columns, setColumns] = useState<any[]>([])

  // Load data on mount and when activeLang changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const supabase = createSupabaseBrowserClient()
        
        // 1. Load footer settings
        const { data: settings } = await supabase
          .from('footer_settings')
          .select('*')
          .limit(1)
          .maybeSingle()
        
        if (settings) {
          setLogo(settings.logo_url || '')
          setDescription(settings.description?.[activeLang] || settings.description?.['tr'] || '')
          if (settings.social_links && Array.isArray(settings.social_links)) {
            setSocialLinks(settings.social_links)
          }
        }
        
        // 2. Load columns with translations and links
        const { data: columnsData } = await supabase
          .from('footer_columns')
          .select(`
            id,
            sort_order,
            footer_column_translations (
              title,
              lang_code
            ),
            footer_column_links (
              id,
              sort_order,
              url,
              footer_column_link_translations (
                text,
                lang_code
              )
            )
          `)
          .order('sort_order', { ascending: true })
        
        if (columnsData) {
          const formattedColumns = columnsData.map((col: any) => {
            const colTranslation = col.footer_column_translations?.find((t: any) => t.lang_code === activeLang) ||
                                  col.footer_column_translations?.find((t: any) => t.lang_code === 'en') ||
                                  col.footer_column_translations?.[0]
            
            const links = col.footer_column_links?.map((link: any) => {
              const linkTranslation = link.footer_column_link_translations?.find((t: any) => t.lang_code === activeLang) ||
                                    link.footer_column_link_translations?.find((t: any) => t.lang_code === 'en') ||
                                    link.footer_column_link_translations?.[0]
              
              return {
                id: link.id,
                text: linkTranslation?.text || '',
                url: link.url || '',
                sort_order: link.sort_order || 0
              }
            }) || []
            
            return {
              id: col.id,
              title: colTranslation?.title || `Kolon ${col.id}`,
              links: links
            }
          })
          
          setColumns(formattedColumns)
        }
      } catch (error) {
        console.error('Load error:', error)
        setMessage('Veri yüklenirken hata oluştu.')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [activeLang])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const supabase = createSupabaseBrowserClient()
      
      // 1. Save footer settings
      const { error: settingsError } = await supabase
        .from('footer_settings')
        .upsert({
          id: 1,
          logo_url: logo,
          description: { [activeLang]: description },
          social_links: socialLinks
        })
      
      if (settingsError) throw new Error(`Settings error: ${settingsError.message}`)
      
      // 2. Delete existing columns and links (cascade will handle translations)
      // First get current column IDs
      const { data: existingColumns } = await supabase
        .from('footer_columns')
        .select('id')
      
      if (existingColumns && existingColumns.length > 0) {
        const { error: deleteError } = await supabase
          .from('footer_columns')
          .delete()
          .in('id', existingColumns.map((c: any) => c.id))
        
        if (deleteError) throw new Error(`Delete error: ${deleteError.message}`)
      }
      
      // 3. Save columns and links
      for (const column of columns) {
        // Insert column
        const { data: newColumn, error: columnError } = await supabase
          .from('footer_columns')
          .insert({ sort_order: column.id })
          .select('id')
          .single()
        
        if (columnError) throw new Error(`Column error: ${columnError.message}`)
        
        // Insert column translation
        const { error: colTransError } = await supabase
          .from('footer_column_translations')
          .insert({
            column_id: newColumn.id,
            lang_code: activeLang,
            title: column.title
          })
        
        if (colTransError) throw new Error(`Column translation error: ${colTransError.message}`)
        
        // Insert links
        for (const link of column.links) {
          const { data: newLink, error: linkError } = await supabase
            .from('footer_column_links')
            .insert({
              column_id: newColumn.id,
              sort_order: link.id,
              url: link.url
            })
            .select('id')
            .single()
          
          if (linkError) throw new Error(`Link error: ${linkError.message}`)
          
          // Insert link translation
          const { error: linkTransError } = await supabase
            .from('footer_column_link_translations')
            .insert({
              link_id: newLink.id,
              lang_code: activeLang,
              text: link.text
            })
          
          if (linkTransError) throw new Error(`Link translation error: ${linkTransError.message}`)
        }
      }
      
      setMessage('Ayarlar başarıyla kaydedildi!')
    } catch (error: any) {
      console.error('Save error:', error)
      setMessage(`Hata: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddColumn = () => {
    const newId = columns.length > 0 ? Math.max(...columns.map((c: any) => c.id)) + 1 : 1
    setColumns([
      ...columns,
      {
        id: newId,
        title: 'Yeni Kolon',
        links: []
      }
    ])
  }

  const handleDeleteColumn = (id: number) => {
    setColumns(columns.filter((c: any) => c.id !== id))
  }

  const handleAddLink = (columnId: number) => {
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        const newLinkId = column.links.length > 0 ? Math.max(...column.links.map((l: any) => l.id)) + 1 : 1
        return {
          ...column,
          links: [...column.links, { id: newLinkId, text: 'Yeni Link', url: '/', sort_order: 0 }]
        }
      }
      return column
    }))
  }

  const handleDeleteLink = (columnId: number, linkId: number) => {
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          links: column.links.filter((l: any) => l.id !== linkId)
        }
      }
      return column
    }))
  }

  const handleLinkChange = (columnId: number, linkId: number, field: 'text' | 'url' | 'sort_order', value: string | number) => {
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          links: column.links.map((link: any) => {
            if (link.id === linkId) {
              return { ...link, [field]: value }
            }
            return link
          })
        }
      }
      return column
    }))
  }

  const handleColumnTitleChange = (columnId: number, value: string) => {
    setColumns(columns.map((column: any) => {
      if (column.id === columnId) {
        return { ...column, title: value }
      }
      return column
    }))
  }

  return (
    <div className='p-6 md:p-10 w-full overflow-y-auto max-h-screen'>
      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>{uiText.footerManagement}</h1>
          <p className='text-muted-foreground'>{uiText.footerDescription}</p>
        </div>
        <div className='flex items-center gap-4'>
          {/* Language Switcher */}
          <div className='flex bg-muted rounded-lg p-1'>
            {languages.map(l => (
              <button
                key={l.code}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeLang === l.code ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className='flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50'
          >
            <FiSave />
            {saving ? uiText.saving : uiText.save}
          </button>
        </div>
      </div>

      {message && (
        <div className='mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg'>
          {message}
        </div>
      )}

      {/* First Column Settings */}
      <div className='bg-card border border-border rounded-2xl p-6 mb-8'>
        <h2 className='text-xl font-bold mb-6 text-foreground'>{uiText.firstColumn}</h2>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Logo Upload */}
          <div>
            <label className='block text-sm font-medium mb-2'>{uiText.logo}</label>
            <div className='border-2 border-dashed border-border rounded-xl p-8 text-center'>
              <FiUpload className='mx-auto text-3xl text-muted-foreground mb-4' />
              <p className='text-sm text-muted-foreground mb-4'>{uiText.logoUploadDesc}</p>
              <button className='px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium'>
                {uiText.uploadLogo}
              </button>
              {logo && (
                <div className='mt-4'>
                  <img src={logo} alt='Logo' className='h-16 mx-auto' />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className='lg:col-span-2'>
            <label className='block text-sm font-medium mb-2'>{uiText.companyDescription}</label>
            <textarea
              className='w-full h-40 p-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.descriptionPlaceholder}
            />
            <p className='text-xs text-muted-foreground mt-2'>{uiText.descriptionHint}</p>
          </div>
        </div>

        {/* Social Links */}
        <div className='mt-8'>
          <label className='block text-sm font-medium mb-4'>{uiText.socialLinks}</label>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {socialLinks.map((social, idx) => (
              <div key={idx} className='border border-border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-medium capitalize'>{social.platform}</span>
                  <span className='text-xs bg-muted px-2 py-1 rounded'>URL</span>
                </div>
                <input
                  type='text'
                  className='w-full p-2 bg-background border border-border rounded text-sm'
                  placeholder={`https://${social.platform}.com/username`}
                  value={social.url}
                  onChange={(e) => {
                    const newLinks = [...socialLinks]
                    newLinks[idx].url = e.target.value
                    setSocialLinks(newLinks)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Columns Management */}
      <div className='bg-card border border-border rounded-2xl p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-foreground'>{uiText.columnsAndLinks}</h2>
          <button
            onClick={handleAddColumn}
            className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium'
          >
            <FiPlus />
            {uiText.addNewColumn}
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {columns.map(column => (
            <div key={column.id} className='border border-border rounded-xl p-6'>
              <div className='flex justify-between items-center mb-4'>
                <input
                  type='text'
                  className='text-lg font-bold bg-transparent border-b border-transparent focus:border-primary focus:outline-none w-full'
                  value={column.title}
                  onChange={(e) => handleColumnTitleChange(column.id, e.target.value)}
                  placeholder={uiText.newColumn}
                />
                <button
                  onClick={() => handleDeleteColumn(column.id)}
                  className='text-red-500 hover:text-red-700 p-2'
                  title={uiText.delete}
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className='space-y-3'>
                {column.links.map((link: any) => (
                  <div key={link.id} className='flex items-center gap-2 p-3 bg-background rounded-lg border border-border'>
                    <div className='flex-1'>
                      <div className='flex gap-2 mb-1'>
                        <input
                          type='number'
                          className='w-16 bg-transparent text-sm focus:outline-none border border-border rounded px-2 py-1'
                          value={link.sort_order}
                          onChange={(e) => handleLinkChange(column.id, link.id, 'sort_order', parseInt(e.target.value) || 0)}
                          placeholder={uiText.sortOrder}
                          min='0'
                          max='999'
                        />
                        <input
                          type='text'
                          className='flex-1 bg-transparent text-sm focus:outline-none'
                          value={link.text}
                          onChange={(e) => handleLinkChange(column.id, link.id, 'text', e.target.value)}
                          placeholder={uiText.linkText}
                        />
                      </div>
                      <input
                        type='text'
                        className='w-full bg-transparent text-xs text-muted-foreground focus:outline-none'
                        value={link.url}
                        onChange={(e) => handleLinkChange(column.id, link.id, 'url', e.target.value)}
                        placeholder={uiText.urlPlaceholder}
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteLink(column.id, link.id)}
                      className='text-red-400 hover:text-red-600 p-1'
                      title={uiText.delete}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddLink(column.id)}
                className='w-full mt-4 py-2 border border-dashed border-border text-muted-foreground hover:text-foreground rounded-lg text-sm'
              >
                + {uiText.addNewLink}
              </button>
            </div>
          ))}
        </div>

        <div className='mt-8 text-center text-sm text-muted-foreground'>
          <p>{uiText.saveHint}</p>
          <p className='mt-1'>{uiText.languageHint}</p>
        </div>
      </div>
    </div>
  )
}
