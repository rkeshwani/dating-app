import { Request, Response, NextFunction } from 'express';

const ADMIN_EMAILS = ['rohit.keshwani@gmail.com'];

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user) {
        const user = req.user as any;
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
            return next();
        }
    }

    res.status(403).json({ message: 'Forbidden: Admin access only' });
};
