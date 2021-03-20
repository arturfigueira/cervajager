import winston from "winston";
import "winston-daily-rotate-file";

/**
 * Logger wrapper
 */
export default class Logger {
  private static rotationTransport = new winston.transports.DailyRotateFile({
    filename: "cervajager-cli-%DATE%.log",
    dirname: "./logs",
    level: "info",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "20d",
  });

  private static transports = {
    rotationAll: Logger.rotationTransport,
  };

  private static _instance = winston.createLogger({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple(),
      winston.format.timestamp({
        format: "DD-MM-YYYY-hh-MM-ss",
      }),
      winston.format.printf((info) => {
        return `[${info.timestamp}] ${info.level} : ${info.message}`;
      })
    ),
    transports: [Logger.transports.rotationAll],
    exitOnError: false,
  });

  /**
   * Get a prepared, default, Logger instance
   * This method will always return the same instance during
   * a runtime.
   */
  public static getInstance(): winston.Logger {
    return Logger._instance;
  }

  /**
   * Enable debug mode for the Logger instance
   */
  public static enableDebug = (): void => {
    Logger.transports.rotationAll.level = "debug";
  };

  /**
   * Intercept any info, warn, error, and debug calls to
   * console and throw it all into our current
   * Logger.
   */
  public static interceptConsole(): void {
    console.info = (...args: any) =>
      Logger._instance.info.call(Logger._instance, ...args);
    console.warn = (...args: any) =>
      Logger._instance.warn.call(Logger._instance, ...args);
    console.error = (...args: any) =>
      Logger._instance.error.call(Logger._instance, ...args);
    console.debug = (...args: any) =>
      Logger._instance.debug.call(Logger._instance, ...args);
  }
}
