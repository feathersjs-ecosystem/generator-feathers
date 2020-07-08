import { Request, Response, NextFunction } from 'express';

export default () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}
