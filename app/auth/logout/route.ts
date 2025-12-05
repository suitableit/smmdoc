import { signOut } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.redirect(new URL("/", request.url));
    
    response.cookies.set('impersonated-user-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('original-admin-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    await signOut({
      redirectTo: "/"
    });
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const errorResponse = NextResponse.redirect(new URL("/?error=failed_logout", request.url));
    
    errorResponse.cookies.set('impersonated-user-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    errorResponse.cookies.set('original-admin-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return errorResponse;
  }
} 