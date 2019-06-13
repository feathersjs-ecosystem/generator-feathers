import { Request, Response, NextFunction } from 'express';

export default function (options = {}) {
  return function <%= camelName %>(req: Request, res: Response, next: NextFunction) {
    console.log('<%= name %> middleware is running');
    next();
  };
}
