import React from 'react'
import { useTranslation } from 'react-i18next'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SUPPORTED_LANGUAGES } from '@/app/config/constants'

const LANGUAGE_LABELS: Record<string, { label: string; short: string }> = {
  fr: { label: 'Français', short: 'FR' },
  en: { label: 'English', short: 'EN' },
}

interface LanguageSwitcherProps {
  className?: string
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
}) => {
  const { i18n } = useTranslation()

  const currentLang = i18n.language?.split('-')[0] ?? 'fr'
  const current = LANGUAGE_LABELS[currentLang] ?? LANGUAGE_LABELS['fr']

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium',
            'text-gray-600 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'transition-colors duration-150',
            'outline-none data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-700',
            className
          )}
          title="Changer la langue"
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold tracking-wide">
            {current!.short}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 transition-transform duration-150 [[data-state=open]_&]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            'min-w-[140px] rounded-md shadow-md z-[9999]',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'py-1',
            'animate-in fade-in-0 zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const info = LANGUAGE_LABELS[lang]
            if (!info) return null
            const isActive = currentLang === lang

            return (
              <DropdownMenu.Item
                key={lang}
                onSelect={() => changeLanguage(lang)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer outline-none',
                  'transition-colors duration-100',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-medium'
                    : 'text-gray-700 dark:text-gray-200',
                  !isActive &&
                    'focus:bg-gray-50 dark:focus:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <span className="w-5 text-xs font-semibold text-gray-400 dark:text-gray-500 shrink-0">
                  {info.short}
                </span>
                <span className="flex-1">{info.label}</span>
                {isActive && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}


