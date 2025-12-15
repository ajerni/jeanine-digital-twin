import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { valid: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Get password hash from environment variable
    const passwordHash = process.env.CHAT_PASSWORD_HASH;

    // Debug logging
    console.log('=== Password Validation Debug ===');
    console.log('Hash exists:', !!passwordHash);
    console.log('Hash length:', passwordHash?.length);
    console.log('Hash first 10 chars:', passwordHash?.substring(0, 10));
    console.log('Hash last 10 chars:', passwordHash?.substring(passwordHash.length - 10));
    console.log('Password length:', password.length);

    if (!passwordHash) {
      console.error('CHAT_PASSWORD_HASH environment variable not set');
      return NextResponse.json(
        { valid: false, message: 'Password authentication not configured' },
        { status: 500 }
      );
    }

    // Check if password matches the hash
    console.log('Comparing password with hash...');
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('Comparison result:', isValid);

    if (isValid) {
      return NextResponse.json({
        valid: true,
        message: 'Access granted',
      });
    } else {
      return NextResponse.json({
        valid: false,
        message: 'Invalid password',
      });
    }
  } catch (error) {
    console.error('Error in password validation:', error);
    return NextResponse.json(
      { valid: false, message: 'Password validation failed' },
      { status: 500 }
    );
  }
}

