import { motion } from 'framer-motion'

export default function EmptyState({ 
  icon = '📭',
  title = 'Нет данных',
  description = 'Здесь пока ничего нет',
  action,
  size = 'md' // 'sm', 'md', 'lg'
}) {
  const sizes = {
    sm: {
      container: 'var(--space-12)',
      icon: 'var(--text-3xl)',
      title: 'var(--text-lg)',
      description: 'var(--text-sm)'
    },
    md: {
      container: 'var(--space-20)',
      icon: 'var(--text-5xl)',
      title: 'var(--text-xl)',
      description: 'var(--text-base)'
    },
    lg: {
      container: 'var(--space-24)',
      icon: '72px',
      title: 'var(--text-2xl)',
      description: 'var(--text-lg)'
    }
  }

  const currentSize = sizes[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: currentSize.container,
        maxWidth: '400px',
        margin: '0 auto'
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          fontSize: currentSize.icon,
          marginBottom: 'var(--space-4)',
          opacity: 0.8
        }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-heading-3"
        style={{
          fontSize: currentSize.title,
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: 'var(--space-2)'
        }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={{
          fontSize: currentSize.description,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: action ? 'var(--space-6)' : 0,
          maxWidth: '300px'
        }}
      >
        {description}
      </motion.p>

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

// Предустановленные варианты
export const EmptyVacancies = ({ action }) => (
  <EmptyState
    icon="💼"
    title="Вакансий не найдено"
    description="Попробуйте изменить параметры поиска или создать новую вакансию"
    action={action}
  />
)

export const EmptyApplications = ({ action }) => (
  <EmptyState
    icon="📋"
    title="Нет откликов"
    description="Вы еще не откликались на вакансии. Найдите подходящую работу!"
    action={action}
  />
)

export const EmptyNotifications = () => (
  <EmptyState
    icon="🔔"
    title="Нет уведомлений"
    description="Все уведомления появятся здесь"
    size="sm"
  />
)

export const EmptyChat = () => (
  <EmptyState
    icon="💬"
    title="Нет сообщений"
    description="Начните диалог — напишите первое сообщение"
    size="sm"
  />
)

export const EmptySearch = ({ query, action }) => (
  <EmptyState
    icon="🔍"
    title="Ничего не найдено"
    description={`По запросу "${query}" ничего не найдено. Попробуйте другие ключевые слова.`}
    action={action}
  />
)