import { AppError } from '../errors/AppError.js';

export function errorHandler(err, _req, res, _next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        message: 'Datos de entrada inválidos',
        code: 'VALIDATION_ERROR',
        details: err.errors?.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  console.error('[Error]', err);

  return res.status(500).json({
    error: {
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    },
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
