import { createHmac } from "node:crypto";
import { RequestHandler } from "express";
import bcrypt from 'bcryptjs';
import { Pool } from "pg";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret'; // Should be in env


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT)
});

pool.connect()
  .then(client => {
    console.log('Connected successfully');
    client.release();
  })
  .catch(err => {
    console.log('Environment Variables:', {
        DB_USER: process.env.DB_USER,
        DB_HOST: process.env.DB_HOST,
        DB_DATABASE: process.env.DB_DATABASE,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_PORT: process.env.DB_PORT
      });
    console.error('Connection failed:', err.stack);
  });

  // Define interfaces for better type safety
interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

interface DatabaseUser {
  id: number;
  email: string;
  password: string;
}


export const loginController: RequestHandler<unknown, LoginResponse, LoginRequestBody, unknown> = async (req, res, next): Promise<void> => {
    const { email = '', password = '' } = req.body || {};

    try {
        // Input validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        const userResult = await pool.query<DatabaseUser>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        const user = userResult.rows[0];
        
        // Use bcrypt to compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const usersController: RequestHandler<unknown, { success: boolean, secret: string; }, unknown, unknown> = (req, res, next) => {
    res.json({ success: true, secret: 'Success!!!' });
};

// Define interfaces for better type safety
interface SignupRequestBody {
  email: string;
  password: string;
  username: string;
}

interface SignupResponse {
  success: boolean;
  message?: string;
}

interface DatabaseUser {
  id: number;
  email: string;
  password: string;
  username: string;
}

export const signupController: RequestHandler<unknown, SignupResponse, SignupRequestBody, unknown> = async (req, res, next): Promise<void> => {
    const { email = '', password = '', username = '' } = req.body || {};

    try {
        // Input validation
        if (!email || !password || !username) {
            res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
            return;
        }

        // Password strength validation
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
            return;
        }

        // Check if user exists
        const userResult = await pool.query<DatabaseUser>(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userResult.rows.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Email or username already exists'
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const insertResult = await pool.query<DatabaseUser>(
            'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *',
            [email, hashedPassword, username]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


interface AuthenticatedRequest extends Request {
  user?: { userId: number };
}

export const addPolicyController: RequestHandler = async (req, res, next) => {
  const { title, description, category, date, academic_year } = req.body;

  const owner = (req as unknown as AuthenticatedRequest).user?.userId;

  if (!owner) {
    res.status(400).json({ success: false, message: 'User ID is missing' });
  }
  
  try {
    const formattedDate = new Date(date * 1000).toISOString();

    const newPolicy = await pool.query(
      'INSERT INTO policies (title, description, category, owner, date, votes, academic_year) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, category, owner, formattedDate, 0, academic_year || new Date().getFullYear()]
    );

    res.json({ success: true, policy: newPolicy.rows[0] });
  } catch (err) {
    console.error('Error adding policy:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPoliciesByAcademicYearController: RequestHandler<unknown, { success: boolean; policies?: any; message?: string; }, unknown, unknown> = async (req, res, next) => {
  try {
    const policiesByYear = await pool.query(
      `
      SELECT academic_year, json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'description', description,
          'owner', owner,
          'date', date,
          'category', category
        )
      ) AS policies
      FROM policies
      GROUP BY academic_year
      ORDER BY academic_year DESC;
      `
    );

    res.json({
      success: true,
      policies: policiesByYear.rows
    });
  } catch (err) {
    console.error('Error fetching policies by academic year:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const upvotePolicyController: RequestHandler = async (req, res, next) => {
  const { policyId } = req.params;
  
  const userId = (req as unknown as AuthenticatedRequest).user?.userId;
  
  if (!userId) {
    res.status(400).json({ success: false, message: 'User ID is missing' });
  }

  try {
    // Check if the user has already voted
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE policy_id = $1 AND user_id = $2',
      [policyId, userId]
    );

    if (existingVote.rows.length > 0) {
      res.status(400).json({ success: false, message: 'User has already voted' });
      return;
    }

    // Insert the vote
    await pool.query(
      'INSERT INTO votes (policy_id, user_id, vote_type) VALUES ($1, $2, $3)',
      [policyId, userId, 'upvote']
    );

    // Update the policy's vote count
    await pool.query(
      'UPDATE policies SET votes = votes + 1 WHERE id = $1',
      [policyId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error upvoting policy:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const downvotePolicyController: RequestHandler = async (req, res, next) => {
  const { policyId } = req.params;
  const userId = (req as unknown as AuthenticatedRequest).user?.userId;

  if (!userId) {
    res.status(400).json({ success: false, message: 'User ID is missing' });
  }

  try {
    // Check if the user has already voted
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE policy_id = $1 AND user_id = $2',
      [policyId, userId]
    );

    if (existingVote.rows.length > 0) {
      res.status(400).json({ success: false, message: 'User has already voted' });
      return;
    }

    // Insert the vote
    await pool.query(
      'INSERT INTO votes (policy_id, user_id, vote_type) VALUES ($1, $2, $3)',
      [policyId, userId, 'downvote']
    );

    // Update the policy's vote count
    await pool.query(
      'UPDATE policies SET votes = votes - 1 WHERE id = $1',
      [policyId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error downvoting policy:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPolicyVotesController: RequestHandler<{ policyId: string }, { success: boolean; upvotes?: number; downvotes?: number; message?: string }, unknown, unknown> = async (req, res, next) => {
  const { policyId } = req.params;

  try {
    const upvotesResult = await pool.query(
      'SELECT COUNT(*) AS upvotes FROM votes WHERE policy_id = $1 AND vote_type = $2',
      [policyId, 'upvote']
    );

    const downvotesResult = await pool.query(
      'SELECT COUNT(*) AS downvotes FROM votes WHERE policy_id = $1 AND vote_type = $2',
      [policyId, 'downvote']
    );

    res.json({
      success: true,
      upvotes: parseInt(upvotesResult.rows[0].upvotes, 10),
      downvotes: parseInt(downvotesResult.rows[0].downvotes, 10)
    });
  } catch (err) {
    console.error('Error fetching policy votes:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};