import { Request, Response } from 'express';
import { registerUser, loginUser } from '../db/dbClient.ts';

export async function handleRegister(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are syntactically required.' });
    }
    const result = await registerUser(email, password, name || 'Operator');
    if (result.success) {
      return res.json(result);
    }
    return res.status(400).json(result);
  } catch (error: any) {
    console.error('Controller registration failure:', error);
    return res.status(500).json({ success: false, message: `Registration controller crash: ${error.message}` });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password credentials required.' });
    }
    const result = await loginUser(email, password);
    if (result.success) {
      return res.json(result);
    }
    return res.status(401).json(result);
  } catch (error: any) {
    console.error('Controller login failure:', error);
    return res.status(500).json({ success: false, message: `Login controller crash: ${error.message}` });
  }
}
