/**
 * Internationalization Formatting Helpers
 * Provides locale-aware formatting for dates, currency, and numbers
 */

/**
 * Format date according to locale
 * @param date - Date to format
 * @param locale - Locale (es or en)
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
    date: Date | string,
    locale: string = 'es',
    options?: Intl.DateTimeFormatOptions
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format date and time according to locale
 * @param date - Date to format
 * @param locale - Locale (es or en)
 */
export function formatDateTime(
    date: Date | string,
    locale: string = 'es'
): string {
    return formatDate(date, locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format short date according to locale
 * @param date - Date to format
 * @param locale - Locale (es or en)
 */
export function formatShortDate(
    date: Date | string,
    locale: string = 'es'
): string {
    return formatDate(date, locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

/**
 * Format currency according to locale
 * @param amount - Amount to format
 * @param currency - Currency code (USD, EUR, etc.)
 * @param locale - Locale (es or en)
 */
export function formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'es'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

/**
 * Format number according to locale
 * @param value - Number to format
 * @param locale - Locale (es or en)
 * @param options - Intl.NumberFormatOptions
 */
export function formatNumber(
    value: number,
    locale: string = 'es',
    options?: Intl.NumberFormatOptions
): string {
    return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format percentage according to locale
 * @param value - Value to format (0.15 = 15%)
 * @param locale - Locale (es or en)
 */
export function formatPercentage(
    value: number,
    locale: string = 'es'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Get relative time string (e.g., "hace 2 días", "2 days ago")
 * @param date - Date to compare
 * @param locale - Locale (es or en)
 */
export function formatRelativeTime(
    date: Date | string,
    locale: string = 'es'
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffMinutes < 1) {
        return locale === 'es' ? 'ahora mismo' : 'just now';
    } else if (diffMinutes < 60) {
        return rtf.format(-diffMinutes, 'minute');
    } else if (diffHours < 24) {
        return rtf.format(-diffHours, 'hour');
    } else if (diffDays < 30) {
        return rtf.format(-diffDays, 'day');
    } else {
        return formatShortDate(dateObj, locale);
    }
}
