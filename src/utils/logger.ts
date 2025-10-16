/**
 * Système de logging centralisé pour l'application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry = this.formatMessage(level, message, data);

    // En développement, afficher dans la console
    if (this.isDevelopment) {
      const style = this.getConsoleStyle(level);
      console.log(
        `%c[${level.toUpperCase()}]%c ${entry.timestamp} - ${message}`,
        style,
        'color: inherit',
        data ?? ''
      );
    }

    // En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      this.sendToMonitoring(entry);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #888; font-weight: bold',
      info: 'color: #3b82f6; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
    };
    return styles[level];
  }

  private sendToMonitoring(entry: LogEntry): void {
    // TODO: Intégrer avec Sentry ou autre service de monitoring
    // Pour l'instant, on stocke juste localement
    try {
      const logs = JSON.parse(localStorage.getItem('galpha_logs') || '[]');
      logs.push(entry);
      // Garder seulement les 100 derniers logs
      if (logs.length > 100) {
        logs.shift();
      }
      localStorage.setItem('galpha_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown): void {
    this.log('error', message, error);
  }

  // Méthodes utilitaires
  clearLogs(): void {
    localStorage.removeItem('galpha_logs');
    this.info('Logs cleared');
  }

  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('galpha_logs') || '[]');
    } catch {
      return [];
    }
  }

  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}

export const logger = new Logger();
