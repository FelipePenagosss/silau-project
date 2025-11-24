import { supabase } from '../../config/supabase';
import { User, UserCreateDTO, UserResponse } from './user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
  private tableName = 'User';
  private saltRounds = 10;

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data as User;
  }

  async getUserById(id: number): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data as User;
  }

  async createUser(userData: UserCreateDTO): Promise<UserResponse> {
    // Validar email único
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.saltRounds
    );

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          email: userData.email,
          password: hashedPassword,
        },
      ])
      .select('id, email, created_at')
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return data as UserResponse;
  }

  async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  generateToken(userId: number, email: string): string {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign(
      {
        userId,
        email,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return token;
  }

  verifyToken(token: string): { userId: number; email: string } | null {
    try {
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const decoded = jwt.verify(token, jwtSecret) as {
        userId: number;
        email: string;
      };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  sanitizeUser(user: User): UserResponse {
    return {
      id: user.id!,
      email: user.email,
      created_at: user.created_at!,
    };
  }
}
