import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard, FileText, Ruler, ArrowRight } from 'lucide-react';
import { BADGE_FORMATS, BADGE_FORMAT_LIST, BadgeFormat } from '../../shared/types/badge.types';
import { PageContainer, PageHeader, PageSection, Button, Card, CardContent } from '@/shared/ui';

type SelectionMode = 'preset' | 'custom';

export const BadgeFormatSelector: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['badges', 'common']);

  const [selectedFormatKey, setSelectedFormatKey] = useState<string | null>(null);
  const [mode, setMode] = useState<SelectionMode>('preset');
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const badgeFormats = BADGE_FORMAT_LIST.filter(f => f.category === 'badge');
  const paperFormats = BADGE_FORMAT_LIST.filter(f => f.category === 'paper');

  const handleSelectPreset = (key: string) => {
    setSelectedFormatKey(key);
    setMode('preset');
  };

  const handleConfirm = () => {
    let format: BadgeFormat;

    if (mode === 'custom') {
      const w = orientation === 'portrait' ? customWidth : customHeight;
      const h = orientation === 'portrait' ? customHeight : customWidth;
      format = {
        width: w,
        height: h,
        name: `${w}×${h}mm`,
        category: 'custom',
      };
    } else {
      if (!selectedFormatKey) return;
      const preset = BADGE_FORMATS[selectedFormatKey as keyof typeof BADGE_FORMATS];
      format = { ...preset };
    }

    navigate('/badges/designer/new', { state: { format } });
  };

  const isValid =
    mode === 'custom'
      ? customWidth >= 20 && customWidth <= 500 && customHeight >= 20 && customHeight <= 500
      : selectedFormatKey !== null;

  const getPreviewDimensions = () => {
    const maxPreviewH = 160;
    let w: number, h: number;

    if (mode === 'custom') {
      w = orientation === 'portrait' ? customWidth : customHeight;
      h = orientation === 'portrait' ? customHeight : customWidth;
    } else if (selectedFormatKey) {
      const preset = BADGE_FORMATS[selectedFormatKey as keyof typeof BADGE_FORMATS];
      w = preset.width;
      h = preset.height;
    } else {
      return { width: 80, height: maxPreviewH };
    }

    const scale = maxPreviewH / h;
    return { width: Math.round(w * scale), height: maxPreviewH };
  };

  const preview = getPreviewDimensions();

  return (
    <PageContainer maxWidth="5xl" padding="lg">
      <PageHeader
        title={t('badges:format_selector.title')}
        description={t('badges:format_selector.description')}
        icon={CreditCard}
        actions={
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/badges')}
          >
            {t('badges:designer.go_back')}
          </Button>
        }
      />

      <PageSection spacing="lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: format selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badge formats */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('badges:format_selector.category_badges')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badgeFormats.map((fmt) => (
                  <button
                    key={fmt.key}
                    onClick={() => handleSelectPreset(fmt.key)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      mode === 'preset' && selectedFormatKey === fmt.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 flex-shrink-0"
                        style={{
                          width: `${Math.round((fmt.width / Math.max(fmt.width, fmt.height)) * 36)}px`,
                          height: `${Math.round((fmt.height / Math.max(fmt.width, fmt.height)) * 36)}px`,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fmt.name.split('(')[0].trim()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {fmt.width} × {fmt.height} mm
                        </p>
                      </div>
                    </div>
                    {mode === 'preset' && selectedFormatKey === fmt.key && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper formats */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('badges:format_selector.category_paper')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paperFormats.map((fmt) => (
                  <button
                    key={fmt.key}
                    onClick={() => handleSelectPreset(fmt.key)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      mode === 'preset' && selectedFormatKey === fmt.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 flex-shrink-0"
                        style={{
                          width: `${Math.round((fmt.width / Math.max(fmt.width, fmt.height)) * 36)}px`,
                          height: `${Math.round((fmt.height / Math.max(fmt.width, fmt.height)) * 36)}px`,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fmt.name.split('(')[0].trim()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {fmt.width} × {fmt.height} mm
                        </p>
                      </div>
                    </div>
                    {mode === 'preset' && selectedFormatKey === fmt.key && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom format */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                {t('badges:format_selector.category_custom')}
              </h3>
              <div
                onClick={() => { setMode('custom'); setSelectedFormatKey(null); }}
                className={`p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  mode === 'custom'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  {t('badges:format_selector.custom_label')}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t('badges:format_selector.width_mm')}
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={500}
                      value={customWidth}
                      onChange={(e) => { setCustomWidth(Number(e.target.value)); setMode('custom'); setSelectedFormatKey(null); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t('badges:format_selector.height_mm')}
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={500}
                      value={customHeight}
                      onChange={(e) => { setCustomHeight(Number(e.target.value)); setMode('custom'); setSelectedFormatKey(null); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t('badges:format_selector.orientation')}
                  </span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOrientation('portrait'); }}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        orientation === 'portrait'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t('badges:format_selector.portrait')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOrientation('landscape'); }}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        orientation === 'landscape'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t('badges:format_selector.landscape')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: preview + confirm */}
          <div className="space-y-6">
            <Card variant="elevated" className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  {t('badges:format_selector.preview')}
                </h3>

                {/* Visual preview */}
                <div className="flex items-center justify-center mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg" style={{ minHeight: '200px' }}>
                  <div
                    className="bg-white dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500 rounded shadow-inner transition-all duration-300"
                    style={{
                      width: `${preview.width}px`,
                      height: `${preview.height}px`,
                      maxWidth: 'none',
                    }}
                  />
                </div>

                {/* Dimensions info */}
                <div className="text-center mb-6">
                  {mode === 'custom' ? (
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {orientation === 'portrait' ? customWidth : customHeight} × {orientation === 'portrait' ? customHeight : customWidth} mm
                    </p>
                  ) : selectedFormatKey ? (
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {BADGE_FORMATS[selectedFormatKey as keyof typeof BADGE_FORMATS].name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('badges:format_selector.select_prompt')}
                    </p>
                  )}
                </div>

                {/* Confirm button */}
                <Button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  className="w-full"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {t('badges:format_selector.confirm')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageSection>
    </PageContainer>
  );
};
