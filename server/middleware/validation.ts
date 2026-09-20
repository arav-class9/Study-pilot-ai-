import { Request, Response, NextFunction } from 'express';

export class ValidationError extends Error {
  public statusCode: number;
  public details?: Record<string, string>;

  constructor(message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

/**
 * Express Middleware helper that wraps endpoint handlers and catches validation errors.
 */
export function validateRequest(
  validatorFn: (req: Request) => void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validatorFn(req);
      next();
    } catch (err: any) {
      if (err instanceof ValidationError) {
        return res.status(err.statusCode).json({
          success: false,
          error: err.message,
          details: err.details,
          code: 'VALIDATION_ERROR',
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Invalid request parameters.',
        code: 'BAD_REQUEST',
      });
    }
  };
}

// ==========================================
// VALIDATION HELPERS & PRIMITIVES
// ==========================================

export function validateNonEmptyString(
  value: any,
  fieldName: string,
  options: { minLength?: number; maxLength?: number } = {}
): string {
  const { minLength = 1, maxLength = 10000 } = options;

  if (value === undefined || value === null) {
    throw new ValidationError(`Field '${fieldName}' is required.`);
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`Field '${fieldName}' must be a string.`);
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new ValidationError(
      `Field '${fieldName}' must contain at least ${minLength} character(s).`
    );
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `Field '${fieldName}' exceeds maximum allowed length of ${maxLength} characters.`
    );
  }

  return trimmed;
}

export function validateOptionalString(
  value: any,
  fieldName: string,
  options: { maxLength?: number; fallback?: string } = {}
): string | undefined {
  const { maxLength = 10000, fallback } = options;

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`Field '${fieldName}' must be a string if provided.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `Field '${fieldName}' exceeds maximum allowed length of ${maxLength} characters.`
    );
  }

  return trimmed || fallback;
}

export function validateBoundedNumber(
  value: any,
  fieldName: string,
  options: { min?: number; max?: number; fallback?: number; integerOnly?: boolean } = {}
): number {
  const { min, max, fallback, integerOnly = false } = options;

  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new ValidationError(`Field '${fieldName}' is required.`);
  }

  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`Field '${fieldName}' must be a valid number.`);
  }

  if (integerOnly && !Number.isInteger(num)) {
    throw new ValidationError(`Field '${fieldName}' must be an integer.`);
  }

  if (min !== undefined && num < min) {
    throw new ValidationError(`Field '${fieldName}' must be at least ${min}.`);
  }

  if (max !== undefined && num > max) {
    throw new ValidationError(`Field '${fieldName}' cannot exceed ${max}.`);
  }

  return num;
}

export function validateClassLevel(value: any, fallback: string = '10'): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const strVal = String(value).trim();
  const validLevels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  if (!validLevels.includes(strVal)) {
    throw new ValidationError(
      `Invalid classLevel '${strVal}'. Supported class levels are 1 through 12.`
    );
  }
  return strVal;
}

export function validateEnum<T extends string>(
  value: any,
  fieldName: string,
  allowedValues: readonly T[],
  fallback?: T
): T {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new ValidationError(`Field '${fieldName}' is required.`);
  }

  const strVal = String(value).trim();
  if (!allowedValues.includes(strVal as T)) {
    throw new ValidationError(
      `Invalid ${fieldName} '${strVal}'. Allowed values: ${allowedValues.join(', ')}.`
    );
  }

  return strVal as T;
}

export function validateArray(
  value: any,
  fieldName: string,
  options: { minItems?: number; maxItems?: number; itemType?: 'string' | 'object' } = {}
): any[] {
  const { minItems = 0, maxItems = 100, itemType = 'string' } = options;

  let arr: any[] = [];
  if (typeof value === 'string') {
    arr = value.split('\n').map((s) => s.trim()).filter(Boolean);
  } else if (Array.isArray(value)) {
    arr = value;
  } else if (value === undefined || value === null) {
    arr = [];
  } else {
    throw new ValidationError(`Field '${fieldName}' must be an array or multi-line text.`);
  }

  if (arr.length < minItems) {
    throw new ValidationError(
      `Field '${fieldName}' must contain at least ${minItems} item(s).`
    );
  }

  if (arr.length > maxItems) {
    throw new ValidationError(
      `Field '${fieldName}' cannot contain more than ${maxItems} items.`
    );
  }

  if (itemType === 'string') {
    return arr.map((item, idx) => {
      if (typeof item !== 'string' && typeof item !== 'number') {
        throw new ValidationError(`Item at index ${idx} in '${fieldName}' must be a string.`);
      }
      return String(item).trim();
    });
  }

  return arr;
}

export function validateObject(value: any, fieldName: string, fallback: Record<string, any> = {}): Record<string, any> {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`Field '${fieldName}' must be a valid key-value object.`);
  }

  return value;
}
