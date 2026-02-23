import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('auth')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('privacy_policy.back')}
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy_policy.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('privacy_policy.last_updated', { date: new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-8 transition-colors duration-200">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_1_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_1_content')}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_2_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {t('privacy_policy.section_2_content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('privacy_policy.section_2_item_1')}</li>
              <li>{t('privacy_policy.section_2_item_2')}</li>
              <li>{t('privacy_policy.section_2_item_3')}</li>
              <li>{t('privacy_policy.section_2_item_4')}</li>
              <li>{t('privacy_policy.section_2_item_5')}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_3_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {t('privacy_policy.section_3_content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('privacy_policy.section_3_item_1')}</li>
              <li>{t('privacy_policy.section_3_item_2')}</li>
              <li>{t('privacy_policy.section_3_item_3')}</li>
              <li>{t('privacy_policy.section_3_item_4')}</li>
              <li>{t('privacy_policy.section_3_item_5')}</li>
              <li>{t('privacy_policy.section_3_item_6')}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_4_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_4_content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li><strong>{t('privacy_policy.section_4_item_1_label')}</strong> : {t('privacy_policy.section_4_item_1_text')}</li>
              <li><strong>{t('privacy_policy.section_4_item_2_label')}</strong> : {t('privacy_policy.section_4_item_2_text')}</li>
              <li><strong>{t('privacy_policy.section_4_item_3_label')}</strong> : {t('privacy_policy.section_4_item_3_text')}</li>
              <li><strong>{t('privacy_policy.section_4_item_4_label')}</strong> : {t('privacy_policy.section_4_item_4_text')}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_5_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_5_content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li>{t('privacy_policy.section_5_item_1')}</li>
              <li>{t('privacy_policy.section_5_item_2')}</li>
              <li>{t('privacy_policy.section_5_item_3')}</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_6_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_6_content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li><strong>{t('privacy_policy.section_6_item_1_label')}</strong> : {t('privacy_policy.section_6_item_1_text')}</li>
              <li><strong>{t('privacy_policy.section_6_item_2_label')}</strong> : {t('privacy_policy.section_6_item_2_text')}</li>
              <li><strong>{t('privacy_policy.section_6_item_3_label')}</strong> : {t('privacy_policy.section_6_item_3_text')}</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_7_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {t('privacy_policy.section_7_content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>{t('privacy_policy.section_7_item_1_label')}</strong> : {t('privacy_policy.section_7_item_1_text')}</li>
              <li><strong>{t('privacy_policy.section_7_item_2_label')}</strong> : {t('privacy_policy.section_7_item_2_text')}</li>
              <li><strong>{t('privacy_policy.section_7_item_3_label')}</strong> : {t('privacy_policy.section_7_item_3_text')}</li>
              <li><strong>{t('privacy_policy.section_7_item_4_label')}</strong> : {t('privacy_policy.section_7_item_4_text')}</li>
              <li><strong>{t('privacy_policy.section_7_item_5_label')}</strong> : {t('privacy_policy.section_7_item_5_text')}</li>
              <li><strong>{t('privacy_policy.section_7_item_6_label')}</strong> : {t('privacy_policy.section_7_item_6_text')}</li>
              <li><strong>{t('privacy_policy.section_7_item_7_label')}</strong> : {t('privacy_policy.section_7_item_7_text')}</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              {t('privacy_policy.section_7_footer')} <strong>{t('privacy_policy.section_7_contact_email')}</strong>
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_8_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_8_content')}
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_9_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_9_content')}
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_10_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_10_content')}
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy_policy.section_11_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy_policy.section_11_content')}
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <p className="text-gray-700 dark:text-gray-300"><strong>{t('privacy_policy.section_11_email_label')}</strong> {t('privacy_policy.section_11_email')}</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2"><strong>{t('privacy_policy.section_11_address_label')}</strong> {t('privacy_policy.section_11_address')}</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2"><strong>{t('privacy_policy.section_11_phone_label')}</strong> {t('privacy_policy.section_11_phone')}</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              {t('privacy_policy.section_11_footer')}
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
