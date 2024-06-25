import Button from './Button'
import { useTranslation } from 'react-i18next'

const RefundEmailSupport = ({ onRefundClick, onEmailSupportClick }) => {
  const { t } = useTranslation()
  return (
    <>
      <Button variant='outlined' size='large' onClick={onRefundClick}>
        {t('order_summary.request_refund')}
      </Button>
      <Button variant='outlined' size='large' onClick={onEmailSupportClick}>
        {t('order_info.email_support')}
      </Button>
    </>
  )
}

export default RefundEmailSupport
