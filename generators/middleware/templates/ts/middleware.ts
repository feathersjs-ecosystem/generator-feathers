import { Request, Response, NextFunction } from 'express';

export default () => {
  return <%= camelName %>(req: Request, res: Response, next: NextFunction) => {
    next();
  };
}
