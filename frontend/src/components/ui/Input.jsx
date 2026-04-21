import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  maxLength,
  className = '',
  hint,
  success,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)

  const hasError = touched && error
  const hasSuccess = touched && !error && value && success

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            color: hasError ? 'var(--danger)' : 'var(--text)',
            marginBottom: 6,
            transition: 'color 0.15s'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => {
            setFocused(false)
            onBlur?.(name)
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className="input"
          style={{
            borderColor: hasError 
              ? 'var(--danger)' 
              : hasSuccess 
                ? 'var(--success)' 
                : focused 
                  ? 'var(--primary)' 
                  : 'var(--border)',
            boxShadow: focused 
              ? hasError 
                ? '0 0 0 3px rgba(239,68,68,0.12)'
                : '0 0 0 3px rgba(91,94,244,0.12)'
              : 'none',
            paddingRight: (type === 'password' || hasError || hasSuccess) ? 40 : 14
          }}
          {...props}
        />

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Error icon */}
        {hasError && type !== 'password' && (
          <div style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--danger)'
          }}>
            <AlertCircle size={16} />
          </div>
        )}

        {/* Success icon */}
        {hasSuccess && type !== 'password' && (
          <div style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--success)'
          }}>
            <Check size={16} />
          </div>
        )}
      </div>

      {/* Character count */}
      {maxLength && value && (
        <div style={{
          fontSize: 12,
          color: value.length > maxLength * 0.9 ? 'var(--warning)' : 'var(--text-secondary)',
          textAlign: 'right',
          marginTop: 4
        }}>
          {value.length}/{maxLength}
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <div style={{
          fontSize: 12,
          color: 'var(--danger)',
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      {/* Hint */}
      {hint && !hasError && (
        <div style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginTop: 4
        }}>
          {hint}
        </div>
      )}
    </div>
  )
}